# JSON Server Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the JSON Server:**
   ```bash
   npm run server
   ```
   Server will run on `http://localhost:3001`

3. **Start both frontend and backend together:**
   ```bash
   npm run dev:full
   ```
   This runs both Vite dev server and JSON Server concurrently.

4. **Production mode (no watch):**
   ```bash
   npm run server:prod
   ```

## API Base URL

The API is available at: `http://localhost:3001/api`

## Available Endpoints

### Emergencies
- `GET /api/emergencies` - List all emergencies
- `GET /api/emergencies/:id` - Get specific emergency
- `POST /api/emergencies` - Create new emergency
- `PUT /api/emergencies/:id` - Update emergency
- `PATCH /api/emergencies/:id` - Partial update
- `DELETE /api/emergencies/:id` - Delete emergency

### Hospitals
- `GET /api/hospitals` - List all hospitals
- `GET /api/hospitals/:id` - Get specific hospital
- `PUT /api/hospitals/:id` - Update hospital

### Volunteers
- `GET /api/volunteers` - List all volunteers
- `GET /api/volunteers/:id` - Get specific volunteer

### Ambulances
- `GET /api/ambulances` - List all ambulances
- `GET /api/ambulances/:id` - Get specific ambulance

## Query Examples

### Filter by status
```
GET /api/emergencies?status=Pending
```

### Filter by multiple fields
```
GET /api/emergencies?status=Pending&type=Accident
```

### Sort results
```
GET /api/emergencies?_sort=time&_order=desc
```

### Pagination
```
GET /api/emergencies?_page=1&_limit=10
```

## Data Structure

All data is stored in `backend/db.json`. This file is automatically watched for changes during development.

## Integration

Use the API helper in `src/lib/api.ts` to make requests:

```typescript
import { apiRequest, API_ENDPOINTS } from '@/lib/api';

// Get all emergencies
const emergencies = await apiRequest(API_ENDPOINTS.emergencies);

// Create new emergency
const newEmergency = await apiRequest(API_ENDPOINTS.emergencies, {
  method: 'POST',
  body: JSON.stringify(emergencyData),
});

// Update emergency
const updated = await apiRequest(`${API_ENDPOINTS.emergencies}/${id}`, {
  method: 'PUT',
  body: JSON.stringify(updatedData),
});
```

