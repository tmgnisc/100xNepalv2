#!/bin/bash

API_URL="http://localhost:3001/api/sos-alert"

echo "🧪 Testing Fixed SOS Alert API..."
echo ""

# Test 1: GET endpoint
echo "📋 Test 1: GET /api/sos-alert"
curl -s "$API_URL"
echo ""
echo ""

# Test 2: POST with valid data
echo "📤 Test 2: POST /api/sos-alert (Valid Data)"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "location": "Tamaghat",
    "type": "Accident"
  }' | python3 -m json.tool 2>/dev/null || curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","location":"Tamaghat","type":"Accident"}'
echo ""
echo ""

# Test 3: Verify it's saved
echo "✅ Test 3: Verify emergency saved (GET /api/emergencies)"
curl -s "http://localhost:3001/api/emergencies?_limit=1" | python3 -m json.tool 2>/dev/null || curl -s "http://localhost:3001/api/emergencies?_limit=1"
echo ""
echo ""

echo "✅ Testing complete!"

