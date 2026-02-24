/**
 * PAYMENT GATEWAY DEMO & SIMULATION
 * Untuk Workshop Day 2 - Tidak memerlukan API key asli
 * 
 * FITUR:
 * 1. Simulasi response dari Midtrans/Xendit/Duitku
 * 2. Mock payment flow lengkap
 * 3. Redirect page simulation
 * 4. Webhook simulation
 */

const express = require('express');
const router = express.Router();

// ============================================
// SIMULASI PAYMENT GATEWAY RESPONSE
// ============================================

/**
 * Simulasi response Midtrans Snap
 * Dalam kondisi nyata, ini datang dari API Midtrans
 */
function mockMidtransSnap(bookingData) {
    const token = 'MOCK_' + Math.random().toString(36).substring(2, 15);
    
    return {
        token: token,
        redirect_url: `http://localhost:3000/demo/payment/mock-midtrans?token=${token}&booking=${bookingData.bookingNumber}`,
        transaction_details: {
            order_id: bookingData.bookingNumber,
            gross_amount: bookingData.amount
        },
        // Simulasi metode pembayaran yang tersedia
        enabled_payments: ['credit_card', 'gopay', 'shopeepay', 'qris', 'bank_transfer']
    };
}

/**
 * Simulasi response Xendit Invoice
 */
function mockXenditInvoice(bookingData) {
    const invoiceId = 'mock_inv_' + Date.now();
    
    return {
        id: invoiceId,
        external_id: bookingData.bookingNumber,
        amount: bookingData.amount,
        payer_email: bookingData.guestEmail,
        description: `Booking ${bookingData.roomType}`,
        invoice_url: `http://localhost:3000/demo/payment/mock-xendit?invoice=${invoiceId}`,
        expiry_date: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        available_banks: [
            { bank_code: 'BCA', name: 'BCA', collection_type: 'POOL' },
            { bank_code: 'BNI', name: 'BNI', collection_type: 'POOL' },
            { bank_code: 'MANDIRI', name: 'Mandiri', collection_type: 'POOL' }
        ],
        available_ewallets: [
            { ewallet_type: 'GOPAY' },
            { ewallet_type: 'OVO' },
            { ewallet_type: 'DANA' }
        ],
        available_qr_codes: [
            { qr_code_type: 'QRIS' }
        ]
    };
}

/**
 * Simulasi response Duitku
 */
function mockDuitkuTransaction(bookingData, paymentMethod) {
    return {
        reference: 'DUITKU_' + Date.now(),
        vaNumber: paymentMethod === 'VA' ? '8877' + Math.floor(Math.random() * 1000000000) : null,
        amount: bookingData.amount,
        paymentUrl: `http://localhost:3000/demo/payment/mock-duitku?ref=${bookingData.bookingNumber}`,
        statusCode: '00',
        statusMessage: 'SUCCESS'
    };
}

// ============================================
// API ENDPOINTS - DEMO PAYMENT
// ============================================

// Get available payment methods (simulasi)
router.get('/payment-methods', (req, res) => {
    res.json({
        success: true,
        data: {
            midtrans: {
                name: 'Midtrans',
                methods: ['Credit Card', 'GoPay', 'ShopeePay', 'QRIS', 'Virtual Account', 'Bank Transfer']
            },
            xendit: {
                name: 'Xendit',
                methods: ['Credit Card', 'Virtual Account (BCA/BNI/Mandiri)', 'e-Wallet (OVO/DANA/GoPay)', 'QRIS', 'Alfamart/Indomaret']
            },
            duitku: {
                name: 'Duitku',
                methods: ['Virtual Account', 'QRIS', 'e-Wallet']
            }
        },
        note: 'Ini adalah simulasi. Di production, panggil API masing-masing gateway.'
    });
});

// Create mock payment
router.post('/create-mock-payment', (req, res) => {
    const { gateway, bookingData, paymentType } = req.body;
    
    let response;
    switch(gateway) {
        case 'midtrans':
            response = mockMidtransSnap(bookingData);
            break;
        case 'xendit':
            response = mockXenditInvoice(bookingData);
            break;
        case 'duitku':
            response = mockDuitkuTransaction(bookingData, paymentType);
            break;
        default:
            return res.status(400).json({
                success: false,
                message: 'Unknown gateway. Use: midtrans, xendit, or duitku'
            });
    }
    
    res.json({
        success: true,
        gateway: gateway,
        note: 'MOCK PAYMENT - Ini adalah simulasi untuk demo workshop',
        data: response,
        next_step: 'Buka redirect_url di browser untuk simulasi halaman pembayaran'
    });
});

// ============================================
// MOCK PAYMENT PAGES (Halaman simulasi PG)
// ============================================

