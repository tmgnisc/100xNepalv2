# Build Instructions for Shareable APK

## Fixed Issues ✅

1. ✅ Removed `autolinkLibrariesWithApp()` method (not available in this version)
2. ✅ Set explicit `compileSdkVersion 34` (no longer relies on rootProject.ext)
3. ✅ Added fallback values for SDK versions

## Quick Build Steps

### 1. Install Java 17

```bash
sudo apt update
sudo apt install openjdk-17-jdk

# Verify installation
java -version
```

### 2. Set JAVA_HOME

Add to `~/.zshrc`:
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$PATH:$JAVA_HOME/bin
```

Then reload:
```bash
source ~/.zshrc
```

### 3. Build Release APK

```bash
cd mobile-app/android

# Build release APK
./gradlew assembleRelease

# APK will be at:
# app/build/outputs/apk/release/app-release.apk
```

### 4. Share the APK

The APK file can be:
- Emailed
- Uploaded to Google Drive/Dropbox
- Shared via any file sharing service
- Installed directly on Android devices

To install on a device:
```bash
adb install -r app/build/outputs/apk/release/app-release.apk
```

Or transfer via USB and install manually.

## Alternative: Use Build Script

```bash
cd mobile-app
./build-apk.sh
```

This will:
1. Check for Android SDK
2. Setup Gradle wrapper
3. Build release APK
4. Copy APK to root directory as `AarogyaConnect-Bluetooth.apk`

## Current Build Status

After fixing the build.gradle, you should be able to build. The main remaining issue is Java path configuration.

Try running:
```bash
cd mobile-app/android
./gradlew assembleRelease
```

If you get Java errors, make sure JAVA_HOME is set correctly.

