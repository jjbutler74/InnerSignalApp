import * as Notifications from 'expo-notifications';

export async function setupChannels() {
  await Notifications.setNotificationChannelAsync('morning-affirmation', {
    name: 'Morning affirmation',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#9CAE85',
  });
  await Notifications.setNotificationChannelAsync('midday-affirmation', {
    name: 'Midday affirmation',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D4A24C',
  });
  await Notifications.setNotificationChannelAsync('evening-affirmation', {
    name: 'Evening affirmation',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#C97B5B',
  });
  await Notifications.setNotificationChannelAsync('gratitude-prompt', {
    name: 'Gratitude prompt',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 400, 200, 400],
    lightColor: '#2C3E50',
  });
}
