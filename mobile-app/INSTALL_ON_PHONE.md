# 📱 Install APK on Your Phone

## ✅ Build Complete!

The APK has been successfully built. Here's how to install it on your phone:

## APK Location

```
/home/shifu/Downloads/aarogya-connect-live-main/mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

## Installation Steps

### Method 1: USB/ADB (Easiest)

1. **Enable Developer Options on your phone:**
   - Go to `Settings` → `About Phone`
   - Tap `Build Number` 7 times
   - Go back to `Settings` → `Developer Options`
   - Enable `USB Debugging`

2. **Connect phone via USB** and allow debugging

3. **Install via ADB:**
   ```bash
   cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app/android
   adb install app/build/outputs/apk/release/app-release.apk
   ```

### Method 2: Transfer and Install Manually

1. **Copy APK to phone:**
   - Transfer `app-release.apk` to your phone via:
     - USB file transfer
     - Bluetooth
     - Cloud storage (Google Drive, etc.)
     - Email to yourself

2. **On your phone:**
   - Open `Files` app
   - Navigate to the APK location
   - Tap the APK file
   - If prompted: `Settings` → `Allow installation from unknown sources`
   - Tap `Install`

### Method 3: Using File Manager with ADB (Wireless)

1. **Enable wireless debugging** (Android 11+):
   - `Settings` → `Developer Options` → `Wireless debugging`
   - Note the IP address and port

2. **Connect wirelessly:**
   ```bash
   adb connect YOUR_PHONE_IP:PORT
   adb install /home/shifu/Downloads/aarogya-connect-live-main/mobile-app/android/app/build/outputs/apk/release/app-release.apk
   ```

## Testing Checklist

Once installed on your phone:

### Basic Functionality
- [ ] App launches without crashing
- [ ] UI displays correctly
- [ ] All buttons are clickable
- [ ] App doesn't crash when Bluetooth is off

### Bluetooth Features
- [ ] Grant Bluetooth permissions when prompted
- [ ] "Start Listening" button works
- [ ] "Stop Listening" button works
- [ ] "Test Receive" creates an alert in the list
- [ ] "Test Broadcast" works
- [ ] Received alerts show correct information

### Real-World Testing
- [ ] Test with two phones (if available):
  - Phone A: Broadcast SOS
  - Phone B: Should receive alert (with Bluetooth enabled and nearby)

## Permissions Required

The app needs these permissions (will be requested automatically):
- ✅ Bluetooth (Android 12+)
- ✅ Location (for BLE scanning)
- ✅ Notifications (for SOS alerts)

## Troubleshooting

### "App not installed" error
- Make sure you uninstalled any previous version first
- Enable "Install from unknown sources" in settings

### "App keeps stopping"
- Check the error logs: `adb logcat | grep -i error`
- Make sure all permissions are granted

### Bluetooth not working
- Enable Bluetooth in phone settings
- Grant all permissions when prompted
- On Android 12+, make sure you grant both Bluetooth permissions

### Can't find APK
```bash
# Find the APK
find ~/Downloads/aarogya-connect-live-main/mobile-app/android -name "app-release.apk"

# Or rebuild if needed
cd ~/Downloads/aarogya-connect-live-main/mobile-app/android
./gradlew assembleRelease
```

## Next Steps

After testing:
1. Test all features on your phone
2. If you find bugs, check logs: `adb logcat`
3. Make changes and rebuild: `./gradlew assembleRelease`
4. Share the APK with others for testing (same installation method)

