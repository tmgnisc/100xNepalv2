# AarogyaConnect Bluetooth SOS Alert App

A minimal React Native app for Bluetooth-based SOS alert broadcasting and receiving between devices without internet connectivity.

## Features

- 🔍 **Listen for SOS Alerts**: Continuously scans for nearby devices broadcasting SOS alerts
- 📢 **Broadcast SOS Alerts**: Sends SOS alerts to nearby devices via Bluetooth
- 📬 **Push Notifications**: Receives real-time notifications when SOS alerts are detected
- 💾 **Local Storage**: Stores received alerts locally for offline access

## Setup

### Prerequisites

- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
cd mobile-app
npm install

# For Android
npm run android

# For iOS
npm run ios
```

### Required Permissions

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.BLUETOOTH" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
<uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

**iOS (Info.plist):**
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>We need Bluetooth to send and receive SOS alerts</string>
<key>UIBackgroundModes</key>
<array>
    <string>bluetooth-central</string>
    <string>bluetooth-peripheral</string>
</array>
```

## How It Works

### User A (Triggers SOS):
1. User A triggers SOS from web app
2. SOS is saved to JSON server (if internet available)
3. Mobile app broadcasts SOS via Bluetooth
4. Nearby devices receive the alert

### User B (Receives SOS):
1. Mobile app continuously listens for Bluetooth signals
2. When SOS alert detected, shows push notification
3. Alert is saved locally and displayed in app

## Integration with Web App

To integrate with the main web app, the React Native app can be accessed via:
- Deep linking (when installed)
- Web Bluetooth API (limited browser support)
- Hybrid approach: Web app calls React Native app via bridge

## Notes

- Bluetooth Low Energy (BLE) has limitations:
  - ~31 bytes for advertising data
  - Requires connection for larger data transfers
  - Range: ~10-30 meters typical

- For production, consider:
  - Using Nearby Connections API (Android) / Multipeer Connectivity (iOS)
  - Implementing mesh networking for longer range
  - Adding encryption for security

