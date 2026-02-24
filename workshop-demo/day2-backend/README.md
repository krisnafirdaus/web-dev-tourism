# 🚀 Cara Menjalankan Backend API (Day 2)

Panduan lengkap menjalankan server backend untuk workshop Day 2.

## ⚙️ Prerequisites

- **Node.js** v18+ (Cek dengan: `node --version`)
- **npm** (sudah include dengan Node.js)

> 💡 **Catatan:** Node.js v18+ sudah memiliki `fetch()` API built-in. Jika menggunakan versi lebih lama (v16 atau dibawah), install `node-fetch@2`:
> ```bash
> npm install node-fetch@2
> ```

---

## 📝 Langkah-Langkah Menjalankan

### 1. Install Dependencies

```bash
cd workshop-demo/day2-backend
npm install
```

Ini akan menginstall:
- `express` - Framework web
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variables
- `uuid` - Generate unique IDs
- `nodemon` (dev) - Auto-reload saat development

### 2. Setup Environment Variables (Opsional)

```bash
# Copy file environment
cp .env.example .env

# Edit file .env (opsional untuk demo dasar)
# Untuk demo sederhana, file .env tidak wajib karena sudah ada default values
```

### 3. Jalankan Server

**Mode Production:**
```bash
npm start
```

**Mode Development (dengan auto-reload):**
```bash
npm run dev
```

### 4. Cek Server Berjalan

Jika berhasil, akan muncul output seperti ini:

```
╔══════════════════════════════════════════════════════════╗
║           🏨 HOTEL BOOKING API - DAY 2 DEMO              ║
╠══════════════════════════════════════════════════════════╣
║  Server running at: http://localhost:3000                ║
║                                                          ║
║  Available Endpoints:                                    ║
║  • GET  /api/hotels           - List hotels              ║
║  • GET  /api/rooms            - List rooms               ║
║  • POST /api/bookings         - Create booking           ║
║  • POST /api/payments/:id/pay - Process payment          ║
║  • GET  /api/dashboard/stats  - Statistics               ║
╚══════════════════════════════════════════════════════════╝
```

### 5. Test API

**Test di Browser:**
- Buka: http://localhost:3000/api/hotels
- Buka: http://localhost:3000/api/rooms

**Test dengan cURL:**
```bash
# Get all hotels
curl http://localhost:3000/api/hotels

# Get available rooms
curl "http://localhost:3000/api/rooms?hotel_id=1"

# Create booking
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

---

## 🔧 Troubleshooting

### Error: "Cannot find module 'express'"

**Solusi:**
```bash
npm install
```

### Error: "fetch is not defined"

**Solusi 1 (Upgrade Node.js):**
Upgrade ke Node.js v18+ dari https://nodejs.org

**Solusi 2 (Install node-fetch):**
```bash
npm install node-fetch@2
```

Lalu tambahkan di bagian atas `server.js`:
```javascript
const fetch = require('node-fetch');
```

### Error: "Port 3000 already in use"

**Solusi 1 - Ganti Port:**
```bash
PORT=3001 npm start
```

**Solusi 2 - Kill process yang menggunakan port 3000:**

**Mac/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

**Windows:**
```cmd
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Error: "EACCES: permission denied"

**Solusi:**
```bash
sudo npm install  # Mac/Linux
# atau
npm install --unsafe-perm  # Windows
```

### Error: "Cannot find module 'uuid'"

**Solusi:**
```bash
npm install uuid
```

---

## 🧪 Testing dengan Postman/Thunder Client

Import collection ini ke Postman:

```json
{
  "info": {
    "name": "Hotel Booking API - Day 2",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/"
  },
  "item": [
    {
      "name": "1. Get Hotels",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/hotels"
      }
    },
    {
      "name": "2. Get Available Rooms",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/rooms?hotel_id=1&checkin=2026-04-01&checkout=2026-04-03"
      }
    },
    {
      "name": "3. Create Booking",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:3000/api/bookings",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"room_id\": 1,\n  \"guest_name\": \"John Doe\",\n  \"guest_email\": \"john@example.com\",\n  \"check_in\": \"2026-04-01\",\n  \"check_out\": \"2026-04-03\",\n  \"adults\": 2\n}"
        }
      }
    },
    {
      "name": "4. Process Payment",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "url": "http://localhost:3000/api/payments/{{booking_id}}/pay",
        "body": {
          "mode": "raw",
          "raw": "{\n  \"payment_method\": \"credit_card\"\n}"
        }
      }
    },
    {
      "name": "5. Dashboard Stats",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/api/dashboard/stats"
      }
    }
  ]
}
```

---

## 🐛 Mode Debug

Jika ingin melihat log detail, tambahkan `DEBUG=true`:

```bash
DEBUG=true npm start
```

---

## 📱 Testing dari Frontend Day 1

Untuk menghubungkan frontend Day 1 dengan backend Day 2:

1. Pastikan backend berjalan di port 3000
2. Buka file `day1-frontend/script.js`
3. Cari baris yang mengandung `fetch('/api/...')`
4. Ganti menjadi `fetch('http://localhost:3000/api/...')`
5. Buka `index.html` dengan Live Server

**Catatan:** Akan ada CORS error jika langsung dibuka sebagai file. Gunakan Live Server atau http-server.

---

## 🎯 Quick Check: Server Sehat?

Jalankan command ini untuk memastikan semua endpoint bekerja:

```bash
# Test semua endpoint
echo "Testing API..."
curl -s http://localhost:3000/api/hotels | head -c 100
echo -e "\n✅ Hotels OK"

curl -s http://localhost:3000/api/rooms | head -c 100
echo -e "\n✅ Rooms OK"

curl -s http://localhost:3000/api/dashboard/stats | head -c 100
echo -e "\n✅ Stats OK"

echo -e "\n🎉 Server berjalan dengan baik!"
```

---

## 🛑 Menghentikan Server

Tekan `Ctrl + C` di terminal.

---

**Selamat mencoba! Jika ada error, cek bagian Troubleshooting di atas.** 🚀
