# SOS Alert API Documentation

## Endpoint

**POST** `/api/sos-alert`

Triggers an SOS alert and saves it to the emergency database.

## Request

### URL
```
POST http://localhost:3001/api/sos-alert
```
Or on network:
```
POST http://YOUR_IP:3001/api/sos-alert
```

### Headers
```
Content-Type: application/json
```

### Request Body (JSON)

#### Required Fields:
- `name` (string): Name of the person in emergency
- `location` (string): Location of the emergency
- `type` (string): Type of emergency (e.g., "Accident", "Pregnancy", "Medical", "Fire")

#### Optional Fields:
- `wardNo` (string): Ward number (default: "Ward 16")
- `phone` (string): Phone number
- `lat` (number): Latitude coordinate
- `lng` (number): Longitude coordinate

### Example Request

```json
{
  "name": "John Doe",
  "wardNo": "Ward 16",
  "location": "Tamaghat",
  "phone": "1234567890",
  "type": "Accident"
}
```

## Response

### Success Response (201 Created)

```json
{
  "success": true,
  "message": "SOS Alert triggered successfully",
  "emergency": {
    "id": "E1761936502009",
    "name": "John Doe",
    "wardNo": "Ward 16",
    "location": "Tamaghat",
    "phone": "1234567890",
    "type": "Accident",
    "time": "12:31 AM",
    "status": "Pending",
    "lat": 27.6501,
    "lng": 85.4501,
    "createdAt": "2025-11-01T07:30:00.000Z"
  }
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Missing required fields",
  "missing": ["name", "location"]
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Failed to process SOS alert",
  "message": "Error details..."
}
```

## Usage Examples

### Using cURL

```bash
curl -X POST http://localhost:3001/api/sos-alert \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "wardNo": "Ward 16",
    "location": "Tamaghat",
    "phone": "1234567890",
    "type": "Accident"
  }'
```

### Using JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3001/api/sos-alert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    wardNo: 'Ward 16',
    location: 'Tamaghat',
    phone: '1234567890',
    type: 'Accident',
  }),
});

const result = await response.json();
console.log(result);
```

### Using Python (requests)

```python
import requests

url = 'http://localhost:3001/api/sos-alert'
data = {
    'name': 'John Doe',
    'wardNo': 'Ward 16',
    'location': 'Tamaghat',
    'phone': '1234567890',
    'type': 'Accident'
}

response = requests.post(url, json=data)
print(response.json())
```

## Testing the Endpoint

### Test with GET (Documentation)

```bash
curl http://localhost:3001/api/sos-alert
```

Returns API documentation and usage info.

### Test with POST (Trigger SOS)

```bash
curl -X POST http://localhost:3001/api/sos-alert \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","location":"Tamaghat","type":"Accident"}'
```

## Integration with Mobile App

The mobile app (`ApiService.ts`) polls `/api/emergencies` every 5 seconds to detect new alerts.

When you call `/api/sos-alert`:
1. ✅ Alert is saved to `db.json` → `emergencies` array
2. ✅ Mobile app detects it on next poll (within 5 seconds)
3. ✅ Mobile app shows notification and adds to alerts list

## Emergency Types

Common types:
- `Accident`
- `Pregnancy`
- `Medical`
- `Fire`
- `Natural Disaster`
- `Other`

## Notes

- All alerts are saved with status: `"Pending"`
- Each alert gets a unique ID: `E{timestamp}`
- Timestamp is automatically generated
- Coordinates default to Tamaghat area if not provided
- The emergency is added to the beginning of the emergencies array (most recent first)

