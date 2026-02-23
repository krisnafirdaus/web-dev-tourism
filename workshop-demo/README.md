# 🏨 Workshop Web Development untuk Industri Perhotelan

Repository ini berisi kode dan demo untuk workshop 2 hari tentang pengembangan web untuk industri perhotelan.

## 📁 Struktur Folder

```
workshop-demo/
├── day1-frontend/          # Demo Front-End (HTML, CSS, JS)
│   ├── index.html         # Landing Page Hotel
│   ├── styles.css         # Styling lengkap
│   └── script.js          # Interaktivitas
│
├── day2-backend/          # Demo Back-End (Node.js, Express)
│   ├── server.js          # REST API Server
│   ├── database.sql       # Database Schema
│   ├── payment-gateway.js # Payment Gateway Integration
│   └── package.json       # Dependencies
│
└── shared/                # Shared Resources
    └── presentation-helper.html  # Interactive presentation tool
```

---

## 🚀 Day 1: Front-End Development

### Live Demo
Akses demo: **https://web-dev-tourism.vercel.app/**

### Demo Landing Page Hotel

Landing page lengkap untuk hotel "Villa Serenity Bali" dengan fitur:

- ✅ **Responsive Navigation** - Menu hamburger untuk mobile
- ✅ **Hero Section** - Gambar background dengan overlay gradient
- ✅ **Booking Form** - Form pemesanan dengan validasi tanggal
- ✅ **Room Showcase** - Grid card untuk tipe kamar
- ✅ **Amenities Section** - Fasilitas hotel
- ✅ **Testimonials** - Review tamu dengan foto
- ✅ **Smooth Animations** - Hover effects dan scroll animations

### Cara Menjalankan Day 1

```bash
cd day1-frontend

# Buka di browser (cara 1)
open index.html

# Atau jalankan dengan live server (cara 2)
npx live-server
```

### Konsep yang Dicover

1. **HTML5 Semantic Elements**
   - `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
   - Form elements dengan validasi

2. **CSS3 Features**
   - CSS Variables (Custom Properties)
   - Flexbox dan Grid Layout
   - Media Queries untuk responsive design
   - Transitions dan Animations
   - Gradient backgrounds

3. **JavaScript**
   - DOM Manipulation
   - Event Listeners
   - Form validation
   - Intersection Observer untuk scroll animations
   - Toast notifications

---

## ⚙️ Day 2: Back-End Development

### REST API Server

Server Express.js dengan endpoints lengkap untuk sistem booking hotel:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/hotels` | GET | List semua hotel |
| `/api/hotels/:id` | GET | Detail hotel |
| `/api/rooms` | GET | List kamar (dengan filter) |
| `/api/rooms/:id` | GET | Detail kamar |
| `/api/bookings` | GET | List bookings |
| `/api/bookings` | POST | Create booking |
| `/api/bookings/:id` | GET | Detail booking |
| `/api/bookings/:id/cancel` | PATCH | Cancel booking |
| `/api/payments/:id/pay` | POST | Process payment |
| `/api/dashboard/stats` | GET | Statistics |

### Cara Menjalankan Day 2

```bash
cd day2-backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env dengan API keys Anda

# Jalankan server
npm start

# Atau dengan nodemon untuk auto-reload
npm run dev
```

Server akan berjalan di `http://localhost:3000`

### Database Schema

File `database.sql` berisi:

- **Tables**: hotels, rooms, guests, bookings, payments, users
- **Views**: room_availability, booking_details
- **Stored Procedures**: check_room_availability, create_booking, process_payment
- **Triggers**: Audit logging
- **Seed Data**: Sample data untuk testing

Untuk import ke MySQL:

```bash
mysql -u root -p < database.sql
```

### Payment Gateway Integration

File `payment-gateway.js` berisi contoh integrasi dengan:

- **Midtrans** - Snap, Core API, webhook handling
- **Xendit** - Invoice, Virtual Account, e-Wallet
- **Duitku** - Transaction, callback verification

Setup environment variables:

```env
# Midtrans
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key

# Xendit
XENDIT_API_KEY=your_api_key

# Duitku
DUITKU_MERCHANT_CODE=your_merchant_code
DUITKU_API_KEY=your_api_key
```

---

## 🎓 Interactive Presentation Helper

Buka `shared/presentation-helper.html` untuk:

- 📚 **Reference Code** - HTML, CSS, JS, SQL examples
- 📝 **Quiz** - Test pengetahuan peserta
- 🔌 **API Tester** - Test endpoint langsung dari browser
- 📋 **Cheat Sheet** - Glosarium istilah teknis

---

## 🎯 Alur Sistem Booking

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    User     │────▶│   Frontend  │────▶│   Backend   │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                                │
                       ┌────────────────────────┘
                       ▼
              ┌─────────────────┐
              │  Database (SQL) │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Payment Gateway │
              │ (Midtrans/etc)  │
              └─────────────────┘
```

### Flow Booking:

1. **User** memilih kamar dan tanggal di frontend
2. **Frontend** kirim request ke backend
3. **Backend** cek availability (dengan locking)
4. **Backend** create temporary hold (15 menit)
5. **Backend** generate payment token dari PG
6. **User** diarahkan ke halaman payment
7. **Payment Gateway** kirim webhook ke backend
8. **Backend** confirm booking & release hold

---

## 🔒 Security Best Practices

1. **Input Validation** - Sanitize semua input user
2. **SQL Injection Prevention** - Gunakan parameterized queries
3. **HTTPS** - Enkripsi komunikasi
4. **Authentication** - JWT atau session-based auth
5. **Rate Limiting** - Cegah brute force attacks
6. **Webhook Verification** - Validasi signature

---

## 📚 Resources untuk Belajar

### Frontend
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

### Backend
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Tutorial](https://restfulapi.net/)

### Database
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [SQLBolt](https://sqlbolt.com/)

### Payment Gateway
- [Midtrans Documentation](https://docs.midtrans.com/)
- [Xendit API Reference](https://developers.xendit.co/)
- [Duitku Documentation](https://docs.duitku.com/)

---

## 🤝 Contributing

Feel free untuk fork dan modify kode sesuai kebutuhan workshop Anda!

## 📄 License

MIT License - Free for educational use.

---

**Selamat mengajar! 🎉**
