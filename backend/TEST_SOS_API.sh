#!/bin/bash

# Test script for SOS Alert API

API_URL="http://localhost:3001/api/sos-alert"

echo "🧪 Testing SOS Alert API..."
echo ""

# Test 1: GET endpoint (documentation)
echo "📋 Test 1: GET /api/sos-alert (Documentation)"
curl -s "$API_URL" | jq '.' || curl -s "$API_URL"
echo ""
echo ""

# Test 2: POST with minimal data
echo "📤 Test 2: POST /api/sos-alert (Minimal)"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "location": "Tamaghat",
    "type": "Accident"
  }' | jq '.' || curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","location":"Tamaghat","type":"Accident"}'
echo ""
echo ""

# Test 3: POST with full data
echo "📤 Test 3: POST /api/sos-alert (Full Data)"
curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "wardNo": "Ward 16",
    "location": "Tamaghat",
    "phone": "1234567890",
    "type": "Pregnancy",
    "lat": 27.6500,
    "lng": 85.4500
  }' | jq '.' || curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","wardNo":"Ward 16","location":"Tamaghat","phone":"1234567890","type":"Pregnancy"}'
echo ""
echo ""

# Test 4: Check if saved to emergencies
echo "✅ Test 4: Verify emergency saved"
echo "GET /api/emergencies"
curl -s "http://localhost:3001/api/emergencies" | jq '.[0]' || curl -s "http://localhost:3001/api/emergencies" | head -20
echo ""
echo ""

echo "✅ Testing complete!"

