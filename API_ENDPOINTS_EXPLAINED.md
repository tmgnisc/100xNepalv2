# API Endpoints Explained

## API Endpoint Structure

### Base URL
- Local: `http://localhost:3001`
- Network: `http://YOUR_IP:3001`

## Endpoints

### 1. **GET `/emergencies`** (Direct - No /api prefix)
- **Purpose:** Fetch all emergencies
- **Query Params:** `?_sort=id&_order=desc&_limit=20`
- **Works:** ✅ Yes (no route rewrite issues with query params)
- **Used by:** Notification polling service

**Example:**
```
GET http://localhost:3001/emergencies?_sort=id&_order=desc&_limit=20
```

### 2. **GET `/api/emergencies`** (Via route rewrite)
- **Purpose:** Fetch all emergencies (via routes.json rewrite)
- **Query Params:** `?_sort=id&_order=desc&_limit=20`
- **Works:** ❌ NO - 404 error with query params
- **Why:** JSON Server route rewrite doesn't handle query parameters correctly
- **Used by:** None (we use direct endpoint instead)

### 3. **POST `/api/emergencies`**
- **Purpose:** Create new emergency
- **Body:** Emergency object
- **Works:** ✅ Yes (POST doesn't use query params)
- **Used by:** RuralPanel when triggering SOS

**Example:**
```json
POST http://localhost:3001/api/emergencies
Content-Type: application/json

{
  "id": "E1234567890",
  "name": "John Doe",
  "type": "Accident",
  "status": "Pending",
  ...
}
```

### 4. **POST `/api/sos-alert`** ⭐ Special Endpoint
- **Purpose:** Trigger SOS alert (custom middleware endpoint)
- **Body:** Emergency data (name, location, type, etc.)
- **Works:** ✅ Yes
- **Used by:** RuralPanel when triggering SOS (called in addition to POST /api/emergencies)
- **Note:** This is a **trigger** endpoint, not for polling

**Example:**
```json
POST http://localhost:3001/api/sos-alert
Content-Type: application/json

{
  "name": "John Doe",
  "location": "Tamaghat",
  "type": "Accident",
  "wardNo": "Ward 16",
  "phone": "1234567890"
}
```

### 5. **GET `/api/sos-alert`**
- **Purpose:** Get API documentation
- **Works:** ✅ Yes
- **Returns:** Usage information

## Why Two Endpoints for Creating Emergency?

When you trigger SOS alert:

1. **POST `/api/emergencies`** - Saves to database (standard JSON Server endpoint)
2. **POST `/api/sos-alert`** - Also saves to database + triggers SOS alert logic (custom middleware)

Both are called to ensure the emergency is saved and the SOS system is activated.

## For Polling (Notification Service)

**Use:** `GET /emergencies?_sort=id&_order=desc&_limit=20`

**Don't use:** `GET /api/emergencies?...` (causes 404 with query params)

## Fixed in Code

The notification service now uses the direct endpoint:
```typescript
// Before (caused 404):
const url = `${API_ENDPOINTS.emergencies}?_sort=id&_order=desc&_limit=20`;
// This was: http://localhost:3001/api/emergencies?_sort=id...

// After (works):
const apiBaseUrl = API_ENDPOINTS.emergencies.replace('/api/emergencies', '');
const directUrl = `${apiBaseUrl}/emergencies?_sort=id&_order=desc&_limit=20`;
// This is: http://localhost:3001/emergencies?_sort=id...
```

This fixes the 404 errors you were seeing!

