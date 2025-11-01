# Running App on Android Emulator

## Quick Start

### Option 1: Let React Native handle it (Easiest)
```bash
cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app
npm run android
```

This will:
- Check if an emulator is running
- If not, it will prompt you to start one
- Build and install the app automatically

### Option 2: Start Emulator Manually First

1. **Start the emulator:**
   ```bash
   $ANDROID_HOME/emulator/emulator -avd aarogya_emulator &
   ```
   Wait 1-2 minutes for it to fully boot.

2. **Check if emulator is ready:**
   ```bash
   adb devices
   ```
   You should see a device listed.

3. **Run the app:**
   ```bash
   npm run android
   ```

### Option 3: Using the helper script
```bash
./run-emulator.sh
```

## Troubleshooting

### Emulator not starting?
- Make sure virtualization is enabled in BIOS
- Check: `$ANDROID_HOME/emulator/emulator -list-avds`

### App build fails?
- Make sure you've accepted all SDK licenses
- Check `android/local.properties` has correct `sdk.dir`

### Metro bundler issues?
- Kill existing Metro: `pkill -f "react-native start"` or `lsof -ti:8081 | xargs kill`
- Start fresh: `npm start` (in a separate terminal)

## Testing on Emulator

Once the app is running:
1. ✅ Check if app launches without crashes
2. ✅ Test "Start Listening" button
3. ✅ Test "Test Receive" button (should show alert)
4. ✅ Test "Test Broadcast" button
5. ✅ Check if alerts appear in the list

Note: Bluetooth functionality will be limited on emulator (emulators don't have real Bluetooth), but you can test the UI and basic app functionality.

