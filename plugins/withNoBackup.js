const { withAndroidManifest } = require('expo/config-plugins');

// Disable Android's automatic backup so the SQLite database (journal entries,
// affirmation history, settings) cannot be uploaded to Google Drive or
// transferred to another device via device-to-device backup. This enforces
// the privacy promise that no data ever leaves the device.
module.exports = function withNoBackup(config) {
  return withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];
    app.$['android:allowBackup'] = 'false';
    return config;
  });
};
