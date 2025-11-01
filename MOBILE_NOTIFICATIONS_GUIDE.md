# Mobile Device Notifications Guide

## Important: Mobile Browser Notifications

Notifications work differently on mobile devices. This guide explains how to set up notifications on mobile browsers.

## Mobile Browser Support

### ✅ Supported:
- **Chrome (Android):** Full support
- **Samsung Internet (Android):** Full support
- **Firefox (Android):** Full support
- **Edge (Android):** Full support

### ⚠️ Limited Support:
- **Safari (iOS):** Works, but requires HTTPS in production
- **Chrome (iOS):** Uses Safari WebView - limited support

## Setup Instructions

### For Android Devices:

#### Chrome/Samsung Internet/Edge:
1. Open the app in browser: `http://YOUR_IP:8080`
2. When browser asks for notification permission, tap **"Allow"**
3. If you missed the prompt:
   - Tap **⋮** (three dots) → **Settings** → **Site Settings** → **Notifications**
   - Find the site and set to **"Allow"**

#### Firefox:
1. Open the app
2. Tap the lock icon in address bar
3. Tap **"More Information"**
4. Go to **Permissions** → **Notifications** → **Allow**

### For iOS Devices (iPhone/iPad):

#### Safari:
1. Open the app in Safari: `http://YOUR_IP:8080`
2. Tap **"Aa"** icon → **"Website Settings"**
3. Enable **"Ask"** or **"Allow"** for Notifications
4. When prompted, tap **"Allow"**

**Note:** iOS notifications require HTTPS in production. For local development:
- Use `http://` (will work for development)
- For production, HTTPS is required

## Testing on Mobile Devices

### Step 1: Grant Permission

**Device A (Sender):**
1. Open app: `http://YOUR_SERVER_IP:8080`
2. Allow notifications when prompted
3. Check console (if using remote debugging) for: `✅ Notification permission granted!`

**Device B (Receiver):**
1. Open app: `http://YOUR_SERVER_IP:8080`
2. Allow notifications when prompted
3. Check console for: `✅ Started polling for SOS alerts`

### Step 2: Test Notification

1. **Device A:** Trigger SOS alert
2. **Device B:** Should receive notification within 5 seconds

### Step 3: Verify Network

Both devices must:
- ✅ Be on same Wi-Fi network
- ✅ Access app via network IP (not localhost)
- ✅ Backend accessible: `http://YOUR_SERVER_IP:3001/api`

## Troubleshooting Mobile Notifications

### Issue 1: No Permission Prompt Appears

**Solution:**
1. Clear browser data for the site
2. Reload the page
3. Permission prompt should appear

**Or manually enable:**
- Chrome: Settings → Site Settings → Notifications
- Safari: Settings → Safari → Notifications

### Issue 2: Permission Denied

**Check:**
1. Browser notification settings
2. System notification settings (Android/iOS)
3. Do Not Disturb mode (turn off)

**Enable:**
- Android: Settings → Apps → Browser → Notifications → Enable
- iOS: Settings → Notifications → Safari → Allow Notifications

### Issue 3: Notifications Not Showing

**Check:**
1. Browser console for errors (use remote debugging)
2. API is accessible: `http://YOUR_IP:3001/api/emergencies`
3. Emergency has `status: "Pending"`
4. Emergency was created recently (within 3 minutes)

### Issue 4: iOS Safari Not Working

**Reasons:**
- HTTPS required (if not on localhost)
- Safari has stricter notification policies

**Solutions:**
- For development: Use HTTP on local network (will work)
- For production: Set up HTTPS certificate

## Mobile-Specific Features

### Vibration
- Android: Notifications vibrate automatically (if enabled)
- iOS: Vibration requires user interaction

### Sound
- Both: System notification sound plays
- User can customize in device settings

### Lock Screen
- Android: Notifications show on lock screen
- iOS: Shows if enabled in system settings

## Remote Debugging (Advanced)

### Android Chrome:
1. Connect device via USB
2. Enable USB debugging
3. Open `chrome://inspect` on desktop Chrome
4. Inspect mobile browser
5. View console logs

### iOS Safari:
1. On iPhone: Settings → Safari → Advanced → Web Inspector
2. On Mac: Safari → Develop → [Your iPhone] → [Your Website]
3. View console logs

## Network Requirements

### Both Devices Must:
1. **Same Network:** Connect to same Wi-Fi
2. **Network IP:** Use `http://192.168.x.x:8080` (not localhost)
3. **Backend Access:** `http://192.168.x.x:3001/api` must be accessible

### Find Your Network IP:
```bash
# Linux/Mac
ip addr | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

## Quick Test Checklist

- [ ] Device A and B on same Wi-Fi network
- [ ] Both accessing via network IP (not localhost)
- [ ] Both granted notification permission
- [ ] Backend server running on port 3001
- [ ] Backend accessible from both devices
- [ ] Console shows polling logs on Device B
- [ ] Device A triggers SOS alert
- [ ] Device B receives notification

## Console Logs to Look For

### On Device B (Receiver):

**On Load:**
```
📱 Detected mobile device
🔐 Requesting notification permission...
✅ Notification permission granted!
✅ Started polling for SOS alerts { isMobile: true, ... }
```

**When Polling:**
```
🔍 Polling for new emergencies...
📋 Found X emergencies
🆕 New emergency detected: { ... }
📬 ✅ Notification shown for emergency: E...
🔔 Creating notification: { ... }
✅ Notification created successfully
```

If you see these logs but no notification:
- Check system notification settings
- Check browser notification settings
- Try enabling notifications manually

