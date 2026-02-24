# 💳 Payment Gateway Demo Guide

Panduan lengkap mendemonstrasikan payment gateway untuk Workshop Day 2.

## 🎯 Apa yang Bisa Ditunjukkan?

Karena keterbatasan workshop (tidak punya akun merchant verified), kita menggunakan **SIMULASI** yang realistis:

| Aspek | Realita | Solusi Workshop |
|-------|---------|-----------------|
| Akun Merchant | Butuh NIB, NPWP, dokumen legal | **Mock/Simulasi** |
| Transaksi Sungguhan | Ada biaya (meskipun sandbox) | **Simulasi Flow** |
| Callback ke localhost | PG butuh URL publik | **Mock Webhook** |
| Dashboard Merchant | Butuh login | **Screenshot/Dokumentasi** |

---

## 🚀 Demo Payment Gateway (Simulasi)

### 1. List Payment Methods

**Endpoint:** `GET http://localhost:3000/demo/payment-methods`

**Response:**
```json
{
  "success": true,
  "data": {
    "midtrans": {
      "name": "Midtrans",
      "methods": ["Credit Card", "GoPay", "ShopeePay", "QRIS", "Virtual Account"]
    },
    "xendit": {
      "name": "Xendit",
      "methods": ["Credit Card", "VA", "e-Wallet", "QRIS", "Retail"]
    }
  }
}
```

### 2. Create Mock Payment

**Endpoint:** `POST http://localhost:3000/demo/create-mock-payment`

**Request:**
```json
{
  "gateway": "midtrans",
  "bookingData": {
    "bookingNumber": "BK202602210001",
    "amount": 1500000,
    "guestEmail": "guest@example.com",
    "roomType": "Deluxe Room"
  }
}
```

**Response:**
```json
{
  "success": true,
  "gateway": "midtrans",
  "note": "MOCK PAYMENT - Ini adalah simulasi untuk demo workshop",
  "data": {
    "token": "MOCK_a1b2c3d4e5f6",
    "redirect_url": "http://localhost:3000/demo/mock-midtrans?token=...",
    "enabled_payments": ["credit_card", "gopay", "qris"]
  }
}
```

### 3. Mock Payment Pages

Buka di browser untuk melihat simulasi halaman pembayaran:

#### Midtrans Simulation
```
http://localhost:3000/demo/mock-midtrans?token=MOCK_TOKEN&booking=BK001
```

Tampilan:
- Logo Midtrans
- Pilihan metode pembayaran (Credit Card, GoPay, QRIS, VA)
- Tombol "Simulate Payment"
- Notice bahwa ini mock

#### Xendit Simulation
```
http://localhost:3000/demo/mock-xendit?invoice=mock_inv_123
```

Tampilan:
- Logo Xendit
- Tab: Virtual Account / e-Wallet / QRIS
- Nomor VA simulasi
- QR Code placeholder
- Timer countdown

---

## 📝 Script Demo untuk Presentasi (10 menit)

### Menit 1-2: Jelaskan Konsep

> "Bayangkan tamu sudah pilih kamar, isi data, klik 'Bayar'. Apa yang terjadi?
> 
> Website kita harus terhubung dengan **Payment Gateway** - yaitu perantara yang menghubungkan kita dengan bank/e-wallet."

### Menit 3-4: Tunjukkan Flow di Whiteboard/Diagram

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   User      │────▶│  Our Website │────▶│   Midtrans   │
│             │     │   (Backend)  │     │  (Snap API)  │
└─────────────┘     └──────────────┘     └──────┬───────┘
                                                │
                       ┌────────────────────────┘
                       ▼
              ┌─────────────────┐
              │ User Membayar   │
              │ (VA/QRIS/etc)   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Webhook        │
              │  Notification   │
              └─────────────────┘
```

### Menit 5-6: Demo API Request

```bash
# Terminal 1: Jalankan server
npm start

# Terminal 2: Test API
curl -X POST http://localhost:3000/demo/create-mock-payment \
  -H "Content-Type: application/json" \
  -d '{
    "gateway": "midtrans",
    "bookingData": {
      "bookingNumber": "BK001",
      "amount": 1500000,
      "guestEmail": "test@example.com"
    }
  }'
```

### Menit 7-8: Demo Mock Payment Page

> "Kalau kita buka `redirect_url` di browser, ini yang dilihat user:"

Buka di browser:
```
http://localhost:3000/demo/mock-midtrans?token=DEMO&booking=BK001
```

**Jelaskan:**
- "Ini adalah **simulasi** halaman Midtrans asli"
- "User bisa pilih metode pembayaran"
- "Di production, ini domain asli midtrans.com"

### Menit 9-10: Jelaskan Webhook

> "Setelah user bayar, Payment Gateway kirim **webhook** ke server kita."

```bash
# Simulate webhook
curl -X POST http://localhost:3000/demo/simulate-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "booking": "BK001",
    "status": "success",
    "method": "gopay"
  }'
