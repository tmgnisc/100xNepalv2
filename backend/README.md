# JSON Server Backend

This folder contains the JSON Server setup for the AarogyaConnect application.

## Structure

- `db.json` - Main database file containing all static data
- `json-server.json` - JSON Server configuration
- `routes.json` - Custom route mappings for API endpoints

## Data Entities

- **emergencies** - Emergency alert records
- **hospitals** - Hospital information and resources
- **volunteers** - Volunteer and ambulance driver data
- **ambulances** - Ambulance fleet information

## Running the Server

```bash
# Install dependencies (if not already installed)
npm install

# Start JSON Server
npm run server

# Or with custom port
npx json-server --watch backend/db.json --port 3001
```

## API Endpoints

Base URL: `http://localhost:3001`

### Emergencies
- `GET /api/emergencies` - Get all emergencies
- `GET /api/emergencies/:id` - Get emergency by ID
- `POST /api/emergencies` - Create new emergency
- `PUT /api/emergencies/:id` - Update emergency
- `PATCH /api/emergencies/:id` - Partial update emergency
- `DELETE /api/emergencies/:id` - Delete emergency

### SOS Alert (Custom Endpoint)
- `POST /api/sos-alert` - **Trigger SOS alert** (saves to emergencies)
- `GET /api/sos-alert` - Get API documentation

**Example:**
```bash
curl -X POST http://localhost:3001/api/sos-alert \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","location":"Tamaghat","type":"Accident"}'
```

See `SOS_API_DOCS.md` for complete documentation.

### Hospitals
- `GET /api/hospitals` - Get all hospitals
- `GET /api/hospitals/:id` - Get hospital by ID
- `PUT /api/hospitals/:id` - Update hospital

### Volunteers
- `GET /api/volunteers` - Get all volunteers
- `GET /api/volunteers/:id` - Get volunteer by ID

### Ambulances
- `GET /api/ambulances` - Get all ambulances
- `GET /api/ambulances/:id` - Get ambulance by ID

## Notes

- The server watches for file changes and auto-reloads
- All data is stored in `db.json` (persisted locally)
- Use query parameters for filtering: `?status=Pending&type=Accident`
- Use `_sort` and `_order` for sorting: `?_sort=time&_order=desc`

