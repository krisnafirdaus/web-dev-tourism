/**
 * PAYMENT GATEWAY INTEGRATION EXAMPLES
 * Workshop Web Development untuk Industri Perhotelan - Day 2
 * 
 * Contoh integrasi dengan payment gateway populer di Indonesia:
 * - Midtrans
 * - Xendit
 * - Duitku
 */

const express = require('express');
const crypto = require('crypto');

// ============================================
// MIDTRANS INTEGRATION
// ============================================

class MidtransIntegration {
    constructor(serverKey, clientKey, isProduction = false) {
        this.serverKey = serverKey;
        this.clientKey = clientKey;
        this.baseUrl = isProduction 
            ? 'https://app.midtrans.com' 
            : 'https://app.sandbox.midtrans.com';
    }

    // Generate Snap Token untuk frontend
    async createSnapToken(bookingData) {
        const payload = {
            transaction_details: {
                order_id: bookingData.bookingNumber,
                gross_amount: bookingData.amount
            },
            customer_details: {
                first_name: bookingData.guestName,
                email: bookingData.guestEmail,
                phone: bookingData.guestPhone
            },
            item_details: [{
                id: bookingData.roomId,
                price: bookingData.pricePerNight,
                quantity: bookingData.nights,
                name: `${bookingData.roomType} - ${bookingData.hotelName}`
            }],
            callbacks: {
                finish: `${bookingData.baseUrl}/payment/finish`,
                error: `${bookingData.baseUrl}/payment/error`,
                pending: `${bookingData.baseUrl}/payment/pending`
            }
        };

        try {
            const response = await fetch(`${this.baseUrl}/snap/v1/transactions`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return {
                success: true,
                token: data.token,
                redirect_url: data.redirect_url
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verifikasi notifikasi webhook dari Midtrans
    verifyNotification(notification) {
        const { order_id, status_code, gross_amount, signature_key } = notification;
        
        // Generate signature untuk verifikasi
        const payload = order_id + status_code + gross_amount + this.serverKey;
        const generatedSignature = crypto.createHash('sha512').update(payload).digest('hex');
        
        return signature_key === generatedSignature;
    }

    // Cek status transaksi
    async checkStatus(orderId) {
        try {
            const response = await fetch(`${this.baseUrl}/v2/${orderId}/status`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(this.serverKey + ':').toString('base64')
                }
            });

            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }
}

// ============================================
// XENDIT INTEGRATION
// ============================================

class XenditIntegration {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.xendit.co';
    }

    // Create Invoice (Virtual Account, E-Wallet, QRIS, Retail)
    async createInvoice(bookingData) {
        const payload = {
            external_id: bookingData.bookingNumber,
            amount: bookingData.amount,
            payer_email: bookingData.guestEmail,
            description: `Booking ${bookingData.roomType} at ${bookingData.hotelName}`,
            invoice_duration: 900, // 15 menit dalam detik
            success_redirect_url: `${bookingData.baseUrl}/payment/success`,
            failure_redirect_url: `${bookingData.baseUrl}/payment/failed`,
            currency: 'IDR',
            reminder_time: 1, // Reminder 1 menit sebelum expired
            payment_methods: ['CREDIT_CARD', 'BCA', 'BNI', 'MANDIRI', 'PERMATA', 'OVO', 'DANA', 'QRIS', 'ALFAMART', 'INDOMARET']
        };

        try {
            const response = await fetch(`${this.baseUrl}/v2/invoices`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(this.apiKey + ':').toString('base64')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return {
                success: true,
                invoice_id: data.id,
                invoice_url: data.invoice_url,
                expiry_date: data.expiry_date,
                available_banks: data.available_banks,
                available_retail_outlets: data.available_retail_outlets,
                available_ewallets: data.available_ewallets,
                available_qr_codes: data.available_qr_codes
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Create Virtual Account (spesifik untuk VA)
    async createVirtualAccount(bookingData, bankCode) {
        const payload = {
            external_id: `${bookingData.bookingNumber}-${bankCode}`,
            bank_code: bankCode, // BCA, BNI, BRI, MANDIRI, PERMATA
            name: bookingData.guestName.substring(0, 255),
            expected_amount: bookingData.amount,
            is_closed: true,
            expiration_date: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 menit
        };

        try {
            const response = await fetch(`${this.baseUrl}/callback_virtual_accounts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + Buffer.from(this.apiKey + ':').toString('base64')
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return {
                success: true,
                va_number: data.account_number,
                bank_code: data.bank_code,
                expiration_date: data.expiration_date
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Verifikasi webhook callback
    verifyWebhook(requestBody, callbackToken) {
        return callbackToken === this.apiKey;
    }

    // Get Invoice
    async getInvoice(invoiceId) {
        try {
            const response = await fetch(`${this.baseUrl}/v2/invoices/${invoiceId}`, {
                headers: {
                    'Authorization': 'Basic ' + Buffer.from(this.apiKey + ':').toString('base64')
                }
            });

            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }
}

// ============================================
// DUITKU INTEGRATION
// ============================================

class DuitkuIntegration {
    constructor(merchantCode, apiKey, isProduction = false) {
        this.merchantCode = merchantCode;
        this.apiKey = apiKey;
        this.baseUrl = isProduction 
            ? 'https://passport.duitku.com' 
            : 'https://sandbox.duitku.com';
    }

    // Get Payment Methods
    async getPaymentMethods(amount) {
        const timestamp = Date.now();
        const signature = crypto
            .createHash('md5')
            .update(this.merchantCode + timestamp + this.apiKey)
            .digest('hex');

        const payload = {
            merchantcode: this.merchantCode,
            amount: amount,
            datetime: timestamp,
            signature: signature
        };

        try {
            const response = await fetch(`${this.baseUrl}/webapi/api/merchant/paymentmethod/getpaymentmethod`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    // Create Transaction
    async createTransaction(bookingData, paymentMethod) {
        const timestamp = Date.now();
        const merchantOrderId = bookingData.bookingNumber;
        const signature = crypto
            .createHash('md5')
            .update(this.merchantCode + merchantOrderId + bookingData.amount + this.apiKey)
            .digest('hex');

        const payload = {
            merchantCode: this.merchantCode,
            paymentAmount: bookingData.amount,
            paymentMethod: paymentMethod,
            merchantOrderId: merchantOrderId,
            productDetails: `Booking ${bookingData.roomType}`,
            additionalParam: JSON.stringify({ booking_id: bookingData.bookingId }),
            merchantUserInfo: bookingData.guestName,
            customerVaName: bookingData.guestName,
            email: bookingData.guestEmail,
            phoneNumber: bookingData.guestPhone,
            callbackUrl: `${bookingData.baseUrl}/api/webhooks/duitku`,
            returnUrl: `${bookingData.baseUrl}/payment/return`,
            signature: signature,
            expiryPeriod: 15 // 15 menit
        };

        try {
            const response = await fetch(`${this.baseUrl}/webapi/api/merchant/v2/inquiry`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            
            if (data.statusCode === '00') {
                return {
                    success: true,
                    reference: data.reference,
                    vaNumber: data.vaNumber,
                    amount: data.amount,
                    paymentUrl: data.paymentUrl,
                    statusCode: data.statusCode,
                    statusMessage: data.statusMessage
                };
            } else {
                return {
                    success: false,
                    error: data.statusMessage
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Check Transaction Status
    async checkStatus(merchantOrderId) {
        const signature = crypto
            .createHash('md5')
            .update(this.merchantCode + merchantOrderId + this.apiKey)
            .digest('hex');

        const payload = {
            merchantCode: this.merchantCode,
            merchantOrderId: merchantOrderId,
            signature: signature
        };

        try {
            const response = await fetch(`${this.baseUrl}/webapi/api/merchant/transactionStatus`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            return await response.json();
        } catch (error) {
            return { error: error.message };
        }
    }

    // Verify Callback
    verifyCallback(callbackData) {
        const { merchantCode, amount, merchantOrderId, signature, resultCode } = callbackData;
        
        const expectedSignature = crypto
            .createHash('md5')
            .update(merchantCode + amount + merchantOrderId + this.apiKey)
            .digest('hex');
        
        return signature === expectedSignature && resultCode === '00';
    }
}

// ============================================
// PAYMENT SERVICE (Unified Interface)
// ============================================

class PaymentService {
    constructor(config) {
        this.midtrans = config.midtrans ? new MidtransIntegration(
            config.midtrans.serverKey,
            config.midtrans.clientKey,
            config.midtrans.isProduction
        ) : null;

        this.xendit = config.xendit ? new XenditIntegration(
            config.xendit.apiKey
        ) : null;

        this.duitku = config.duitku ? new DuitkuIntegration(
            config.duitku.merchantCode,
            config.duitku.apiKey,
            config.duitku.isProduction
        ) : null;
    }

    // Process payment based on selected gateway
    async processPayment(gateway, bookingData, options = {}) {
        switch (gateway.toLowerCase()) {
            case 'midtrans':
                return await this.midtrans.createSnapToken(bookingData);
            
            case 'xendit':
                if (options.paymentType === 'va') {
                    return await this.xendit.createVirtualAccount(bookingData, options.bankCode);
                }
                return await this.xendit.createInvoice(bookingData);
            
            case 'duitku':
                return await this.duitku.createTransaction(bookingData, options.paymentMethod);
            
            default:
                return { success: false, error: 'Unknown payment gateway' };
        }
    }

    // Verify webhook callback
    verifyWebhook(gateway, requestData, headers) {
        switch (gateway.toLowerCase()) {
            case 'midtrans':
                return this.midtrans.verifyNotification(requestData);
            
            case 'xendit':
                return this.xendit.verifyWebhook(requestData, headers['x-callback-token']);
            
            case 'duitku':
                return this.duitku.verifyCallback(requestData);
            
            default:
                return false;
        }
    }
}

// ============================================
// EXPRESS ROUTES (Contoh Implementasi)
// ============================================

function createPaymentRoutes(paymentService) {
    const router = express.Router();

    // Create Payment
    router.post('/create', async (req, res) => {
        const { gateway, bookingData, options } = req.body;
        
        const result = await paymentService.processPayment(gateway, bookingData, options);
        
        if (result.success) {
            res.json({
                success: true,
                data: result
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error
            });
        }
    });

    // Webhook Handler
    router.post('/webhook/:gateway', (req, res) => {
        const { gateway } = req.params;
        
        // Verifikasi signature
        const isValid = paymentService.verifyWebhook(gateway, req.body, req.headers);
        
        if (!isValid) {
            return res.status(401).json({ success: false, message: 'Invalid signature' });
        }

        // Process notification
        console.log(`✅ Valid webhook received from ${gateway}:`, req.body);
        
        // Update database status booking
        // ...

        // Selalu return 200 untuk webhook
        res.json({ success: true });
    });

    // Payment Callback Pages
    router.get('/finish', (req, res) => {
        res.send(`
            <html>
                <body style="text-align: center; font-family: Arial; padding: 50px;">
                    <h1>✅ Pembayaran Berhasil!</h1>
                    <p>Terima kasih telah melakukan pembayaran.</p>
                    <p>Booking ID: ${req.query.order_id}</p>
                    <a href="/">Kembali ke Home</a>
                </body>
            </html>
        `);
    });

    router.get('/pending', (req, res) => {
        res.send(`
            <html>
                <body style="text-align: center; font-family: Arial; padding: 50px;">
                    <h1>⏳ Menunggu Pembayaran</h1>
                    <p>Pembayaran Anda sedang diproses.</p>
                    <p>Booking ID: ${req.query.order_id}</p>
                </body>
            </html>
        `);
    });

    router.get('/error', (req, res) => {
        res.send(`
            <html>
                <body style="text-align: center; font-family: Arial; padding: 50px;">
                    <h1>❌ Pembayaran Gagal</h1>
                    <p>Maaf, terjadi kesalahan saat memproses pembayaran.</p>
                    <a href="/">Coba Lagi</a>
                </body>
            </html>
        `);
    });

    return router;
}

// ============================================
// EXPORTS
// ============================================

module.exports = {
    MidtransIntegration,
    XenditIntegration,
    DuitkuIntegration,
    PaymentService,
    createPaymentRoutes
};

// ============================================
// USAGE EXAMPLE
// ============================================
/*

// Setup Payment Service
const paymentService = new PaymentService({
    midtrans: {
        serverKey: process.env.MIDTRANS_SERVER_KEY,
        clientKey: process.env.MIDTRANS_CLIENT_KEY,
        isProduction: false
    },
    xendit: {
        apiKey: process.env.XENDIT_API_KEY
    },
    duitku: {
        merchantCode: process.env.DUITKU_MERCHANT_CODE,
        apiKey: process.env.DUITKU_API_KEY,
        isProduction: false
    }
});

// In your Express app
const app = express();
app.use('/api/payments', createPaymentRoutes(paymentService));

// Create payment
const result = await paymentService.processPayment('midtrans', {
    bookingNumber: 'BK202602210001',
    amount: 1500000,
    guestName: 'John Doe',
    guestEmail: 'john@example.com',
    guestPhone: '081234567890',
    roomId: 1,
    roomType: 'Deluxe Room',
    hotelName: 'Villa Serenity Bali',
    pricePerNight: 1500000,
    nights: 1,
    baseUrl: 'https://yourhotel.com'
});

*/