```

> "Server kita terima notifikasi → Update database → Kirim email konfirmasi ke tamu"

---

## 📊 Screenshot Dashboard Merchant (untuk slide)

Meskipun tidak bisa login live, tunjukkan screenshot dari dokumentasi resmi:

### Midtrans Dashboard
```
https://dashboard.midtrans.com (production)
https://dashboard.sandbox.midtrans.com (sandbox)
```

Fitur yang ditunjukkan:
- Overview transaksi
- Daftar payment methods
- Transaction details
- Webhook configuration

### Xendit Dashboard
```
https://dashboard.xendit.co
```

Fitur yang ditunjukkan:
- Invoice list
- Payment methods settings
- API keys management
- Webhook logs

---

## 💰 Biaya Transaksi (Real Data)

| Payment Method | Midtrans | Xendit | Duitku |
|----------------|----------|--------|--------|
| Credit Card | 2.9% - 3.2% | 2.9% + Rp 500 | 2.9% |
| Virtual Account | 1.5% - 2% | 1.5% - 2% | 1.5% |
| GoPay/OVO | 2% | 1.5% - 2% | 1.8% |
| QRIS | 0.7% | 0.7% | 0.7% |
| Alfamart/Indomaret | Fixed fee | Fixed fee | Fixed fee |

**Catatan untuk peserta:**
> "Biaya ini dibebankan ke merchant (hotel), bukan ke customer. Makanya banyak hotel yang berikan harga berbeda untuk booking langsung vs OTA."

---

## 🔧 Alur Integrasi ( untuk development lanjutan)

### Step-by-Step Integration:

1. **Register Account**
   - Daftar di Midtrans/Xendit
   - Submit dokumen (NIB, NPWP, dll)
   - Tunggu approval (1-3 hari kerja)

2. **Get API Keys**
   - Server Key (backend)
   - Client Key (frontend)

3. **Implement di Backend**
   ```javascript
   // Generate Snap Token (Midtrans)
   const snapResponse = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
     method: 'POST',
     headers: {
       'Authorization': 'Basic ' + Buffer.from(SERVER_KEY + ':').toString('base64'),
       'Content-Type': 'application/json'
     },
     body: JSON.stringify({
       transaction_details: {
         order_id: 'BOOKING_001',
         gross_amount: 1500000
       }
     })
   });
   ```

4. **Implement di Frontend**
   ```javascript
   // Load Snap.js
   <script src="https://app.sandbox.midtrans.com/snap/snap.js"></script>
   
   // Open payment popup
   snap.pay('SNAP_TOKEN', {
     onSuccess: function(result) { /* handle success */ },
     onPending: function(result) { /* handle pending */ },
     onError: function(result) { /* handle error */ }
   });
   ```

5. **Setup Webhook URL**
   - Must be HTTPS
   - Must accessible from internet (bukan localhost)
   - Gunakan ngrok untuk development

---

## 🧪 Testing dengan ngrok (Opsional)

Kalau ingin demo webhook yang realistis:

```bash
# 1. Install ngrok
npm install -g ngrok

# 2. Start backend
npm start

# 3. Expose localhost
ngrok http 3000

# 4. Dapat URL publik (misal: https://abc123.ngrok.io)
#    Masukkan ke dashboard payment gateway sebagai webhook URL
```

---

## ✅ Checklist Demo Payment Gateway

Sebelum presentasi:
- [ ] Server backend sudah jalan (`npm start`)
- [ ] Test endpoint `/demo/payment-methods`
- [ ] Test create mock payment
- [ ] Buka mock payment page di browser
- [ ] Siapkan screenshot dashboard merchant (jika ada)
- [ ] Siapkan script penjelasan flow

---

## 📚 Resources untuk Peserta

Dokumentasi resmi:
- **Midtrans**: https://docs.midtrans.com/
- **Xendit**: https://developers.xendit.co/
- **Duitku**: https://docs.duitku.com/

Sandbox Signup:
- Midtrans Sandbox: https://account.midtrans.com/register
- Xendit: https://dashboard.xendit.co/register

---

**Catatan Penting:**
> "Demo hari ini menggunakan SIMULASI karena keterbatasan akun merchant. Di development nyata, Anda akan:
> 1. Daftar akun sandbox (gratis)
> 2. Dapat API keys
> 3. Implement kode yang mirip dengan contoh kita
> 4. Test dengan saldo dummy"
