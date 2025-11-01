# 🚨 SOS Alert API - Quick Reference

## Endpoint

```
POST http://localhost:3001/api/sos-alert
```
or
```
POST http://YOUR_IP:3001/api/sos-alert
```

## Quick Test

### Using cURL
```bash
curl -X POST http://localhost:3001/api/sos-alert \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "location": "Tamaghat",
    "type": "Accident"
  }'
```

### Using Browser/JavaScript
```javascript
fetch('http://localhost:3001/api/sos-alert', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    wardNo: 'Ward 16',
    location: 'Tamaghat',
    phone: '1234567890',
    type: 'Accident'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

## Required Fields
- `name` - Person's name
- `location` - Emergency location  
- `type` - Emergency type (Accident, Pregnancy, Medical, etc.)

## Optional Fields
- `wardNo` - Ward number (default: "Ward 16")
- `phone` - Phone number
- `lat` - Latitude
- `lng` - Longitude

## Response
```json
{
  "success": true,
  "message": "SOS Alert triggered successfully",
  "emergency": {
    "id": "E1761936502009",
    "name": "John Doe",
    "status": "Pending",
    ...
  }
}
```

## How It Works

1. **POST to `/api/sos-alert`** → Saves emergency to `db.json`
2. **Mobile app polls `/api/emergencies`** → Detects new alert
3. **Mobile app shows notification** → User receives alert

See `SOS_API_DOCS.md` for full documentation.

