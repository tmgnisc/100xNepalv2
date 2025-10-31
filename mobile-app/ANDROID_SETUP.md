# Android Setup Guide

## Quick Fix for Current Errors

You're getting these errors because:
1. **ADB not found** - Android Debug Bridge is not in your PATH
2. **No emulators** - No Android emulators configured
3. **Gradle wrapper** - Now fixed! ✅

## Step 1: Install Android SDK

### Option A: Using Android Studio (Recommended)

1. **Download Android Studio**: https://developer.android.com/studio
2. **Install Android Studio**
3. **Open Android Studio** → More Actions → SDK Manager
4. Install:
   - Android SDK Platform-Tools (includes ADB)
   - Android SDK Build-Tools
   - Android SDK Platform (API 34 or latest)
   - Android Emulator (if you want emulators)

### Option B: Using Command Line Tools (Linux)

```bash
# Install SDK Command Line Tools
cd ~
mkdir -p Android/Sdk
cd Android/Sdk

# Download command line tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p cmdline-tools/latest
mv cmdline-tools/* cmdline-tools/latest/ 2>/dev/null || true

# Set environment variables (add to ~/.zshrc or ~/.bashrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/emulator

# Install required packages
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
sdkmanager "emulator" "system-images;android-34;google_apis;x86_64"
```

## Step 2: Configure local.properties

Create `android/local.properties`:

```bash
cd mobile-app/android
cat > local.properties << EOF
sdk.dir=$HOME/Android/Sdk
EOF
```

Or manually create the file:
```properties
sdk.dir=/home/YOUR_USERNAME/Android/Sdk
```

## Step 3: Verify Setup

```bash
# Check ADB is available
adb version

# Check Android SDK
echo $ANDROID_HOME

# Check if emulator is available
emulator -list-avds
```

## Step 4: Connect Device or Create Emulator

### Option A: Use Physical Device

1. **Enable Developer Options** on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times
2. **Enable USB Debugging**:
   - Settings → Developer Options → USB Debugging
3. **Connect via USB** and authorize
4. **Verify connection**:
   ```bash
   adb devices
   # Should show your device
   ```

### Option B: Create Android Emulator

```bash
# List available system images
sdkmanager --list | grep system-images

# Create AVD (Android Virtual Device)
avdmanager create avd -n test_device -k "system-images;android-34;google_apis;x86_64"

# Start emulator
emulator -avd test_device &
```

Or use Android Studio:
- Tools → Device Manager → Create Device

## Step 5: Run the App

```bash
cd mobile-app
npm run android
```

## Troubleshooting

### "adb: not found"
- Make sure `platform-tools` is installed
- Add `$ANDROID_HOME/platform-tools` to PATH
- Restart terminal

### "No emulators found"
- Create an emulator first (see Step 4)
- Or connect a physical device

### "Gradle build failed"
- Check `android/local.properties` exists
- Verify `ANDROID_HOME` is set correctly
- Try: `cd android && ./gradlew clean`

### "JAVA_HOME not set"
```bash
# Find Java installation
which java
# or
readlink -f $(which java)

# Set JAVA_HOME (add to ~/.zshrc)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
# Adjust path based on your Java installation
```

## Quick Test

After setup, verify everything works:

```bash
# 1. Check ADB
adb devices

# 2. Check Gradle
cd mobile-app/android
./gradlew --version

# 3. Build the app
./gradlew assembleDebug

# 4. Run React Native
cd ..
npm run android
```

## Alternative: Use Expo (Easier but different approach)

If setup is too complex, consider using Expo:
```bash
npx create-expo-app --template
# But this requires rewriting the Bluetooth native code
```

