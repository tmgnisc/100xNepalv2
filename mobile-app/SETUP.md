# Quick Setup Guide

## Step 1: Install Dependencies

```bash
cd mobile-app
npm install
```

## Step 2: Android Setup

1. **Configure Android Permissions** (already in `AndroidManifest.xml`)

2. **Run on Android:**
   ```bash
   npm run android
   ```

## Step 3: iOS Setup (macOS only)

1. **Install CocoaPods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Configure Info.plist** - Add Bluetooth permissions:
   ```xml
   <key>NSBluetoothAlwaysUsageDescription</key>
   <string>We need Bluetooth to send and receive SOS alerts</string>
   ```

3. **Run on iOS:**
   ```bash
   npm run ios
   ```

## Step 4: Testing

1. **Install on two devices** (or use emulator + device)

2. **Device A**: 
   - Open app
   - Click "Test Broadcast" button
   - This simulates triggering an SOS

3. **Device B**:
   - Open app  
   - Click "Start Listening"
   - Should receive the alert notification

## Integration with Web App

### Option 1: Deep Linking

When SOS is triggered from web app, open React Native app via deep link:

```javascript
// In web app (RuralPanel.tsx)
const openMobileApp = (emergency) => {
  const deepLink = `aarogyaconnect://sos?${new URLSearchParams({
    id: emergency.id,
    name: emergency.name,
    type: emergency.type,
    location: emergency.location,
  })}`;
  
  window.location.href = deepLink;
  // Fallback to app store if app not installed
  setTimeout(() => {
    window.open('https://play.google.com/store/apps/details?id=com.aarogyaconnect');
  }, 500);
};
```

### Option 2: Web Bluetooth API (Limited)

For browsers that support Web Bluetooth:

```javascript
// In web app
async function broadcastViaBluetooth(emergency) {
  try {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['0000180D-0000-1000-8000-00805F9B34FB'] }]
    });
    
    const server = await device.gatt.connect();
    // Send emergency data...
  } catch (error) {
    console.log('Bluetooth not available:', error);
  }
}
```

### Option 3: Shared Storage Bridge (Simplest)

1. Web app saves emergency to shared location
2. React Native app polls this location
3. Works when both apps are on same device

```javascript
// Web app stores to localStorage
localStorage.setItem('pendingSOS', JSON.stringify(emergency));

// React Native reads from AsyncStorage (if shared)
// Or uses WebView bridge
```

## Recommended Approach

For offline/no-internet scenarios:

1. **User A triggers SOS** → Web app saves to JSON server (if online)
2. **Web app calls React Native bridge** → Broadcasts via Bluetooth
3. **Nearby devices (User B)** → React Native app receives via Bluetooth
4. **User B sees notification** → Alert displayed in app

## Notes

- Bluetooth range: ~10-30 meters typical
- BLE advertising limit: ~31 bytes
- For larger data, establish connection and use characteristics
- Consider using Android Nearby Connections API for better range/features

