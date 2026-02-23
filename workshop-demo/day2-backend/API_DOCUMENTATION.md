# 🏨 Hotel Booking API Documentation

Dokumentasi lengkap untuk REST API Hotel Booking System.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

---

## 🔐 Authentication

Beberapa endpoints memerlukan authentication. Sertakan token di header:

```http
Authorization: Bearer <your_jwt_token>
```

---

## 📍 Endpoints

### Hotels

#### Get All Hotels
```http
GET /hotels
```

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "id": 1,
      "name": "Villa Serenity Bali",
      "address": "Jl. Raya Ubud No. 123, Bali",
      "description": "Pengalaman menginap mewah...",
      "rating": 4.8,
      "amenities": ["WiFi", "Pool", "Spa"]
    }
  ]
}
```

#### Get Hotel by ID
```http
GET /hotels/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Villa Serenity Bali",
    ...
  }
}
```

---

### Rooms

#### Get All Rooms
```http
GET /rooms
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| hotel_id | number | Filter by hotel |
| checkin | date | Check-in date (YYYY-MM-DD) |
| checkout | date | Check-out date (YYYY-MM-DD) |
| guests | number | Minimum capacity |

**Example:**
```http
GET /rooms?hotel_id=1&checkin=2026-03-01&checkout=2026-03-05&guests=2
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "filters": {
    "hotel_id": "1",
    "checkin": "2026-03-01",
    "checkout": "2026-03-05",
    "guests": "2"
  },
  "data": [
    {
      "id": 1,
      "hotel_id": 1,
      "room_type": "Deluxe Room",
      "price_per_night": 1500000,
      "capacity": 2,
      "availability_status": "available"
    }
  ]
}
```

#### Get Room by ID
```http
GET /rooms/:id
```

---

### Bookings

#### Create Booking
```http
POST /bookings
```

**Request Body:**
```json
{
  "room_id": 1,
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "guest_phone": "+6281234567890",
  "check_in": "2026-03-01",
  "check_out": "2026-03-05",
  "adults": 2,
  "children": 0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Booking created successfully. Please complete payment within 15 minutes.",
  "data": {
    "booking": {
      "id": "uuid-string",
      "booking_number": "BK20260221ABC123",
      "room_id": 1,
      "guest_name": "John Doe",
      "guest_email": "john@example.com",
      "check_in": "2026-03-01",
      "check_out": "2026-03-05",
      "adults": 2,
      "children": 0,
      "total_amount": 6000000,
      "status": "pending",
      "created_at": "2026-02-21T10:00:00.000Z"
    },
    "payment_deadline": "2026-02-21T10:15:00.000Z",
    "payment_url": "/api/payments/uuid-string/pay"
  }
}
```

#### Get All Bookings
```http
GET /bookings
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (pending, confirmed, cancelled) |
| guest_email | string | Filter by guest email |

#### Get Booking by ID
```http
GET /bookings/:id
```

#### Cancel Booking
```http
PATCH /bookings/:id/cancel
```

**Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "uuid-string",
    "status": "cancelled",
    ...
  }
}
```

---

### Payments

#### Process Payment
```http
POST /payments/:booking_id/pay
```

**Request Body:**
```json
{
  "payment_method": "credit_card"
}
```

Available payment methods:
- `credit_card`
- `virtual_account`
- `e_wallet`
- `qris`

**Response:**
```json
{
  "success": true,
  "message": "Payment successful!",
  "data": {
    "payment": {
      "id": "uuid-string",
      "booking_id": "booking-uuid",
      "amount": 6000000,
      "payment_method": "credit_card",
      "transaction_id": "TRXABC123",
      "status": "success",
      "payment_date": "2026-02-21T10:05:00.000Z"
    },
    "booking": {
      "id": "booking-uuid",
      "booking_number": "BK20260221ABC123",
      "status": "confirmed"
    }
  }
}
```

---

### Dashboard

#### Get Statistics
```http
GET /dashboard/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hotels": 2,
    "rooms": 8,
    "bookings": {
      "total": 50,
      "confirmed": 35,
      "pending": 10,
      "cancelled": 5
    },
    "revenue": {
      "total": 150000000,
      "formatted": "Rp 150.000.000"
    },
    "active_holds": 3
  }
}
```

---

## 🪝 Webhooks

### Payment Notification

Payment gateway akan mengirim notifikasi ke endpoint berikut:

```http
POST /webhooks/payment
```

**Headers:**
```http
X-Webhook-Signature: <signature>
Content-Type: application/json
```

**Request Body (Midtrans example):**
```json
{
  "transaction_time": "2026-02-21 10:05:00",
  "transaction_status": "settlement",
  "transaction_id": "uuid-transaction",
  "status_code": "200",
  "signature_key": "signature-hash",
  "payment_type": "credit_card",
  "order_id": "BK20260221ABC123",
  "gross_amount": "6000000.00"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook received"
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Hotel not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "message": "Room is not available for selected dates"
}
```

### 410 Gone (Payment Expired)
```json
{
  "success": false,
  "message": "Payment time has expired. Please create a new booking."
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📊 Status Codes

### Booking Status
| Status | Description |
|--------|-------------|
| pending | Menunggu pembayaran |
| confirmed | Pembayaran berhasil |
| cancelled | Dibatalkan |
| checked_in | Tamu sudah check-in |
| checked_out | Tamu sudah check-out |

### Payment Status
| Status | Description |
|--------|-------------|
| pending | Menunggu pembayaran |
| success | Pembayaran berhasil |
| failed | Pembayaran gagal |
| refunded | Dana dikembalikan |
| expired | Masa berlaku habis |

---

## 🧪 Testing dengan cURL

### Create Booking
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": 1,
    "guest_name": "Test User",
    "guest_email": "test@example.com",
    "check_in": "2026-04-01",
    "check_out": "2026-04-03",
    "adults": 2
  }'
```

### Process Payment
```bash
curl -X POST http://localhost:3000/api/payments/{booking_id}/pay \
  -H "Content-Type: application/json" \
  -d '{"payment_method": "credit_card"}'
```

### Get Available Rooms
```bash
curl "http://localhost:3000/api/rooms?hotel_id=1&checkin=2026-04-01&checkout=2026-04-03"
```

---

## 📚 Postman Collection

Import file berikut ke Postman untuk testing:

```json
{
  "info": {
    "name": "Hotel Booking API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "Get Hotels",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/hotels"
      }
    },
    {
      "name": "Get Rooms",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/rooms?hotel_id=1"
      }
    },
    {
      "name": "Create Booking",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "{{base_url}}/api/bookings",
        "body": {
          "mode": "raw",
          "raw": "{\"room_id\": 1, \"guest_name\": \"John\", \"guest_email\": \"john@test.com\", \"check_in\": \"2026-04-01\", \"check_out\": \"2026-04-03\", \"adults\": 2}"
        }
      }
    }
  ]
}
```

---

## 🤝 Support

Untuk pertanyaan atau issue, silakan hubungi:
- Email: support@workshop.com
- Documentation: https://docs.yourapi.com
