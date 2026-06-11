import * as Notifications from 'expo-notifications';
import type { UserSettings } from '../types';
import { isTodayGratitudeDone } from '../db/queries';

type SlotConfig = {
  time: string;
  channelId: string;
  title: string;
  body: string;
  slot: string;
};

const SLOTS: ((s: UserSettings) => SlotConfig)[] = [
  s => ({
    time: s.scheduleAnchor1,
    channelId: 'morning-affirmation',
    title: 'Good morning',
    body: 'Morning affirmation is ready.',
    slot: 'anchor1',
  }),
  s => ({
    time: s.scheduleAnchor2,
    channelId: 'midday-affirmation',
    title: 'Midday pause',
    body: 'A moment for you.',
    slot: 'anchor2',
  }),
  s => ({
    time: s.scheduleAnchor3,
    channelId: 'evening-affirmation',
    title: 'Evening reflection',
    body: "Today's affirmation awaits.",
    slot: 'anchor3',
  }),
  s => ({
    time: s.scheduleGratitude,
    channelId: 'gratitude-prompt',
    title: 'Evening gratitude',
    body: 'What landed today?',
    slot: 'gratitude',
  }),
];

function parseHHMM(hhmm: string): { hour: number; minute: number } {
  const [h, m] = hhmm.split(':').map(Number);
  return { hour: h, minute: m };
}

function isInQuietHours(
  hhmm: string,
  start: string | null,
  end: string | null,
): boolean {
  if (!start || !end) return false;
  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  const t = toMins(hhmm);
  const s = toMins(start);
  const e = toMins(end);
  return s > e ? t >= s || t < e : t >= s && t < e;
}

// anchor2 + anchor3 are skipped on weekends when weekendMode is on
const WEEKEND_REDUCED = new Set(['anchor2', 'anchor3']);
// Mon–Fri in Expo's 1-indexed weekday system (1=Sun … 7=Sat)
const WEEKDAYS = [2, 3, 4, 5, 6] as const;

export async function scheduleAllNotifications(settings: UserSettings): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.cancelAllScheduledNotificationsAsync();

  const gratitudeDoneToday = await isTodayGratitudeDone();
  const now = new Date();

  for (const slotFn of SLOTS) {
    const cfg = slotFn(settings);

    if (isInQuietHours(cfg.time, settings.quietHoursStart, settings.quietHoursEnd)) {
      continue;
    }

    const { hour, minute } = parseHHMM(cfg.time);
    const content = {
      title: cfg.title,
      body: cfg.body,
      data: { slot: cfg.slot },
      sound: settings.sound === 'silent' ? false : settings.sound,
    };

    if (cfg.slot === 'gratitude') {
      // Use per-day DATE triggers so we can skip today if already done.
      // Covers the next 7 days; re-runs on each app launch to stay current.
      for (let d = 0; d < 7; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        date.setHours(hour, minute, 0, 0);
        if (d === 0 && (gratitudeDoneToday || date <= now)) continue;
        if (date <= now) continue;
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date,
            channelId: cfg.channelId,
          },
        });
      }
      continue;
    }

    if (settings.weekendMode && WEEKEND_REDUCED.has(cfg.slot)) {
      for (const weekday of WEEKDAYS) {
        await Notifications.scheduleNotificationAsync({
          content,
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
            channelId: cfg.channelId,
          },
        });
      }
    } else {
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: cfg.channelId,
        },
      });
    }
  }
}

export async function snoozeAffirmationNotification(settings: UserSettings): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ready when you are',
      body: 'Affirmation is still waiting.',
      data: { slot: 'anchor1' },
      sound: settings.sound === 'silent' ? false : settings.sound,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3600,
      channelId: 'midday-affirmation',
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
