const { withAndroidManifest, AndroidConfig } = require('expo/config-plugins');

// Several Android permissions end up in the final merged manifest even
// though nothing in this app actually uses them — some are leftover from
// earlier experiments (USE_BIOMETRIC/USE_FINGERPRINT, USE_EXACT_ALARM), and
// RECORD_AUDIO/SYSTEM_ALERT_WINDOW are pulled in by dependencies regardless
// of whether we ask for them. tools:node="remove" forces Android's manifest
// merger to drop them at build time no matter which library (or app.json)
// declared them.
//
// SCHEDULE_EXACT_ALARM is deliberately NOT stripped: expo-notifications
// needs it on Android 12+ to fire the daily affirmation/gratitude
// notifications at their exact scheduled time. Without it, Android silently
// downgrades to inexact delivery, which gets delayed/batched and often only
// flushes once the app process is reopened.
const PERMISSIONS_TO_REMOVE = [
  'android.permission.RECORD_AUDIO',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.USE_BIOMETRIC',
  'android.permission.USE_FINGERPRINT',
  'android.permission.USE_EXACT_ALARM',
];

module.exports = function withRemovedPermissions(config) {
  return withAndroidManifest(config, (config) => {
    // ensureToolsAvailable expects the whole AndroidManifest wrapper
    // ({ manifest: { $, ... } }), not the inner manifest element.
    AndroidConfig.Manifest.ensureToolsAvailable(config.modResults);
    const manifest = config.modResults.manifest;

    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    for (const permission of PERMISSIONS_TO_REMOVE) {
      manifest['uses-permission'] = manifest['uses-permission'].filter(
        (p) => p.$['android:name'] !== permission,
      );
      manifest['uses-permission'].push({
        $: {
          'android:name': permission,
          'tools:node': 'remove',
        },
      });
    }

    return config;
  });
};
