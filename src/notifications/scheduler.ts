import * as Notifications from 'expo-notifications';
import type { UserSettings } from '../types';
import { isTodayGratitudeDone } from '../db/queries';
import { today, localDateString } from '../db/database';

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

    // Per-day DATE triggers (not DAILY/WEEKLY) so a time that's already
    // passed today is simply skipped instead of firing immediately as a
    // same-day catch-up. Covers the next 7 days; re-runs on each app
    // launch to stay current.
    const skipWeekends = settings.weekendMode && WEEKEND_REDUCED.has(cfg.slot);
    for (let d = 0; d < 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      date.setHours(hour, minute, 0, 0);
      if (date <= now) continue;
      const dow = date.getDay(); // 0 = Sun, 6 = Sat
      if (skipWeekends && (dow === 0 || dow === 6)) continue;
      await Notifications.scheduleNotificationAsync({
        content,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
          channelId: cfg.channelId,
        },
      });
    }
  }
}

export async function snoozeAffirmationNotification(
  settings: UserSettings,
  slot: 'anchor1' | 'anchor2' | 'anchor3' = 'anchor1',
): Promise<void> {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') return;

  const channelId = slot === 'anchor1' ? 'morning-affirmation'
    : slot === 'anchor3' ? 'evening-affirmation'
    : 'midday-affirmation';

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Ready when you are',
      body: 'Affirmation is still waiting.',
      data: { slot },
      sound: settings.sound === 'silent' ? false : settings.sound,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3600,
      channelId,
    },
  });
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function clearAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.dismissAllNotificationsAsync();
}

// Dismisses delivered notifications that are stale or superseded:
//   - Any notification from a previous calendar day.
//   - Anchor notifications from an earlier slot when a newer one has fired.
//     (e.g. if anchor2 has fired, anchor1 is evicted from the tray.)
// Gratitude notifications are left alone — they stay until the user acts or midnight rolls over.
// Safe to call on every foreground transition; errors are swallowed.
export async function cleanupNotifications(settings: UserSettings): Promise<void> {
  try {
    const presented = await Notifications.getPresentedNotificationsAsync();
    if (!presented.length) return;

    const todayStr = today();
    const toMins = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
    const nowMins = new Date().getHours() * 60 + new Date().getMinutes();

    const currentAnchorSlot =
      nowMins >= toMins(settings.scheduleAnchor3) ? 'anchor3' :
      nowMins >= toMins(settings.scheduleAnchor2) ? 'anchor2' :
      nowMins >= toMins(settings.scheduleAnchor1) ? 'anchor1' :
      null;

    const toRemove = presented.filter(n => {
      if (localDateString(new Date(n.date * 1000)) !== todayStr) return true;
      const slot = n.request.content.data?.slot as string | undefined;
      if (slot === 'anchor1' || slot === 'anchor2' || slot === 'anchor3') {
        if (currentAnchorSlot === null) return false; // before first anchor: keep all
        return slot !== currentAnchorSlot;
      }
      return false;
    });

    await Promise.all(
      toRemove.map(n => Notifications.dismissNotificationAsync(n.request.identifier)),
    );
  } catch { /* best-effort — must not throw */ }
}