// Mock Midtrans Payment Page
router.get('/mock-midtrans', (req, res) => {
    const { token, booking } = req.query;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Midtrans Payment Simulation</title>
            <style>
                body {
                    font-family: 'Segoe UI', sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    margin: 0;
                    padding: 50px 20px;
                    min-height: 100vh;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                }
                .header img {
                    width: 150px;
                    margin-bottom: 20px;
                }
                h1 { color: #333; margin-bottom: 10px; }
                .booking-info {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .payment-methods {
                    display: grid;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .method-btn {
                    padding: 15px 20px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                .method-btn:hover {
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(102,126,234,0.15);
                }
                .icon { font-size: 24px; }
                .method-name { font-weight: 600; flex: 1; text-align: left; }
                .badge {
                    background: #667eea;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                }
                .simulate-btn {
                    width: 100%;
                    padding: 16px;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: 600;
                    cursor: pointer;
                }
                .simulate-btn:hover { background: #5a6fd6; }
                .mock-notice {
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    color: #856404;
                    padding: 12px;
                    border-radius: 8px;
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏦 Midtrans Payment</h1>
                    <p>Complete your booking payment</p>
                </div>
                
                <div class="booking-info">
                    <strong>Booking:</strong> ${booking}<br>
                    <strong>Token:</strong> ${token}<br>
                    <strong>Amount:</strong> Rp 1.500.000
                </div>
                
                <div class="payment-methods">
                    <button class="method-btn" onclick="selectMethod(this)">
                        <span class="icon">💳</span>
                        <span class="method-name">Credit Card</span>
                        <span class="badge">Visa/MC</span>
                    </button>
                    <button class="method-btn" onclick="selectMethod(this)">
                        <span class="icon">📱</span>
                        <span class="method-name">GoPay</span>
                        <span class="badge">e-Wallet</span>
                    </button>
                    <button class="method-btn" onclick="selectMethod(this)">
                        <span class="icon">🔲</span>
                        <span class="method-name">QRIS</span>
                        <span class="badge">Scan QR</span>
                    </button>
                    <button class="method-btn" onclick="selectMethod(this)">
                        <span class="icon">🏧</span>
                        <span class="method-name">Virtual Account</span>
                        <span class="badge">BCA/BNI</span>
                    </button>
                </div>
                
                <button class="simulate-btn" onclick="simulatePayment()">
                    ✅ Simulate Successful Payment
                </button>
                
                <div class="mock-notice">
                    ⚠️ <strong>MOCK PAYMENT PAGE</strong><br>
                    Ini adalah halaman simulasi untuk demo workshop.<br>
                    Di production, ini adalah halaman asli dari Midtrans.
                </div>
            </div>
            
            <script>
                let selectedMethod = null;
                
                function selectMethod(btn) {
                    document.querySelectorAll('.method-btn').forEach(b => {
                        b.style.borderColor = '#e0e0e0';
                        b.style.background = 'white';
                    });
                    btn.style.borderColor = '#667eea';
                    btn.style.background = '#f0f3ff';
                    selectedMethod = btn.querySelector('.method-name').textContent;
                }
                
                function simulatePayment() {
                    if (!selectedMethod) {
                        alert('Please select a payment method first!');
                        return;
                    }
                    
                    // Simulate webhook call
                    fetch('/demo/simulate-webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            booking: '${booking}',
                            method: selectedMethod,
                            status: 'success'
                        })
                    })
                    .then(() => {
                        window.location.href = '/demo/payment/success?order_id=${booking}';
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Mock Xendit Payment Page
router.get('/mock-xendit', (req, res) => {
    const { invoice } = req.query;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Xendit Invoice - Simulation</title>
            <style>
                body {
                    font-family: -apple-system, sans-serif;
                    background: #f5f5f5;
                    margin: 0;
                    padding: 40px 20px;
                }
                .invoice-box {
                    max-width: 500px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                }
                .logo { 
                    text-align: center; 
                    margin-bottom: 30px;
                    font-size: 32px;
                }
                .amount {
                    text-align: center;
                    font-size: 36px;
                    font-weight: bold;
                    color: #333;
                    margin-bottom: 30px;
                }
                .methods-tabs {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                    overflow-x: auto;
                }
                .tab {
                    padding: 10px 20px;
                    background: #f0f0f0;
                    border-radius: 20px;
                    cursor: pointer;
                    white-space: nowrap;
                }
                .tab.active {
                    background: #4573d2;
                    color: white;
                }
                .method-content {
                    border: 1px solid #e0e0e0;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                .va-number {
                    background: #f8f9fa;
                    padding: 15px;
                    border-radius: 8px;
                    font-family: monospace;
                    font-size: 18px;
                    text-align: center;
                    margin: 15px 0;
                }
                .btn-primary {
                    width: 100%;
                    padding: 14px;
                    background: #4573d2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 16px;
                    cursor: pointer;
                }
                .timer {
                    text-align: center;
                    color: #666;
                    margin-top: 20px;
                }
                .mock-banner {
                    background: #e3f2fd;
                    border-left: 4px solid #4573d2;
                    padding: 12px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    font-size: 13px;
                }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <div class="mock-banner">
                    🔧 <strong>MOCK INVOICE</strong> - Halaman simulasi Xendit untuk demo
                </div>
                
                <div class="logo">⚡ Xendit</div>
                
                <div class="amount">Rp 2.800.000</div>
                
                <div class="methods-tabs">
                    <div class="tab active" onclick="switchTab(this, 'va')">Virtual Account</div>
                    <div class="tab" onclick="switchTab(this, 'ewallet')">e-Wallet</div>
                    <div class="tab" onclick="switchTab(this, 'qris')">QRIS</div>
                </div>
                
                <div id="va-content" class="method-content">
                    <p>Transfer ke Virtual Account:</p>
                    <div class="va-number">8877 1234 5678 9012</div>
                    <p style="text-align: center; color: #666;">Bank BCA</p>
                </div>
                
                <div id="ewallet-content" class="method-content" style="display:none">
                    <p>Pilih e-Wallet:</p>
                    <button style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px;">
                        🟢 OVO
                    </button>
                    <button style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px;">
                        🔵 GoPay
                    </button>
                    <button style="width:100%; padding:12px; margin:5px 0; border:1px solid #ddd; border-radius:8px;">
                        🟣 DANA
                    </button>
                </div>
                
                <div id="qris-content" class="method-content" style="display:none">
                    <p>Scan QRIS:</p>
                    <div style="text-align: center; padding: 20px;">
                        <div style="width: 200px; height: 200px; background: #f0f0f0; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 80px;">
                            🔲
                        </div>
                        <p style="margin-top: 10px; color: #666;">QR Code akan muncul di sini</p>
                    </div>
                </div>
                
                <button class="btn-primary" onclick="simulateSuccess()">
                    ✅ Simulasi Pembayaran Sukses
                </button>
                
                <div class="timer">⏱️ Bayar sebelum: 14:35 WIB</div>
            </div>
            
            <script>
                function switchTab(tab, method) {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    
                    document.getElementById('va-content').style.display = 'none';
                    document.getElementById('ewallet-content').style.display = 'none';
                    document.getElementById('qris-content').style.display = 'none';
                    document.getElementById(method + '-content').style.display = 'block';
                }
                
                function simulateSuccess() {
                    fetch('/demo/simulate-webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            invoice: '${invoice}',
                            status: 'PAID'
                        })
                    })
                    .then(() => {
                        alert('✅ Pembayaran berhasil!\n\nDi production, ini akan redirect ke halaman sukses hotel.');
                    });
                }
            </script>
        </body>
        </html>
    `);
});

// Success Page
router.get('/payment/success', (req, res) => {
    const { order_id } = req.query;
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Success</title>
            <style>
                body {
                    font-family: sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0;
                }
                .success-box {
                    background: white;
                    padding: 60px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                }
                .checkmark {
                    font-size: 80px;
                    color: #28a745;
                    margin-bottom: 20px;
                }
                h1 { color: #333; margin-bottom: 15px; }
                p { color: #666; margin-bottom: 30px; }
                .btn {
                    display: inline-block;
                    padding: 15px 40px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                }
            </style>
        </head>
        <body>
            <div class="success-box">
                <div class="checkmark">✓</div>
                <h1>Pembayaran Berhasil!</h1>
                <p>Booking <strong>${order_id}</strong> telah dikonfirmasi.</p>
                <p>Terima kasih telah memilih Villa Serenity Bali 🌴</p>
                <a href="/" class="btn">Kembali ke Website</a>
            </div>
        </body>
        </html>
    `);
});

// ============================================
// WEBHOOK SIMULATION
// ============================================

// Simulate webhook from payment gateway
router.post('/simulate-webhook', express.json(), (req, res) => {
    const { booking, method, status, invoice } = req.body;
    
    console.log('📩 Mock Webhook Received:');
    console.log('   Booking:', booking || invoice);
    console.log('   Method:', method);
    console.log('   Status:', status);
    console.log('   Timestamp:', new Date().toISOString());
    
    // In real scenario, this would update database
    // For demo, we just log it
    
    res.json({
        received: true,
        message: 'Webhook processed (mock)',
        data: req.body
    });
});

// Get transaction status (mock)
router.get('/transaction-status/:id', (req, res) => {
    // Simulate different statuses
    const statuses = ['pending', 'success', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    res.json({
        order_id: req.params.id,
        transaction_status: randomStatus,
        mock: true,
        note: 'Ini adalah data simulasi. Di production, query ke database.'
    });
});

module.exports = router;
