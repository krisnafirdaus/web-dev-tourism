-- ============================================
-- HOTEL BOOKING DATABASE SCHEMA
-- Workshop Web Development - Day 2
-- ============================================

-- Buat database
CREATE DATABASE IF NOT EXISTS hotel_booking;
USE hotel_booking;

-- ============================================
-- TABLE: hotels
-- ============================================
CREATE TABLE hotels (
    hotel_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    star_rating DECIMAL(2,1),
    amenities JSON,
    contact_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_star_rating (star_rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: rooms
-- ============================================
CREATE TABLE rooms (
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    hotel_id INT NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    price_per_night DECIMAL(12,2) NOT NULL,
    capacity INT NOT NULL DEFAULT 2,
    amenities JSON,
    description TEXT,
    availability_status ENUM('available', 'occupied', 'maintenance', 'reserved') DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id) ON DELETE CASCADE,
    INDEX idx_hotel_id (hotel_id),
    INDEX idx_room_type (room_type),
    INDEX idx_availability (availability_status),
    INDEX idx_price (price_per_night)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: guests
-- ============================================
CREATE TABLE guests (
    guest_id INT PRIMARY KEY AUTO_INCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    date_of_birth DATE,
    loyalty_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_loyalty (loyalty_points)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: bookings
-- ============================================
CREATE TABLE bookings (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_number VARCHAR(50) UNIQUE NOT NULL,
    guest_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    adults INT NOT NULL DEFAULT 1,
    children INT DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    status ENUM('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled') DEFAULT 'pending',
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (guest_id) REFERENCES guests(guest_id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    
    INDEX idx_booking_number (booking_number),
    INDEX idx_guest_id (guest_id),
    INDEX idx_room_id (room_id),
    INDEX idx_check_in (check_in),
    INDEX idx_status (status),
    INDEX idx_dates (check_in, check_out),
    
    -- Pastikan check_out setelah check_in
    CONSTRAINT chk_dates CHECK (check_out > check_in),
    -- Pastikan minimal 1 adult
    CONSTRAINT chk_adults CHECK (adults >= 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: room_holds (Temporary holds untuk mencegah double booking)
-- ============================================
CREATE TABLE room_holds (
    hold_id INT PRIMARY KEY AUTO_INCREMENT,
    room_id INT NOT NULL,
    booking_id INT,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    status ENUM('active', 'released', 'converted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL,
    
    INDEX idx_room_id (room_id),
    INDEX idx_expires (expires_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: payments
-- ============================================
CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method ENUM('credit_card', 'virtual_account', 'e_wallet', 'qris', 'bank_transfer', 'cash') NOT NULL,
    transaction_id VARCHAR(255),
    status ENUM('pending', 'success', 'failed', 'refunded', 'expired') DEFAULT 'pending',
    payment_gateway VARCHAR(50),
    payment_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_transaction (transaction_id),
    INDEX idx_status (status),
    INDEX idx_payment_date (payment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: users (untuk admin/staff)
-- ============================================
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'receptionist', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLE: audit_logs (untuk tracking perubahan)
-- ============================================
CREATE TABLE audit_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_by INT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- VIEWS
-- ============================================

-- View: Room availability
CREATE VIEW room_availability AS
SELECT 
    r.room_id,
    r.hotel_id,
    h.name as hotel_name,
    r.room_number,
    r.room_type,
    r.price_per_night,
    r.capacity,
    r.availability_status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM bookings b 
            WHERE b.room_id = r.room_id 
            AND b.status IN ('confirmed', 'checked_in')
            AND CURDATE() BETWEEN b.check_in AND b.check_out
        ) THEN 'occupied'
        WHEN EXISTS (
            SELECT 1 FROM room_holds h 
            WHERE h.room_id = r.room_id 
            AND h.status = 'active'
            AND h.expires_at > NOW()
            AND CURDATE() BETWEEN h.check_in AND h.check_out
        ) THEN 'reserved'
        ELSE r.availability_status
    END as current_status
FROM rooms r
JOIN hotels h ON r.hotel_id = h.hotel_id;

-- View: Booking details
CREATE VIEW booking_details AS
SELECT 
    b.booking_id,
    b.booking_number,
    g.first_name,
    g.last_name,
    g.email,
    g.phone,
    h.name as hotel_name,
    r.room_type,
    r.room_number,
    b.check_in,
    b.check_out,
    DATEDIFF(b.check_out, b.check_in) as nights,
    b.adults,
    b.children,
    b.total_amount,
    b.status,
    p.payment_method,
    p.status as payment_status,
    b.created_at
FROM bookings b
JOIN guests g ON b.guest_id = g.guest_id
JOIN rooms r ON b.room_id = r.room_id
JOIN hotels h ON r.hotel_id = h.hotel_id
LEFT JOIN payments p ON b.booking_id = p.booking_id;

-- ============================================
-- STORED PROCEDURES
-- ============================================

DELIMITER //

-- Procedure: Check room availability
CREATE PROCEDURE check_room_availability(
    IN p_room_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE
)
BEGIN
    SELECT 
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM bookings b 
                WHERE b.room_id = p_room_id 
                AND b.status IN ('confirmed', 'checked_in', 'pending')
                AND p_check_in < b.check_out 
                AND p_check_out > b.check_in
            ) THEN FALSE
            WHEN EXISTS (
                SELECT 1 FROM room_holds h 
                WHERE h.room_id = p_room_id 
                AND h.status = 'active'
                AND h.expires_at > NOW()
                AND p_check_in < h.check_out 
                AND p_check_out > h.check_in
            ) THEN FALSE
            ELSE TRUE
        END as is_available;
END //

-- Procedure: Create booking with hold
CREATE PROCEDURE create_booking(
    IN p_guest_id INT,
    IN p_room_id INT,
    IN p_check_in DATE,
    IN p_check_out DATE,
    IN p_adults INT,
    IN p_children INT,
    IN p_total_amount DECIMAL(12,2),
    OUT p_booking_id INT,
    OUT p_booking_number VARCHAR(50)
)
BEGIN
    DECLARE v_hold_id INT;
    DECLARE v_booking_num VARCHAR(50);
    
    -- Generate booking number
    SET v_booking_num = CONCAT('BK', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(FLOOR(RAND() * 10000), 4, '0'));
    
    -- Create hold terlebih dahulu
    INSERT INTO room_holds (room_id, check_in, check_out, expires_at)
    VALUES (p_room_id, p_check_in, p_check_out, DATE_ADD(NOW(), INTERVAL 15 MINUTE));
    
    SET v_hold_id = LAST_INSERT_ID();
    
    -- Create booking
    INSERT INTO bookings (
        booking_number, guest_id, room_id, check_in, check_out,
        adults, children, total_amount, status
    ) VALUES (
        v_booking_num, p_guest_id, p_room_id, p_check_in, p_check_out,
        p_adults, p_children, p_total_amount, 'pending'
    );
    
    SET p_booking_id = LAST_INSERT_ID();
    SET p_booking_number = v_booking_num;
    
    -- Update hold dengan booking_id
    UPDATE room_holds SET booking_id = p_booking_id WHERE hold_id = v_hold_id;
    
END //

-- Procedure: Process payment
CREATE PROCEDURE process_payment(
    IN p_booking_id INT,
    IN p_payment_method VARCHAR(20),
    IN p_transaction_id VARCHAR(255),
    IN p_amount DECIMAL(12,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert payment
    INSERT INTO payments (booking_id, amount, payment_method, transaction_id, status, payment_date)
    VALUES (p_booking_id, p_amount, p_payment_method, p_transaction_id, 'success', NOW());
    
    -- Update booking status
    UPDATE bookings SET status = 'confirmed' WHERE booking_id = p_booking_id;
    
    -- Release hold
    UPDATE room_holds 
    SET status = 'converted' 
    WHERE booking_id = p_booking_id AND status = 'active';
    
    COMMIT;
END //

-- Procedure: Cancel booking
CREATE PROCEDURE cancel_booking(
    IN p_booking_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Update booking status
    UPDATE bookings SET status = 'cancelled' WHERE booking_id = p_booking_id;
    
    -- Release hold
    UPDATE room_holds 
    SET status = 'released' 
    WHERE booking_id = p_booking_id AND status = 'active';
    
    -- Refund payment jika ada
    UPDATE payments 
    SET status = 'refunded', updated_at = NOW()
    WHERE booking_id = p_booking_id AND status = 'success';
    
    COMMIT;
END //

DELIMITER ;

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Hotels
INSERT INTO hotels (name, address, description, star_rating, amenities, contact_info) VALUES
('Villa Serenity Bali', 
 'Jl. Raya Ubud No. 123, Gianyar, Bali 80571', 
 'Pengalaman menginap mewah dengan sentuhan tradisional Bali. Terletak di jantung Ubud dengan pemandangan sawah yang menakjubkan.',
 5.0,
 '["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking", "Airport Transfer"]',
 '{"phone": "+62 361 1234567", "email": "info@villaserenity.com", "website": "www.villaserenity.com"}'
),
('Grand Kuta Resort', 
 'Jl. Pantai Kuta No. 45, Kuta, Bali 80361', 
 'Resort tepi pantai dengan pemandangan matahari terbenam yang indah. Lokasi strategis dekat dengan pusat hiburan Kuta.',
 4.5,
 '["WiFi", "Beach Access", "Pool", "Bar", "Restaurant", "Spa", "Parking"]',
 '{"phone": "+62 361 7654321", "email": "booking@grandkuta.com", "website": "www.grandkuta.com"}'
);

-- Insert Rooms for Villa Serenity Bali (hotel_id = 1)
INSERT INTO rooms (hotel_id, room_number, room_type, price_per_night, capacity, amenities, description) VALUES
(1, '101', 'Deluxe Room', 1500000, 2, '["AC", "TV", "Mini Bar", "Bathtub", "WiFi"]', 'Kamar luas dengan pemandangan taman tropis'),
(1, '102', 'Deluxe Room', 1500000, 2, '["AC", "TV", "Mini Bar", "Bathtub", "WiFi"]', 'Kamar luas dengan pemandangan taman tropis'),
(1, '201', 'Executive Suite', 2800000, 3, '["AC", "TV", "Mini Bar", "Living Room", "Private Pool Access", "WiFi"]', 'Suite mewah dengan ruang keluarga terpisah'),
(1, '301', 'Private Villa', 5500000, 4, '["AC", "TV", "Kitchen", "Private Pool", "Butler Service", "WiFi"]', 'Villa pribadi dengan kolam renang pribadi');

-- Insert Rooms for Grand Kuta Resort (hotel_id = 2)
INSERT INTO rooms (hotel_id, room_number, room_type, price_per_night, capacity, amenities, description) VALUES
(2, 'A101', 'Ocean View Room', 1200000, 2, '["AC", "TV", "Balcony", "Ocean View", "WiFi"]', 'Kamar dengan balkon dan pemandangan laut'),
(2, 'A102', 'Ocean View Room', 1200000, 2, '["AC", "TV", "Balcony", "Ocean View", "WiFi"]', 'Kamar dengan balkon dan pemandangan laut'),
(2, 'B201', 'Beach Suite', 2500000, 3, '["AC", "TV", "Living Room", "Beach Access", "WiFi"]', 'Suite dengan akses langsung ke pantai'),
(2, 'B202', 'Beach Suite', 2500000, 3, '["AC", "TV", "Living Room", "Beach Access", "WiFi"]', 'Suite dengan akses langsung ke pantai');

-- Insert Sample Guests
INSERT INTO guests (first_name, last_name, email, phone, address, city, country, loyalty_points) VALUES
('John', 'Doe', 'john.doe@email.com', '+62 812 3456 7890', 'Jl. Merdeka No. 1', 'Jakarta', 'Indonesia', 100),
('Jane', 'Smith', 'jane.smith@email.com', '+62 813 9876 5432', '456 Orchard Road', 'Singapore', 'Singapore', 250),
('Budi', 'Santoso', 'budi.santoso@email.com', '+62 878 1234 5678', 'Jl. Sudirman No. 45', 'Surabaya', 'Indonesia', 50);

-- Insert Admin User (password: admin123 - hashed)
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@hotel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('manager', 'manager@hotel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager'),
('receptionist', 'receptionist@hotel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'receptionist');

-- ============================================
-- INDEXES untuk Performance
-- ============================================

-- Composite index untuk booking queries
CREATE INDEX idx_booking_dates ON bookings(room_id, check_in, check_out);
CREATE INDEX idx_booking_status_dates ON bookings(status, check_in, check_out);

-- Index untuk guest search
CREATE INDEX idx_guest_name ON guests(last_name, first_name);

-- ============================================
-- TRIGGERS untuk Audit Log
-- ============================================

DELIMITER //

CREATE TRIGGER after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, new_values, changed_at)
    VALUES ('bookings', NEW.booking_id, 'INSERT', JSON_OBJECT(
        'booking_number', NEW.booking_number,
        'guest_id', NEW.guest_id,
        'room_id', NEW.room_id,
        'check_in', NEW.check_in,
        'check_out', NEW.check_out,
        'status', NEW.status
    ), NOW());
END //

CREATE TRIGGER after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (table_name, record_id, action, old_values, new_values, changed_at)
    VALUES ('bookings', NEW.booking_id, 'UPDATE', JSON_OBJECT(
        'status', OLD.status,
        'updated_at', OLD.updated_at
    ), JSON_OBJECT(
        'status', NEW.status,
        'updated_at', NEW.updated_at
    ), NOW());
END //

DELIMITER ;

-- ============================================
-- QUERIES EXAMPLES
-- ============================================

-- Query: Cek kamar tersedia untuk tanggal tertentu
-- SELECT * FROM room_availability 
-- WHERE hotel_id = 1 
-- AND current_status = 'available';

-- Query: Revenue report
-- SELECT 
--     DATE_FORMAT(p.payment_date, '%Y-%m') as month,
--     COUNT(*) as total_bookings,
--     SUM(p.amount) as total_revenue
-- FROM payments p
-- WHERE p.status = 'success'
-- GROUP BY DATE_FORMAT(p.payment_date, '%Y-%m')
-- ORDER BY month DESC;

-- Query: Occupancy rate
-- SELECT 
--     r.hotel_id,
--     h.name as hotel_name,
--     COUNT(DISTINCT r.room_id) as total_rooms,
--     COUNT(DISTINCT b.room_id) as occupied_rooms,
--     ROUND(COUNT(DISTINCT b.room_id) * 100.0 / COUNT(DISTINCT r.room_id), 2) as occupancy_rate
-- FROM rooms r
-- JOIN hotels h ON r.hotel_id = h.hotel_id
-- LEFT JOIN bookings b ON r.room_id = b.room_id 
--     AND b.status IN ('confirmed', 'checked_in')
--     AND CURDATE() BETWEEN b.check_in AND b.check_out
-- GROUP BY r.hotel_id, h.name;
