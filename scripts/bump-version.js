// Bumps the patch version (e.g. 1.0.0 -> 1.0.1) and Android versionCode in
// app.json, and mirrors the version string into package.json.
// Run before each full rebuild so the version shown on the Settings screen
// always identifies the build currently on the device. (expo prebuild
// regenerates android/app/build.gradle from app.json, so that's the only
// source of truth for versionCode.)
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const appJsonPath = path.join(root, 'app.json');
const pkgJsonPath = path.join(root, 'package.json');

const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));

const [major, minor, patch] = appJson.expo.version.split('.').map(Number);
const nextVersion = `${major}.${minor}.${patch + 1}`;
const nextVersionCode = (appJson.expo.android.versionCode ?? 0) + 1;

appJson.expo.version = nextVersion;
appJson.expo.android.versionCode = nextVersionCode;
pkgJson.version = nextVersion;

fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
fs.writeFileSync(pkgJsonPath, JSON.stringify(pkgJson, null, 2) + '\n');

console.log(`Version bumped to ${nextVersion} (versionCode ${nextVersionCode})`);
