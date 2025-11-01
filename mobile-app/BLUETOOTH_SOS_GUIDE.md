# Bluetooth SOS Alert System - How It Works

## Overview

When User A triggers an SOS alert:
1. ✅ SOS alert is sent to the backend API
2. ✅ SOS alert is stored locally on Device A
3. ✅ Device A starts Bluetooth scanning (making it discoverable)
4. ✅ Device B (with app running and scanning) discovers Device A
5. ✅ Device B connects to Device A
6. ✅ Device B reads the SOS alert data
7. ✅ Device B shows notification and alert

## Setup Requirements

### On Both Devices (Device A & Device B):

1. **Install the App**
   - Both devices must have the AarogyaConnect app installed

2. **Enable Bluetooth**
   - Both devices must have Bluetooth enabled
   - Grant Bluetooth permissions when prompted

3. **Start Listening**
   - On Device B: Tap "Start Listening" button
   - This makes Device B scan for nearby SOS alerts

4. **Devices Should Be Near Each Other**
   - Bluetooth range: typically 10-30 meters
   - Devices should be within Bluetooth range

## How to Test

### Step 1: Setup Device B (Receiver)
1. Open the app on Device B
2. Tap "Start Listening" button
3. App should show "Stop Listening" button (scanning active)

### Step 2: Trigger SOS on Device A (Sender)
1. Trigger SOS alert from the web app or mobile app
2. The SOS alert is:
   - Sent to backend API
   - Stored locally on Device A
   - Device A starts scanning automatically

### Step 3: Device B Receives Alert
1. Device B discovers Device A (takes 2-10 seconds)
2. Device B connects to Device A
3. Device B reads the SOS data
4. Device B shows:
   - Push notification: "🚨 SOS Alert Received!"
   - Alert appears in the "Received Alerts" list

## Technical Flow

```
Device A (SOS Trigger):
┌─────────────────────────────┐
│ 1. User triggers SOS        │
│ 2. API call to backend      │
│ 3. Store alert locally       │
│ 4. Start Bluetooth scanning  │ ← Makes Device A discoverable
│ 5. Wait for connections     │
└─────────────────────────────┘
           │
           │ Bluetooth Connection
           ▼
Device B (Receiver):
┌─────────────────────────────┐
│ 1. Already scanning         │ ← "Start Listening" active
│ 2. Discovers Device A       │
│ 3. Connects to Device A     │
│ 4. Reads SOS characteristic │
│ 5. Shows notification        │
│ 6. Adds alert to list      │
└─────────────────────────────┘
```

## Important Notes

### ⚠️ Limitations

1. **Both devices must have the app running**
   - Device B must have "Start Listening" active
   - Device A automatically starts scanning when SOS is triggered

2. **Devices must be in Bluetooth range**
   - Typically 10-30 meters (varies by device)

3. **Connection takes a few seconds**
   - Discovery: 2-10 seconds
   - Connection: 1-2 seconds
   - Data transfer: <1 second

4. **One alert at a time**
   - Device A stores one active SOS alert
   - New SOS alert replaces the previous one

### ✅ Best Practices

1. **Keep both devices' apps open**
   - Don't close the app on Device B
   - Keep "Start Listening" active

2. **Ensure Bluetooth is enabled**
   - Check Bluetooth settings on both devices
   - Grant all permissions

3. **Stay within range**
   - Devices should be close to each other
   - Avoid obstacles (walls, interference)

4. **Wait a few seconds**
   - Don't close Device A immediately after triggering SOS
   - Give Device B time to discover and connect

## Troubleshooting

### Device B not receiving alerts?

1. **Check Bluetooth is enabled** on both devices
2. **Check "Start Listening" is active** on Device B
3. **Check devices are close** (within 10-30 meters)
4. **Check permissions** are granted on both devices
5. **Restart scanning** on Device B
6. **Check logs** using: `adb logcat | grep -i "aarogya\|bluetooth\|sos"`

### Connection fails?

- Make sure both devices are not connected to other Bluetooth devices
- Try disabling and re-enabling Bluetooth
- Restart the app on both devices

### Alert not showing?

- Check notification permissions
- Check if alert appears in the list (even if notification doesn't show)
- Try triggering a test alert

## Testing with Test Buttons

The app has test buttons for easier testing:

1. **"Test Receive"** - Simulates receiving an alert locally
2. **"Test Broadcast"** - Triggers a test SOS alert broadcast

Use these to test the UI without needing two devices.

