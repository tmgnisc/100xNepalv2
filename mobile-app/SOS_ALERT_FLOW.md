# SOS Alert Flow - Complete Implementation

## ✅ What's Implemented

### 1. **Automatic Permission Requests**
- When you tap "Start Listening", the app automatically:
  - Requests Bluetooth permissions (BLUETOOTH_SCAN, BLUETOOTH_CONNECT, LOCATION)
  - Requests multiple times if needed
  - Shows helpful error messages if permissions are denied

### 2. **Bluetooth State Management**
- Checks if Bluetooth is enabled
- Guides user to enable Bluetooth if it's off
- Automatically initializes Bluetooth when starting

### 3. **Device Discovery & Pairing**
- Shows discovered devices in real-time
- Displays device name, signal strength (RSSI)
- Shows "🚨 SOS Available" indicator for devices with SOS alerts
- Automatically connects and checks devices for SOS data

### 4. **Dual Alert Reception**
The app receives SOS alerts from TWO sources:

#### A. **From Backend API** (When web app triggers SOS)
- Polls backend API every 5 seconds
- When User A triggers SOS from web app → API is updated
- Device B (mobile app) detects new emergency from API
- Shows notification and adds to alerts list

#### B. **Via Bluetooth** (When mobile app triggers SOS)
- Device A (mobile app) broadcasts SOS via Bluetooth
- Device B (mobile app) discovers Device A
- Connects and reads SOS data
- Shows notification and adds to alerts list

## 📱 How It Works

### Scenario 1: Web App → Mobile App
```
User A (Web App):
1. Triggers SOS alert
2. Alert saved to backend API (http://10.142.67.208:3001/api/emergencies)
3. ✅ Done

Device B (Mobile App):
1. "Start Listening" is active
2. Polls API every 5 seconds
3. Detects new emergency
4. Shows notification: "🚨 SOS Alert Received!"
5. Adds to alerts list
```

### Scenario 2: Mobile App → Mobile App (Bluetooth)
```
Device A (Mobile App):
1. Triggers SOS alert (via "Test Broadcast" or from web app)
2. Stores alert locally
3. Starts Bluetooth scanning (becomes discoverable)
4. Waits for connections

Device B (Mobile App):
1. "Start Listening" is active
2. Scans for nearby devices
3. Discovers Device A
4. Connects to Device A
5. Reads SOS data
6. Shows notification: "🚨 SOS Alert Received!"
7. Adds to alerts list
```

## 🔧 Configuration

### API URL Configuration
The mobile app polls the backend API for new emergencies. The API URL is configured in:
- File: `mobile-app/src/services/ApiService.ts`
- Current setting: `http://10.142.67.208:3001/api`
- **Change this** if your server IP is different

### How to Find Your Server IP
1. On your laptop (where JSON server runs):
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```
   Or on Windows: `ipconfig` → Look for IPv4 Address

2. Update API URL in `ApiService.ts`:
   ```typescript
   return 'http://YOUR_IP:3001/api';
   ```

3. Rebuild APK:
   ```bash
   cd mobile-app/android
   ./gradlew assembleRelease
   ```

## 🧪 Testing

### Test Setup:

#### Device B (Receiver):
1. Install the APK
2. Open the app
3. Tap "Start Listening"
   - ✅ Permissions should be requested automatically
   - ✅ Bluetooth should be checked/enabled
   - ✅ App starts scanning and polling API

#### Test 1: Web App → Mobile App
1. Open web app on Device A (or laptop): `http://YOUR_IP:8080`
2. Go to Home page
3. Click "Trigger SOS Alert"
4. Fill form and submit
5. ✅ Device B should receive notification within 5-10 seconds

#### Test 2: Mobile App → Mobile App (Bluetooth)
1. On Device A: Open mobile app, tap "Test Broadcast"
2. On Device B: Should have "Start Listening" active
3. ✅ Device B should receive notification via Bluetooth

## 📋 Features Summary

✅ **Automatic Permission Requests** - No manual settings needed
✅ **Bluetooth Auto-Enable** - Guides user to enable Bluetooth
✅ **Device Discovery** - Shows nearby devices in real-time
✅ **Bluetooth Pairing** - Automatically connects and checks devices
✅ **API Polling** - Receives alerts from web app triggers
✅ **Bluetooth Broadcasting** - Receives alerts from mobile app triggers
✅ **Notifications** - Push notifications for received alerts
✅ **Alert List** - Shows all received alerts with details

## 🚨 Troubleshooting

### "Permission not granted" error
- The app requests permissions automatically
- If still failing, go to Settings → Apps → AarogyaConnect → Permissions → Enable all Bluetooth permissions

### "Bluetooth not enabled" error
- The app checks Bluetooth state
- Enable Bluetooth in phone settings
- Try "Start Listening" again

### Not receiving alerts from web app
1. Check API URL is correct in `ApiService.ts`
2. Make sure both devices are on same network
3. Make sure JSON server is running: `npm run server`
4. Check API is accessible: Open `http://YOUR_IP:3001/api/emergencies` in browser

### Not receiving alerts via Bluetooth
1. Make sure both devices have Bluetooth enabled
2. Make sure both devices are close (within 10-30 meters)
3. Make sure "Start Listening" is active on Device B
4. Check if devices are being discovered (should show in "Discovered Devices" section)

