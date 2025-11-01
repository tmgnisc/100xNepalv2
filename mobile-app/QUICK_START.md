# 🚀 Quick Start: Run App on Emulator

## Easiest Method: Use Android Studio

1. **Open Android Studio**
2. **Open Device Manager**: `Tools` → `Device Manager`
3. **Click the Play button** next to `aarogya_emulator` (or create a new one)
4. **Wait for emulator to boot** (1-2 minutes)
5. **In terminal, run:**
   ```bash
   cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app
   npm start
   ```
6. **In another terminal:**
   ```bash
   cd /home/shifu/Downloads/aarogya-connect-live-main/mobile-app
   npm run android
   ```

## Alternative: Fix KVM Permission

If you want to use command-line emulator:

```bash
# Add yourself to kvm group
sudo usermod -a -G kvm $USER

# Logout and login again, then:
./START_EMULATOR.sh
```

## Test the App

Once running, test:
- ✅ App launches (no crashes)
- ✅ "Start Listening" button
- ✅ "Test Receive" - should add alert to list
- ✅ "Test Broadcast" - should work
- ✅ Alerts display correctly

**Note:** Real Bluetooth won't work on emulator, but UI and app logic can be tested.

