#!/bin/bash

# API Test Script for Day 2 Backend
# Usage: ./test-api.sh

BASE_URL="http://localhost:3000"

echo "🧪 Testing Hotel Booking API"
echo "============================"
echo ""

# Check if server is running
echo "[1/6] Checking if server is running..."
if curl -s "$BASE_URL/api/hotels" > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running!"
    echo "   Start the server first: npm start"
    exit 1
fi
echo ""

# Test 1: Get Hotels
echo "[2/6] Testing GET /api/hotels..."
HOTELS=$(curl -s "$BASE_URL/api/hotels")
if echo "$HOTELS" | grep -q "success"; then
    echo "✅ Hotels endpoint working"
    echo "   Found: $(echo "$HOTELS" | grep -o '"id"' | wc -l) hotels"
else
    echo "❌ Hotels endpoint failed"
fi
echo ""

# Test 2: Get Rooms
echo "[3/6] Testing GET /api/rooms..."
ROOMS=$(curl -s "$BASE_URL/api/rooms")
if echo "$ROOMS" | grep -q "success"; then
    echo "✅ Rooms endpoint working"
    ROOM_COUNT=$(echo "$ROOMS" | grep -o '"id"' | wc -l)
    echo "   Found: $ROOM_COUNT rooms"
else
    echo "❌ Rooms endpoint failed"
fi
echo ""

# Test 3: Create Booking
echo "[4/6] Testing POST /api/bookings..."
BOOKING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "check_in": "2026-12-01",
    "check_out": "2026-12-03",
    "adults": 2
  }')

if echo "$BOOKING_RESPONSE" | grep -q "success"; then
    echo "✅ Create booking endpoint working"
    BOOKING_ID=$(echo "$BOOKING_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   Created booking ID: $BOOKING_ID"
else
    echo "❌ Create booking endpoint failed"
    echo "   Response: $BOOKING_RESPONSE"
fi
echo ""

# Test 4: Process Payment (if booking created)
if [ ! -z "$BOOKING_ID" ]; then
    echo "[5/6] Testing POST /api/payments/:id/pay..."
    PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/payments/$BOOKING_ID/pay" \
      -H "Content-Type: application/json" \
      -d '{"payment_method": "credit_card"}')
    
    if echo "$PAYMENT_RESPONSE" | grep -q "success"; then
        echo "✅ Payment endpoint working"
        echo "   Payment successful!"
    else
        echo "❌ Payment endpoint failed"
        echo "   Response: $PAYMENT_RESPONSE"
    fi
else
    echo "[5/6] ⏭️  Skipping payment test (no booking created)"
fi
echo ""

# Test 5: Dashboard Stats
echo "[6/6] Testing GET /api/dashboard/stats..."
STATS=$(curl -s "$BASE_URL/api/dashboard/stats")
if echo "$STATS" | grep -q "success"; then
    echo "✅ Dashboard stats endpoint working"
    echo "   Data: $(echo "$STATS" | grep -o '"hotels":[0-9]*')"
else
    echo "❌ Dashboard stats endpoint failed"
fi
echo ""

echo "============================"
echo "🎉 API Testing Complete!"
echo "============================"
