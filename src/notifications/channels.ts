import * as Notifications from 'expo-notifications';

type SoundSetting = 'bell' | 'chime' | 'silent';

export async function setupChannels(sound: SoundSetting = 'bell') {
  const channelSound = sound === 'silent' ? null : sound;

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
