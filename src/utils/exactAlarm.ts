import { Linking, Platform } from 'react-native';

// Android 12+ requires this special access before expo-notifications can
// fire daily anchors at their exact scheduled time; without it the OS
// silently downgrades to inexact delivery, which gets delayed/batched and
// often only flushes once the app is reopened. There's no JS API to check
// current grant state, so callers just open the system picker — granting
// again when already allowed is a no-op.
export async function openExactAlarmSettings(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    await Linking.sendIntent('android.settings.REQUEST_SCHEDULE_EXACT_ALARM');
  } catch {
    // Pre-Android 12 has no such screen — nothing to do.
  }
}
