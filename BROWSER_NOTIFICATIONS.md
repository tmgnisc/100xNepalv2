# Browser Notifications for SOS Alerts

## Overview

When a user triggers an SOS alert, all devices on the same network that have the web app open will automatically receive browser notifications about the emergency.

## How It Works

### 1. **Triggering SOS Alert**
When a user clicks "Trigger SOS Alert":
   1. Emergency is saved to `/api/emergencies` (standard endpoint)
   2. **NEW:** Emergency is also sent to `/api/sos-alert` (custom endpoint)
   3. ESP8266 device is notified (if configured)
   4. Bluetooth broadcast attempted (if supported)

### 2. **Notification System**
   1. **On App Load:** `NotificationManager` component automatically starts
   2. **Permission Request:** Browser requests notification permission (first time only)
   3. **Polling:** App polls `/api/emergencies` every 5 seconds
   4. **Detection:** Detects new emergencies (Pending status)
   5. **Notification:** Shows browser notification to all users on same network

### 3. **Multi-Device Support**
- All devices on the same network can access the app via:
  - `http://YOUR_IP:8080` (web app)
  - `http://YOUR_IP:3001/api` (backend API)
- Each device independently polls the backend
- When any device triggers SOS, all other devices get notified

## Features

✅ **Automatic Polling:** Checks for new alerts every 5 seconds  
✅ **Browser Notifications:** Native browser notifications (Chrome, Firefox, Edge, Safari)  
✅ **Permission Handling:** Automatic permission request on first use  
✅ **Multi-Device:** Works across all devices on same network  
✅ **Smart Detection:** Only notifies for new "Pending" emergencies  
✅ **Click to Navigate:** Click notification to go to Municipality dashboard  

## User Experience

### First Time:
1. User opens web app
2. Browser shows: "This site wants to show notifications"
3. User clicks "Allow"
4. App starts polling in background

### When SOS Alert is Triggered:
1. User A triggers SOS alert
2. Alert saved to backend
3. **All other users** (User B, User C, etc.) receive browser notification:
   - Title: "🚨 SOS Alert: Accident"
   - Body: "John Doe - Tamaghat (Ward 16)"
   - Auto-closes after 10 seconds
   - Click to navigate to dashboard

## Technical Details

### Files Created/Modified:

1. **`src/lib/notifications.ts`**
   - Notification service class
   - Handles permission requests
   - Polls backend for new emergencies
   - Shows browser notifications

2. **`src/components/NotificationManager.tsx`**
   - React component that initializes notifications
   - Auto-starts polling on app load
   - Cleanup on unmount

3. **`src/App.tsx`**
   - Added `<NotificationManager />` component
   - Runs in background for all pages

4. **`src/pages/RuralPanel.tsx`**
   - Added call to `/api/sos-alert` endpoint
   - Adds `createdAt` timestamp to emergency

5. **`src/lib/api.ts`**
   - Added `sosAlert` endpoint to `API_ENDPOINTS`

6. **`src/types/emergency.ts`**
   - Added `createdAt?: string` field to Emergency interface

## Browser Compatibility

✅ **Chrome/Edge:** Full support  
✅ **Firefox:** Full support  
✅ **Safari:** Full support (macOS 10.14+, iOS 12.1+)  
✅ **Opera:** Full support  

⚠️ **Note:** Notifications require HTTPS in production (or localhost for development)

## Testing

### Test Scenario 1: Single Device
1. Open app in browser
2. Allow notifications
3. Trigger SOS alert from same device
4. Should see notification (may be delayed by up to 5 seconds)

### Test Scenario 2: Multiple Devices
1. Device A: Open app, allow notifications
2. Device B: Open app, allow notifications
3. Device C: Open app, allow notifications
4. **Device A** triggers SOS alert
5. **Device B and C** should receive notifications within 5 seconds

### Test Scenario 3: Network Access
1. Find your network IP: `ip addr` or `ipconfig`
2. Device A: Access via `http://YOUR_IP:8080`
3. Device B: Access via `http://YOUR_IP:8080`
4. Ensure both are on same network
5. Trigger SOS from Device A
6. Device B should receive notification

## API Endpoints Used

1. **GET** `/api/emergencies?_sort=id&_order=desc&_limit=10`
   - Polled every 5 seconds
   - Gets latest emergencies

2. **POST** `/api/emergencies`
   - Saves emergency to database

3. **POST** `/api/sos-alert` ⭐ NEW
   - Custom endpoint for triggering SOS alerts
   - Also saves to database
   - Used specifically for SOS notification system

## Configuration

### Polling Interval
Default: 5 seconds
Change in `src/lib/notifications.ts`:
```typescript
notificationService.startPolling(5000); // Change 5000 to desired milliseconds
```

### Notification Duration
Default: 10 seconds (auto-close)
Change in `src/lib/notifications.ts`:
```typescript
setTimeout(() => {
  notification.close();
}, 10000); // Change 10000 to desired milliseconds
```

## Troubleshooting

### Notifications Not Showing

1. **Check Permission:**
   - Browser Settings → Site Settings → Notifications
   - Ensure "AarogyaConnect" is allowed

2. **Check Console:**
   - Open browser DevTools (F12)
   - Look for notification service logs
   - Should see: "✅ Started polling for SOS alerts"

3. **Check Network:**
   - Ensure backend is running: `npm run server`
   - Check API is accessible: `curl http://localhost:3001/api/emergencies`

4. **Check Backend:**
   - Verify `/api/sos-alert` endpoint works
   - Test: `curl -X POST http://localhost:3001/api/sos-alert -H "Content-Type: application/json" -d '{"name":"Test","location":"Test","type":"Accident"}'`

### Multiple Devices Not Receiving Notifications

1. **Same Network:** Ensure all devices on same Wi-Fi network
2. **Same API URL:** All devices must access same backend (use IP address, not localhost)
3. **Backend Running:** Ensure JSON Server is running and accessible from network
4. **Permissions:** Each device must allow notifications

## Security Notes

- Notifications work on local network (development)
- For production, HTTPS is required for notifications
- Notifications are local to browser (no external services required)
- All polling happens client-side (no server-side notification push needed)

