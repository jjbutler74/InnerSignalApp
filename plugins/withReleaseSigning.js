const { withAppBuildGradle } = require('expo/config-plugins');

// Injects a real release signingConfig into android/app/build.gradle on every
// `expo prebuild`, since that file is fully regenerated each time and any
// manual edit to it would otherwise be wiped.
//
// Credentials are read from Gradle properties (RELEASE_STORE_FILE,
// RELEASE_STORE_PASSWORD, RELEASE_KEY_ALIAS, RELEASE_KEY_PASSWORD), which are
// expected to live in the machine-global ~/.gradle/gradle.properties — never
// committed to this repo. If those properties aren't present (e.g. a fresh
// clone without the keystore), release builds fall back to the debug
// keystore so the project still builds.
module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;

    // Generated build.gradle uses CRLF on Windows; normalize to LF for
    // matching against our LF template literals below, then restore CRLF
    // at the end so the file's line-ending style is unchanged.
    const hadCRLF = contents.includes('\r\n');
    if (hadCRLF) contents = contents.replace(/\r\n/g, '\n');

    if (!contents.includes('RELEASE_STORE_FILE')) {
      contents = contents.replace(
        `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }`,
        `    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('RELEASE_STORE_FILE')) {
                storeFile file(RELEASE_STORE_FILE)
                storePassword RELEASE_STORE_PASSWORD
                keyAlias RELEASE_KEY_ALIAS
                keyPassword RELEASE_KEY_PASSWORD
            }
        }
    }`,
      );

      contents = contents.replace(
        `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug`,
        `            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig project.hasProperty('RELEASE_STORE_FILE') ? signingConfigs.release : signingConfigs.debug`,
      );
    }

    if (hadCRLF) contents = contents.replace(/\n/g, '\r\n');
    config.modResults.contents = contents;
    return config;
  });
};
