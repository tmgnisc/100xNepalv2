# Simple APK Build Guide

Since you want a shareable APK file, here's the simplest approach:

## Quick Solution: Use a Pre-built Setup

The React Native setup is complex. For a quick shareable APK, consider these options:

### Option 1: Use Expo (Recommended for Quick Build)

Expo makes building APKs much easier:

```bash
# Install Expo CLI
npm install -g expo-cli

# Create new Expo app
cd ..
npx create-expo-app AarogyaConnectBT-Expo --template blank-typescript

# Copy your src files
cp -r mobile-app/src/* AarogyaConnectBT-Expo/

# Build APK (requires Expo account - free)
cd AarogyaConnectBT-Expo
eas build --platform android --profile production
```

### Option 2: Fix Current Setup

If you want to fix the current setup:

1. **Fix Java Path Issue:**
```bash
# Find Java installation
which java
# Or
sudo apt install openjdk-17-jdk
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

2. **Fix Gradle Issues:**
```bash
cd mobile-app/android
./gradlew clean
./gradlew assembleRelease
```

3. **Get the APK:**
```bash
# APK will be at:
android/app/build/outputs/apk/release/app-release.apk
```

### Option 3: Use GitHub Actions (Easiest for Sharing)

Create `.github/workflows/build-android.yml`:

```yaml
name: Build Android APK

on:
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'
      - name: Setup Android SDK
        uses: android-actions/setup-android@v2
      - name: Build APK
        run: |
          cd mobile-app
          cd android
          ./gradlew assembleRelease
      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-release
          path: mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

Then:
- Push to GitHub
- Go to Actions → Run workflow
- Download the APK artifact

## Current Issues to Fix

1. ✅ Removed `autolinkLibrariesWithApp()` - Fixed
2. ⚠️ Java path issue - Need to install/set JAVA_HOME
3. ⚠️ compileSdkVersion - Should be fixed now with fallback values

## Next Steps

```bash
# 1. Install Java 17
sudo apt update
sudo apt install openjdk-17-jdk

# 2. Set JAVA_HOME (add to ~/.zshrc)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
source ~/.zshrc

# 3. Try building again
cd mobile-app/android
./gradlew assembleRelease

# 4. Find APK
ls -lh app/build/outputs/apk/release/
```

