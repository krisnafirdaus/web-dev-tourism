/**
 * HOTEL BOOKING API - BACKEND DEMO
 * Workshop Web Development untuk Industri Perhotelan - Day 2
 * 
 * Fitur:
 * - REST API endpoints untuk hotels, rooms, bookings
 * - Simulasi database dengan in-memory storage
 * - Contoh integrasi payment gateway (simulasi)
 * - Error handling dan validasi
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// IN-MEMORY DATABASE (Simulasi)
// ============================================

// Data Hotels
const hotels = [
    {
        id: 1,
        name: "Villa Serenity Bali",
        address: "Jl. Raya Ubud No. 123, Bali",
        description: "Pengalaman menginap mewah dengan sentuhan tradisional Bali",
        rating: 4.8,
        amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym"],
        contact_info: {
            phone: "+62 361 1234567",
            email: "info@villaserenity.com"
        }
    },
    {
        id: 2,
        name: "Grand Kuta Resort",
        address: "Jl. Pantai Kuta No. 45, Bali",
        description: "Resort tepi pantai dengan pemandangan matahari terbenam",
        rating: 4.5,
        amenities: ["WiFi", "Beach Access", "Pool", "Bar", "Restaurant"],
        contact_info: {
            phone: "+62 361 7654321",
            email: "booking@grandkuta.com"
        }
    }
];

// Data Rooms
const rooms = [
    {
        id: 1,
        hotel_id: 1,
        room_type: "Deluxe Room",
        price_per_night: 1500000,
        capacity: 2,
        amenities: ["AC", "TV", "Mini Bar", "Bathtub"],
        availability_status: "available"
    },
    {
        id: 2,
        hotel_id: 1,
        room_type: "Executive Suite",
        price_per_night: 2800000,
        capacity: 3,
        amenities: ["AC", "TV", "Mini Bar", "Living Room", "Private Pool Access"],
        availability_status: "available"
    },
    {
        id: 3,
        hotel_id: 1,
        room_type: "Private Villa",
        price_per_night: 5500000,
        capacity: 4,
        amenities: ["AC", "TV", "Kitchen", "Private Pool", "Butler Service"],
        availability_status: "available"
    },
    {
        id: 4,
        hotel_id: 2,
        room_type: "Ocean View Room",
        price_per_night: 1200000,
        capacity: 2,
        amenities: ["AC", "TV", "Balcony", "Ocean View"],
        availability_status: "available"
    },
    {
        id: 5,
        hotel_id: 2,
        room_type: "Beach Suite",
        price_per_night: 2500000,
        capacity: 3,
        amenities: ["AC", "TV", "Living Room", "Beach Access"],
        availability_status: "available"
    }
];

// Data Bookings
let bookings = [];

// Data Guests
let guests = [];

// Data Payments
let payments = [];

// Room Holds (untuk mencegah double booking)
let roomHolds = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

// Format Rupiah
const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(amount);
};

// Validasi tanggal
const validateDates = (checkin, checkout) => {
    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkinDate < today) {
        return { valid: false, message: 'Check-in date cannot be in the past' };
    }
    if (checkoutDate <= checkinDate) {
        return { valid: false, message: 'Check-out must be after check-in' };
    }
    return { valid: true };
};

// Cek ketersediaan kamar
const checkRoomAvailability = (roomId, checkin, checkout) => {
    const conflictingBooking = bookings.find(b => {
        return b.room_id === roomId &&
               b.status !== 'cancelled' &&
               new Date(checkin) < new Date(b.check_out) &&
               new Date(checkout) > new Date(b.check_in);
    });

    const conflictingHold = roomHolds.find(h => {
        return h.room_id === roomId &&
               new Date(checkin) < new Date(h.check_out) &&
               new Date(checkout) > new Date(h.check_in) &&
               new Date(h.expires_at) > new Date();
    });

    return !conflictingBooking && !conflictingHold;
};

// Generate booking number
const generateBookingNumber = () => {
    return 'BK' + Date.now().toString(36).toUpperCase();
};

// ============================================
// API ROUTES - HOTELS
// ============================================

// GET /api/hotels - List semua hotel
app.get('/api/hotels', (req, res) => {
    res.json({
        success: true,
        count: hotels.length,
        data: hotels
    });
});

// GET /api/hotels/:id - Detail hotel
app.get('/api/hotels/:id', (req, res) => {
    const hotel = hotels.find(h => h.id === parseInt(req.params.id));
    if (!hotel) {
        return res.status(404).json({
            success: false,
            message: 'Hotel not found'
        });
    }
    res.json({
        success: true,
        data: hotel
    });
});

// ============================================
// API ROUTES - ROOMS
// ============================================

// GET /api/rooms - List semua kamar (dengan filter)
app.get('/api/rooms', (req, res) => {
    let { hotel_id, checkin, checkout, guests } = req.query;
    let availableRooms = [...rooms];

    // Filter by hotel
    if (hotel_id) {
        availableRooms = availableRooms.filter(r => r.hotel_id === parseInt(hotel_id));
    }

    // Filter by capacity
    if (guests) {
        availableRooms = availableRooms.filter(r => r.capacity >= parseInt(guests));
    }

    // Check availability for dates
    if (checkin && checkout) {
        const dateValidation = validateDates(checkin, checkout);
        if (!dateValidation.valid) {
            return res.status(400).json({
                success: false,
                message: dateValidation.message
            });
        }

        availableRooms = availableRooms.filter(r => 
            checkRoomAvailability(r.id, checkin, checkout)
        );
    }

    res.json({
        success: true,
        count: availableRooms.length,
        filters: { hotel_id, checkin, checkout, guests },
        data: availableRooms
    });
});

// GET /api/rooms/:id - Detail kamar
app.get('/api/rooms/:id', (req, res) => {
    const room = rooms.find(r => r.id === parseInt(req.params.id));
    if (!room) {
        return res.status(404).json({
            success: false,
            message: 'Room not found'
        });
    }
    
    const hotel = hotels.find(h => h.id === room.hotel_id);
    
    res.json({
        success: true,
        data: {
            ...room,
            hotel_name: hotel ? hotel.name : null
        }
    });
});

// ============================================
// API ROUTES - BOOKINGS
// ============================================

// POST /api/bookings - Create booking (dengan temporary hold)
app.post('/api/bookings', (req, res) => {
    const { 
        room_id, 
        guest_name, 
        guest_email, 
        guest_phone,
        check_in, 
        check_out, 
        adults = 1, 
        children = 0 
    } = req.body;

    // Validasi input
    if (!room_id || !guest_name || !guest_email || !check_in || !check_out) {
        return res.status(400).json({
            success: false,
            message: 'Please provide all required fields: room_id, guest_name, guest_email, check_in, check_out'
        });
    }

    // Validasi email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guest_email)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid email format'
        });
    }

    // Validasi tanggal
    const dateValidation = validateDates(check_in, check_out);
    if (!dateValidation.valid) {
        return res.status(400).json({
            success: false,
            message: dateValidation.message
        });
    }

    // Cek kamar exists
    const room = rooms.find(r => r.id === parseInt(room_id));
    if (!room) {
        return res.status(404).json({
            success: false,
            message: 'Room not found'
        });
    }

    // Cek ketersediaan
    if (!checkRoomAvailability(room.id, check_in, check_out)) {
        return res.status(409).json({
            success: false,
            message: 'Room is not available for selected dates'
        });
    }

    // Hitung total harga
    const nights = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
    const totalAmount = room.price_per_night * nights;

    // Create temporary hold (15 menit)
    const holdId = uuidv4();
    const holdExpiry = new Date();
    holdExpiry.setMinutes(holdExpiry.getMinutes() + 15);

    roomHolds.push({
        id: holdId,
        room_id: parseInt(room_id),
        check_in,
        check_out,
        expires_at: holdExpiry.toISOString()
    });

    // Create booking dengan status pending
    const booking = {
        id: uuidv4(),
        booking_number: generateBookingNumber(),
        room_id: parseInt(room_id),
        guest_name,
        guest_email,
        guest_phone: guest_phone || null,
        check_in,
        check_out,
        adults: parseInt(adults),
        children: parseInt(children),
        total_amount: totalAmount,
        status: 'pending', // pending, confirmed, cancelled, completed
        hold_id: holdId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    bookings.push(booking);

    // Create guest record jika belum ada
    const existingGuest = guests.find(g => g.email === guest_email);
    if (!existingGuest) {
        guests.push({
            id: uuidv4(),
            name: guest_name,
            email: guest_email,
            phone: guest_phone || null,
            created_at: new Date().toISOString()
        });
    }

    res.status(201).json({
        success: true,
        message: 'Booking created successfully. Please complete payment within 15 minutes.',
        data: {
            booking,
            payment_deadline: holdExpiry.toISOString(),
            payment_url: `/api/payments/${booking.id}/pay`
        }
    });
});

// GET /api/bookings - List bookings
app.get('/api/bookings', (req, res) => {
    const { status, guest_email } = req.query;
    let result = [...bookings];

    if (status) {
        result = result.filter(b => b.status === status);
    }

    if (guest_email) {
        result = result.filter(b => b.guest_email === guest_email);
    }

    res.json({
        success: true,
        count: result.length,
        data: result
    });
});

// GET /api/bookings/:id - Detail booking
app.get('/api/bookings/:id', (req, res) => {
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    const room = rooms.find(r => r.id === booking.room_id);
    const hotel = room ? hotels.find(h => h.id === room.hotel_id) : null;
    const payment = payments.find(p => p.booking_id === booking.id);

    res.json({
        success: true,
        data: {
            ...booking,
            room: room ? { ...room, hotel_name: hotel?.name } : null,
            payment: payment || null
        }
    });
});

// PATCH /api/bookings/:id/cancel - Cancel booking
app.patch('/api/bookings/:id/cancel', (req, res) => {
    const booking = bookings.find(b => b.id === req.params.id);
    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    if (booking.status === 'cancelled') {
        return res.status(400).json({
            success: false,
            message: 'Booking is already cancelled'
        });
    }

    if (booking.status === 'completed') {
        return res.status(400).json({
            success: false,
            message: 'Cannot cancel completed booking'
        });
    }

    // Update booking status
    booking.status = 'cancelled';
    booking.updated_at = new Date().toISOString();

    // Release hold
    const holdIndex = roomHolds.findIndex(h => h.id === booking.hold_id);
    if (holdIndex > -1) {
        roomHolds.splice(holdIndex, 1);
    }

    res.json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking
    });
});

// ============================================
// API ROUTES - PAYMENTS
// ============================================

// POST /api/payments/:booking_id/pay - Process payment (simulasi)
app.post('/api/payments/:booking_id/pay', (req, res) => {
    const { payment_method } = req.body;
    const booking = bookings.find(b => b.id === req.params.booking_id);

    if (!booking) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }

    if (booking.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: `Cannot process payment for booking with status: ${booking.status}`
        });
    }

    // Cek apakah hold masih valid
    const hold = roomHolds.find(h => h.id === booking.hold_id);
    if (!hold || new Date(hold.expires_at) < new Date()) {
        // Expire booking
        booking.status = 'cancelled';
        booking.updated_at = new Date().toISOString();
        return res.status(410).json({
            success: false,
            message: 'Payment time has expired. Please create a new booking.'
        });
    }

    // Simulasi proses payment
    const paymentMethods = ['credit_card', 'virtual_account', 'e_wallet', 'qris'];
    if (!payment_method || !paymentMethods.includes(payment_method)) {
        return res.status(400).json({
            success: false,
            message: `Invalid payment method. Accepted: ${paymentMethods.join(', ')}`
        });
    }

    // Generate transaction ID
    const transactionId = 'TRX' + Date.now().toString(36).toUpperCase();

    // Create payment record
    const payment = {
        id: uuidv4(),
        booking_id: booking.id,
        amount: booking.total_amount,
        payment_method,
        transaction_id: transactionId,
        status: 'success', // Simulasi: selalu success
        payment_date: new Date().toISOString(),
        created_at: new Date().toISOString()
    };

    payments.push(payment);

    // Update booking status
    booking.status = 'confirmed';
    booking.updated_at = new Date().toISOString();

    // Release hold
    const holdIndex = roomHolds.findIndex(h => h.id === booking.hold_id);
    if (holdIndex > -1) {
        roomHolds.splice(holdIndex, 1);
    }

    res.json({
        success: true,
        message: 'Payment successful!',
        data: {
            payment,
            booking: {
                id: booking.id,
                booking_number: booking.booking_number,
                status: booking.status
            }
        }
    });
});

// GET /api/payments/:booking_id/status - Check payment status
app.get('/api/payments/:booking_id/status', (req, res) => {
    const payment = payments.find(p => p.booking_id === req.params.booking_id);
    
    if (!payment) {
        return res.status(404).json({
            success: false,
            message: 'Payment not found'
        });
    }

    res.json({
        success: true,
        data: payment
    });
});

// ============================================
// API ROUTES - WEBHOOK (Simulasi dari Payment Gateway)
// ============================================

// POST /api/webhooks/payment - Webhook untuk notifikasi payment
app.post('/api/webhooks/payment', (req, res) => {
    const { transaction_id, status, booking_id } = req.body;

    // Verifikasi signature (simulasi)
    const signature = req.headers['x-webhook-signature'];
    if (!signature) {
        return res.status(401).json({
            success: false,
            message: 'Missing webhook signature'
        });
    }

    console.log(`📩 Webhook received: ${transaction_id} - ${status}`);

    // Process webhook
    const booking = bookings.find(b => b.id === booking_id);
    if (booking && status === 'success') {
        booking.status = 'confirmed';
        booking.updated_at = new Date().toISOString();
    }

    // Selalu return 200 untuk webhook
    res.json({
        success: true,
        message: 'Webhook received'
    });
});

// ============================================
// DASHBOARD ENDPOINTS (untuk admin)
// ============================================

// GET /api/dashboard/stats - Statistics
app.get('/api/dashboard/stats', (req, res) => {
    const totalBookings = bookings.length;
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = payments
        .filter(p => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);

    res.json({
        success: true,
        data: {
            hotels: hotels.length,
            rooms: rooms.length,
            bookings: {
                total: totalBookings,
                confirmed: confirmedBookings,
                pending: pendingBookings,
                cancelled: cancelledBookings
            },
            revenue: {
                total: totalRevenue,
                formatted: formatRupiah(totalRevenue)
            },
            active_holds: roomHolds.filter(h => new Date(h.expires_at) > new Date()).length
        }
    });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        available_endpoints: [
            'GET /api/hotels',
            'GET /api/hotels/:id',
            'GET /api/rooms',
            'GET /api/rooms/:id',
            'POST /api/bookings',
            'GET /api/bookings',
            'GET /api/bookings/:id',
            'PATCH /api/bookings/:id/cancel',
            'POST /api/payments/:booking_id/pay',
            'GET /api/dashboard/stats'
        ]
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║           🏨 HOTEL BOOKING API - DAY 2 DEMO              ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  Server running at: http://localhost:${PORT}               ║`);
    console.log('║                                                          ║');
    console.log('║  Available Endpoints:                                    ║');
    console.log('║  • GET  /api/hotels           - List hotels              ║');
    console.log('║  • GET  /api/rooms            - List rooms               ║');
    console.log('║  • POST /api/bookings         - Create booking           ║');
    console.log('║  • POST /api/payments/:id/pay - Process payment          ║');
    console.log('║  • GET  /api/dashboard/stats  - Statistics               ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
});

module.exports = app;
