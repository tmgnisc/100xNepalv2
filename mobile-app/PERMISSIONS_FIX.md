# Bluetooth Permissions Fix

## What Changed

### 1. **More Lenient Permission Handling**
- App now continues even if some permissions are denied
- Doesn't block on permission errors
- Shows warnings but allows Bluetooth operations to try

### 2. **Shows Paired Devices**
- Automatically loads and displays paired Bluetooth devices
- Paired devices shown with green border
- Tap any device to connect manually

### 3. **Device List**
- Shows all available devices:
  - **Paired devices** (green border, shown first)
  - **Discovered devices** (from scanning)
- Each device shows:
  - Device name
  - Signal strength (if available)
  - Device ID
  - SOS indicator (if device has SOS alert)

### 4. **Manual Connection**
- Tap any device in the list
- Confirms connection
- Connects and checks for SOS data

## How It Works Now

### When You Click "Start Listening":

1. **Requests Permissions** (automatically)
   - BLUETOOTH_SCAN
   - BLUETOOTH_CONNECT  
   - LOCATION (if needed)
   - **If permissions denied, app continues anyway**

2. **Loads Paired Devices**
   - Shows all previously paired Bluetooth devices
   - These are displayed immediately

3. **Starts Scanning**
   - Scans for nearby BLE devices
   - Adds discovered devices to the list

4. **Polls Backend API**
   - Checks for new emergencies every 5 seconds
   - When Device A triggers SOS from web app, Device B receives it via API

## Device List Features

- **Green Border** = Paired device
- **🚨 SOS** indicator = Device has active SOS alert
- **Tap Device** = Connect manually
- **Signal Strength** = RSSI value (for discovered devices)

## If Permissions Still Issue

The app now works even if permissions aren't perfect. However, if you want to manually grant:

1. Go to: **Settings → Apps → AarogyaConnect → Permissions**
2. Look for:
   - **Nearby devices** (Bluetooth scanning)
   - **Location** (required for Bluetooth scanning)
   - Some Android versions show these under "Other permissions"

3. Or try: **Settings → Apps → AarogyaConnect → App info → Permissions**

## Testing Flow

### Device B (Receiver):
1. Open app
2. Tap "Start Listening"
3. **See paired devices** immediately (green border)
4. **See discovered devices** as they appear
5. Tap Device A to connect manually

### Device A (Web App triggers SOS):
1. User A triggers SOS from web app
2. SOS saved to API
3. Device B polls API and receives alert automatically

### Device A (Mobile App triggers SOS):
1. Device A uses mobile app to trigger SOS
2. Device A broadcasts via Bluetooth
3. Device B discovers Device A (or connects manually)
4. Device B receives alert

