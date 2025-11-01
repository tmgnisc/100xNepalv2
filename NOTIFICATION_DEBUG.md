# Notification Debugging Guide

## Issue: Notifications Not Showing on Devices

If notifications aren't showing, follow these steps:

## Step 1: Check Browser Console

Open DevTools (F12) and check the console for these logs:

### Expected Logs on App Load:
```
🔔 Initializing notification service...
📊 Current permission status: default/granted/denied
✅ Started polling for SOS alerts { permission: "...", interval: 5000, ... }
🔍 Polling for new emergencies...
```

### Expected Logs When Polling:
```
🔍 Polling for new emergencies... { url: "...", lastChecked: "..." }
📋 Found X emergencies
🆕 New emergency detected: { id: "...", name: "...", ... }
📬 Found X new emergencies
📬 ✅ Notification shown for emergency: E...
🔔 Creating notification: { title: "...", body: "...", id: "..." }
✅ Notification created successfully
```

### If You See Errors:
- `⚠️ Notification permission not granted` → See Step 2
- `❌ Error checking for new emergencies` → See Step 3
- `📭 No emergencies found` → See Step 4

## Step 2: Check Notification Permission

### Check Permission Status:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `Notification.permission`
4. Should return: `"granted"`, `"default"`, or `"denied"`

### Grant Permission:
1. **Chrome/Edge:** Click the lock icon in address bar → Permissions → Notifications → Allow
2. **Firefox:** Click the lock icon → More Information → Permissions → Notifications → Allow
3. **Safari:** Safari → Preferences → Websites → Notifications → Allow

### Or Test Permission Request:
In console, type:
```javascript
Notification.requestPermission().then(permission => console.log('Permission:', permission));
```

## Step 3: Verify API is Accessible

### Test API Endpoint:
```bash
# From any device on same network
curl http://YOUR_IP:3001/api/emergencies
```

Should return JSON array of emergencies.

### Check API Base URL:
In browser console, check:
```javascript
// Should show your network IP (not localhost)
console.log(window.location.hostname);
```

If showing `localhost`, other devices won't be able to connect.

### Verify Backend is Running:
```bash
# On server machine
ps aux | grep json-server
# Should see json-server process

# Or check if port is open
netstat -tuln | grep 3001
```

## Step 4: Check Emergency Data

### Verify Emergency Has Required Fields:
Emergency should have:
- `id`: "E{timestamp}"
- `status`: "Pending"
- `createdAt`: ISO timestamp (or ID timestamp is used)

### Check Latest Emergency:
```bash
curl http://YOUR_IP:3001/api/emergencies?_sort=id&_order=desc&_limit=1
```

Should return the most recent emergency.

### Check if Emergency is "Pending":
If emergency status is not "Pending", notification won't show.

## Step 5: Test Notification Manually

### Test Browser Notification Support:
In browser console:
```javascript
if ('Notification' in window) {
  if (Notification.permission === 'granted') {
    new Notification('Test', { body: 'This is a test notification' });
  } else {
    Notification.requestPermission().then(p => {
      if (p === 'granted') {
        new Notification('Test', { body: 'This is a test notification' });
      }
    });
  }
}
```

If this works, browser notifications are supported.

## Step 6: Check Network Connection

### All Devices Must:
1. Be on same Wi-Fi network
2. Access app via IP (not localhost):
   - ✅ `http://192.168.1.100:8080`
   - ❌ `http://localhost:8080`

### Test Network Access:
From Device B, try accessing:
```
http://DEVICE_A_IP:8080
http://DEVICE_A_IP:3001/api/emergencies
```

Both should work.

## Step 7: Check Console Logs for Polling

### Should See Every 5 Seconds:
```
🔍 Polling for new emergencies...
📋 Found X emergencies
```

If you don't see these logs:
- NotificationManager might not be loading
- Check if component is mounted in App.tsx

## Step 8: Verify Timestamp Logic

### Check Last Checked Timestamp:
In console, check the logs:
```
⏰ Updated last checked timestamp: 2025-11-01T...
```

This should update when new emergencies are found.

### Emergency Created After Timestamp:
The emergency's `createdAt` or ID timestamp must be AFTER `lastCheckedTimestamp`.

## Step 9: Common Issues

### Issue 1: Permission Denied
**Solution:** User must manually allow in browser settings

### Issue 2: Not on Same Network
**Solution:** All devices must be on same Wi-Fi network

### Issue 3: Using localhost
**Solution:** Use network IP address instead:
- Find IP: `ip addr` (Linux) or `ipconfig` (Windows)
- Access via: `http://YOUR_IP:8080`

### Issue 4: Emergency Status Not "Pending"
**Solution:** Only "Pending" emergencies trigger notifications

### Issue 5: Emergency Too Old
**Solution:** Emergency must be created within last 3 minutes (or after polling started)

### Issue 6: Tab Not Active
**Solution:** Notifications work even when tab is not active, but check:
- Browser isn't in "Do Not Disturb" mode
- System notifications aren't disabled

## Step 10: Debug Checklist

Use this checklist:

- [ ] Browser console shows polling logs every 5 seconds
- [ ] `Notification.permission === "granted"`
- [ ] API endpoint accessible: `http://YOUR_IP:3001/api/emergencies`
- [ ] Latest emergency has `status: "Pending"`
- [ ] Latest emergency has `createdAt` or valid ID timestamp
- [ ] Emergency was created recently (within last 3 minutes)
- [ ] All devices on same network
- [ ] All devices accessing via network IP (not localhost)
- [ ] Backend server is running on port 3001
- [ ] No console errors related to notifications

## Quick Test

1. Open app on Device A
2. Open app on Device B
3. Open DevTools console on both devices
4. On Device A, trigger SOS alert
5. Watch console on Device B for:
   - `🆕 New emergency detected`
   - `📬 ✅ Notification shown`
   - `🔔 Creating notification`
   - `✅ Notification created successfully`

If you see all these logs but no notification appears:
- Check system notification settings
- Check browser notification settings
- Try manually testing notification (Step 5)

