# Testing App on Android Emulator - Step by Step Guide

## Prerequisites Check

### 1. Check Virtualization Support
```bash
ls -la /dev/kvm
```
If this shows "Permission denied" or file doesn't exist, you may need to:
- Enable virtualization in BIOS
- Add user to kvm group: `sudo usermod -a -G kvm $USER` (then log out/in)

### 2. Check Emulator Acceleration
```bash
$ANDROID_HOME/emulator/emulator -accel-check
```
This should show "yes" for KVM. If not, emulator will be very slow.

## Step-by-Step: Start Emulator and Run App

### Step 1: Start Metro Bundler (Terminal 1)
```bash
cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app
npm start
```
Keep this terminal open. Wait for Metro to start.

### Step 2: Start Emulator (Terminal 2 - New Terminal)
```bash
# Method A: Using emulator command
$ANDROID_HOME/emulator/emulator -avd aarogya_emulator &

# Method B: Using Android Studio
# Open Android Studio > Tools > Device Manager > Click Play button next to "aarogya_emulator"
```

Wait 1-2 minutes for emulator to fully boot. You should see the Android home screen.

### Step 3: Verify Emulator is Ready
```bash
adb devices
```
Should show:
```
List of devices attached
emulator-5554    device
```

### Step 4: Build and Install App (Terminal 3 - New Terminal)
```bash
cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app
npm run android
```

This will:
- Build the APK
- Install it on the emulator
- Launch the app

## If Emulator Keeps Crashing

### Option 1: Use Android Studio
1. Open Android Studio
2. Go to Tools > Device Manager
3. Create a new AVD or use existing one
4. Click Play button to start
5. Then run: `npm run android`

### Option 2: Use Lower API Level
```bash
# Create AVD with Android 30 instead of 34
$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager create avd -n aarogya_30 -k "system-images;android-30;google_apis;x86_64"

# Start it
$ANDROID_HOME/emulator/emulator -avd aarogya_30
```

### Option 3: Check Emulator Logs
```bash
$ANDROID_HOME/emulator/emulator -avd aarogya_emulator -verbose
```
Look for error messages in the output.

## Testing Checklist

Once app is running on emulator:

- [ ] App launches without crashing
- [ ] UI displays correctly
- [ ] "Start Listening" button works
- [ ] "Stop Listening" button works  
- [ ] "Test Receive" shows an alert in the list
- [ ] "Test Broadcast" works
- [ ] Alerts appear in the list with correct information

**Note:** Real Bluetooth won't work on emulator, but you can test:
- UI components
- App navigation
- Local storage (AsyncStorage)
- Notifications (limited)
- Error handling

## Troubleshooting

### "adb: command not found"
```bash
# ADB is in /usr/bin/adb, so create symlink if needed
sudo ln -s /usr/bin/adb $ANDROID_HOME/platform-tools/adb
```

### "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### "Metro bundler port 8081 already in use"
```bash
lsof -ti:8081 | xargs kill
npm start
```

### App crashes on launch
- Check LogCat: `adb logcat | grep -i error`
- Or use: `npx react-native log-android`

