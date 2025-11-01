# Setup Android Emulator for Testing

## Quick Setup

### 1. Create Android Virtual Device (AVD)

```bash
# List available system images
avdmanager list | grep system-images

# Create emulator (choose one):
# Option A: Via command line
avdmanager create avd -n AarogyaConnect_Test -k "system-images;android-34;google_apis;x86_64"

# Option B: Via Android Studio (easier)
# Open Android Studio → Tools → Device Manager → Create Device
```

### 2. Start Emulator

```bash
# Start the emulator
emulator -avd AarogyaConnect_Test &

# Or from Android Studio: Device Manager → Click Play button
```

### 3. Verify Emulator is Running

```bash
adb devices
# Should show your emulator
```

### 4. Install and Test App

```bash
cd mobile-app
npm run android
# Or install APK manually:
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

## Enable Bluetooth on Emulator

Android emulator doesn't have real Bluetooth, but you can:

1. **Use Extended Controls**:
   - Click "..." button on emulator toolbar
   - Settings → Bluetooth → Enable

2. **Or Test Without Bluetooth First**:
   - App should still open and show UI
   - Bluetooth features just won't work on emulator

## Troubleshooting App Crashes

### Get Crash Logs:

```bash
# Real-time logs
adb logcat | grep -i "aarogyaconnect\|error\|exception\|fatal"

# Save to file
adb logcat > crash_log.txt
```

### Common Issues:

1. **Native Module Not Found**:
   - Run `cd mobile-app && npm install`
   - Rebuild: `cd android && ./gradlew clean && ./gradlew assembleRelease`

2. **Permission Errors**:
   - Emulator Settings → Apps → AarogyaConnect → Permissions → Enable all

3. **Bluetooth Errors**:
   - Expected on emulator - Bluetooth doesn't work properly
   - App should still open and show UI

## Test Without Bluetooth

The app is designed to work even without Bluetooth:
- Opens successfully
- Shows UI
- Displays warnings if Bluetooth unavailable
- Can view stored alerts


