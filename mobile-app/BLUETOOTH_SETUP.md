# Bluetooth Setup & Testing Guide

## What Was Fixed

✅ **Permission Handling**: Added proper runtime permission requests for Android 12+
✅ **Error Handling**: App won't crash if Bluetooth fails - shows warnings instead
✅ **Graceful Degradation**: App can run even if Bluetooth permissions denied
✅ **Error Boundary**: Catches React errors to prevent crashes

## How It Works

### Flow:
1. **User B opens app** → Requests Bluetooth permissions → Starts listening
2. **User A triggers SOS** (from web app) → Saves to JSON server + broadcasts via Bluetooth
3. **User B's app** → Scans for BLE devices → Receives alert → Shows notification

### Bluetooth Communication:

**For now, using a simplified approach:**
- Devices scan for BLE peripherals advertising SOS service UUID
- When SOS device found → Connect → Read emergency data
- Shows push notification on receiving device

**Note**: Full BLE advertising requires native Android code. The current implementation uses:
- BLE scanning to discover devices
- BLE connection + characteristic read for data transfer

## Testing

### On Device B (Receiving):
1. Open app
2. Grant Bluetooth permissions when prompted
3. Click "Start Listening"
4. App will scan for nearby SOS alerts

### Simulate SOS from Device A:
1. Use "Test Broadcast" button in the app, OR
2. Trigger SOS from web app (which should call the mobile app bridge)

## If App Still Crashes

Check logcat:
```bash
adb logcat | grep -i "aarogyaconnect\|error\|exception"
```

Common issues:
1. **Permissions denied** → Go to Settings → Apps → AarogyaConnect → Permissions → Enable all Bluetooth permissions
2. **Bluetooth disabled** → Enable Bluetooth in phone settings
3. **React Native errors** → Check if all dependencies are installed: `npm install`

## Next Steps

For full Bluetooth mesh networking (better range, no internet), consider:
- Android Nearby Connections API
- iOS Multipeer Connectivity
- Custom BLE advertising server (requires native code)

