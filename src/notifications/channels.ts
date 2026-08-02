import * as Notifications from 'expo-notifications';

type SoundSetting = 'bell' | 'chime' | 'silent';

const CHANNEL_IDS = [
  'morning-affirmation',
  'midday-affirmation',
  'evening-affirmation',
  'gratitude-prompt',
] as const;

export async function setupChannels(sound: SoundSetting = 'bell') {
  const channelSound = sound === 'silent' ? null : sound;

  // Android treats channel sound as write-once — delete channels first so the
  // new sound actually takes effect (a no-op when the channel doesn't exist yet).
  await Promise.all(CHANNEL_IDS.map(id => Notifications.deleteNotificationChannelAsync(id)));

  await Notifications.setNotificationChannelAsync('morning-affirmation', {
    name: 'Morning affirmation',
    importance: Notifications.AndroidImportance.HIGH,
    sound: channelSound,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#9CAE85',
  });
  await Notifications.setNotificationChannelAsync('midday-affirmation', {
    name: 'Midday affirmation',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: channelSound,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#A8956B',
  });
  await Notifications.setNotificationChannelAsync('evening-affirmation', {
    name: 'Evening affirmation',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: channelSound,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#CC6B49',
  });
  await Notifications.setNotificationChannelAsync('gratitude-prompt', {
    name: 'Gratitude prompt',
    importance: Notifications.AndroidImportance.HIGH,
    sound: channelSound,
    vibrationPattern: [0, 400, 200, 400],
    lightColor: '#2C3E50',
  });
}
