-- ==========================================
-- HRGSMS STORED PROCEDURES - COMPLETE COLLECTION
-- ==========================================
-- Description: All stored procedures for Hotel Reservation System
-- All procedures with correct lowercase table names and working functionality
-- Last Updated: Current consolidation
-- ==========================================

-- ================================
-- Authentication Procedures
-- ================================

DELIMITER $$

CREATE PROCEDURE sp_login_simple(
    IN p_username VARCHAR(100),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE v_userID INT UNSIGNED;
    DECLARE v_username VARCHAR(100);
    DECLARE v_userRole VARCHAR(20);
    DECLARE v_stored_hash VARBINARY(255);
    DECLARE v_salt VARBINARY(16);
    
    -- Get user data (using correct column name: userRole)
    SELECT userID, username, userRole, password_hash, salt 
    INTO v_userID, v_username, v_userRole, v_stored_hash, v_salt
    FROM user_account 
    WHERE username = p_username;
    
    -- Check if user exists
    IF v_userID IS NULL THEN
        SELECT 0 as success, 'Invalid credentials' as message;
    ELSE
        -- For demo purposes, accept simple passwords
        -- In production, you would hash the password with salt and compare
        IF (p_username = 'admin' AND p_password = 'admin123') OR
           (p_username = 'manager' AND p_password = 'manager123') OR
           (p_username = 'reception' AND p_password = 'reception123') OR
           (p_username = 'staff' AND p_password = 'staff123') THEN
            SELECT 1 as success, v_userID as userID, v_username as username, v_userRole as userRole;
        ELSE
            SELECT 0 as success, 'Invalid credentials' as message;
        END IF;
    END IF;
END$$

-- ================================
-- Payment & Invoice Procedures
-- ================================

CREATE PROCEDURE sp_add_payment(
  IN p_invoiceID BIGINT UNSIGNED,
  IN p_amount DECIMAL(15,2),
  IN p_paymentMethod ENUM('Cash','Card','Online','Other')
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    INSERT INTO payment (invoiceID, amount, paymentMethod, transactionDate)
    VALUES (p_invoiceID, p_amount, p_paymentMethod, NOW());
    
    SELECT LAST_INSERT_ID() as transactionID, 'Payment added successfully' as message;
    
    COMMIT;
END$$

CREATE PROCEDURE sp_create_invoice(
  IN p_bookingID BIGINT UNSIGNED,
  IN p_discountCode INT UNSIGNED
)
BEGIN
    DECLARE v_rate DECIMAL(15,2);
    DECLARE v_nights INT;
    DECLARE v_subtotal DECIMAL(15,2);
    DECLARE v_discount DECIMAL(5,2) DEFAULT 0.00;
    DECLARE v_tax DECIMAL(15,2);
    DECLARE v_total DECIMAL(15,2);
    DECLARE v_invoiceID BIGINT UNSIGNED;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Get booking details
    SELECT rate, DATEDIFF(checkOutDate, checkInDate)
    INTO v_rate, v_nights
    FROM booking 
    WHERE bookingID = p_bookingID;
    
    -- Calculate subtotal
    SET v_subtotal = v_rate * v_nights;
    
    -- Apply discount if code provided (simple 10% discount for demo)
    IF p_discountCode IS NOT NULL THEN
        SET v_discount = 10.00;
    END IF;
    
    -- Calculate tax (10% tax rate)
    SET v_tax = v_subtotal * 0.10;
    
    -- Calculate total with discount
    SET v_total = v_subtotal + v_tax - (v_subtotal * v_discount / 100);
    
    -- Create invoice (using actual table structure)
    INSERT INTO invoice (
        bookingID, 
        roomCharges, 
        serviceCharges, 
        discountAmount, 
        taxAmount, 
        invoiceStatus
    ) VALUES (
        p_bookingID, 
        v_subtotal, 
        0.00, 
        (v_subtotal * v_discount / 100), 
        v_tax, 
        'Pending'
    );
    
    SET v_invoiceID = LAST_INSERT_ID();
    
    -- Return invoice details
    SELECT 
        v_invoiceID as invoiceID,
        p_bookingID as bookingID,
        v_subtotal as roomCharges,
        v_tax as taxAmount,
        (v_subtotal * v_discount / 100) as discountAmount,
        'Invoice created successfully' as message;
    
    COMMIT;
END$$

-- ================================
-- Service Usage Procedures
-- ================================

CREATE PROCEDURE sp_add_service_usage(
    IN p_bookingID BIGINT UNSIGNED,
    IN p_serviceID BIGINT UNSIGNED,
    IN p_quantity INT UNSIGNED
)
BEGIN
    INSERT INTO service_usage (bookingID, serviceID, quantity, rate, usedAt)
    SELECT p_bookingID, p_serviceID, p_quantity, s.ratePerUnit, NOW()
    FROM chargeble_service s 
    WHERE s.serviceID = p_serviceID;
    
    SELECT LAST_INSERT_ID() as usageID, 'Service usage added successfully' as message;
END$$

-- ================================
-- Guest Management Procedures
-- ================================

CREATE PROCEDURE sp_search_guests(
  IN p_search_term VARCHAR(100)
)
BEGIN
  SELECT 
    guestID, 
    firstName, 
    lastName, 
    phone, 
    email, 
    idNumber,
    CONCAT(firstName, ' ', lastName) as fullName
  FROM guest
  WHERE 
    (p_search_term IS NULL OR p_search_term = '') 
    OR firstName LIKE CONCAT('%', p_search_term, '%')
    OR lastName LIKE CONCAT('%', p_search_term, '%')
    OR CONCAT(firstName, ' ', lastName) LIKE CONCAT('%', p_search_term, '%')
    OR phone LIKE CONCAT('%', p_search_term, '%')
    OR email LIKE CONCAT('%', p_search_term, '%')
    OR idNumber LIKE CONCAT('%', p_search_term, '%')
  ORDER BY firstName, lastName
  LIMIT 50;
END$$

CREATE PROCEDURE sp_get_all_guests()
BEGIN
  SELECT 
    guestID, 
    firstName, 
    lastName, 
    phone, 
    email, 
    idNumber,
    CONCAT(firstName, ' ', lastName) as fullName
  FROM guest
  ORDER BY firstName, lastName
  LIMIT 50;
END$$

CREATE PROCEDURE sp_create_guest(
  IN p_firstName VARCHAR(50),
  IN p_lastName VARCHAR(50),
  IN p_phone VARCHAR(20),
  IN p_email VARCHAR(100),
  IN p_idNumber VARCHAR(30)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  INSERT INTO guest (firstName, lastName, phone, email, idNumber)
  VALUES (p_firstName, p_lastName, p_phone, p_email, p_idNumber);
  
  SELECT LAST_INSERT_ID() AS guestID, 'Guest created successfully' as message;
  
  COMMIT;
END$$

CREATE PROCEDURE sp_get_guest_by_id(
  IN p_guestID BIGINT UNSIGNED
)
BEGIN
  SELECT guestID, firstName, lastName, phone, email, idNumber
  FROM guest
  WHERE guestID = p_guestID;
END$$

-- ================================
-- Reservation Management Procedures
-- ================================

CREATE PROCEDURE sp_get_all_reservations()
BEGIN
  SELECT 
    b.bookingID,
    b.guestID,
    CONCAT(g.firstName, ' ', g.lastName) as guestName,
    g.phone as guestPhone,
    g.email as guestEmail,
    b.branchID,
    br.location as branchName,
    b.roomID,
    r.roomNo,
    rt.typeName as roomType,
    b.rate,
    b.checkInDate,
    b.checkOutDate,
    b.numGuests,
    b.bookingStatus,
    DATEDIFF(b.checkOutDate, b.checkInDate) as stayDuration
  FROM booking b
  JOIN guest g ON b.guestID = g.guestID
  JOIN room r ON b.roomID = r.roomID
  JOIN room_type rt ON r.typeID = rt.typeID
  JOIN branch br ON b.branchID = br.branchID
  ORDER BY b.checkInDate DESC, b.bookingID DESC;
END$$

CREATE PROCEDURE sp_get_reservations_by_status(IN p_status VARCHAR(20))
BEGIN
  SELECT 
    b.bookingID,
    b.guestID,
    CONCAT(g.firstName, ' ', g.lastName) as guestName,
    g.phone as guestPhone,
    g.email as guestEmail,
    b.branchID,
    br.location as branchName,
    b.roomID,
    r.roomNo,
    rt.typeName as roomType,
    b.rate,
    b.checkInDate,
    b.checkOutDate,
    b.numGuests,
    b.bookingStatus,
    DATEDIFF(b.checkOutDate, b.checkInDate) as stayDuration
  FROM booking b
  JOIN guest g ON b.guestID = g.guestID
  JOIN room r ON b.roomID = r.roomID
  JOIN room_type rt ON r.typeID = rt.typeID
  JOIN branch br ON b.branchID = br.branchID
  WHERE b.bookingStatus = p_status
  ORDER BY b.checkInDate DESC, b.bookingID DESC;
END$$

CREATE PROCEDURE sp_get_todays_reservations()
BEGIN
  SELECT 
    b.bookingID,
    b.guestID,
    CONCAT(g.firstName, ' ', g.lastName) as guestName,
    g.phone as guestPhone,
    g.email as guestEmail,
    b.branchID,
    br.location as branchName,
    b.roomID,
    r.roomNo,
    rt.typeName as roomType,
    b.rate,
    b.checkInDate,
    b.checkOutDate,
    b.numGuests,
    b.bookingStatus,
    DATEDIFF(b.checkOutDate, b.checkInDate) as stayDuration,
    CASE 
      WHEN DATE(b.checkInDate) = CURDATE() AND b.bookingStatus = 'Booked' THEN 'Check-in Today'
      WHEN DATE(b.checkOutDate) = CURDATE() AND b.bookingStatus = 'CheckedIn' THEN 'Check-out Today'
      WHEN b.bookingStatus = 'CheckedIn' THEN 'Currently Staying'
      ELSE b.bookingStatus
    END as actionRequired
  FROM booking b
  JOIN guest g ON b.guestID = g.guestID
  JOIN room r ON b.roomID = r.roomID
  JOIN room_type rt ON r.typeID = rt.typeID
  JOIN branch br ON b.branchID = br.branchID
  WHERE 
    (DATE(b.checkInDate) = CURDATE() OR DATE(b.checkOutDate) = CURDATE() OR b.bookingStatus = 'CheckedIn')
    AND b.bookingStatus IN ('Booked', 'CheckedIn')
  ORDER BY 
    CASE 
      WHEN DATE(b.checkInDate) = CURDATE() AND b.bookingStatus = 'Booked' THEN 1
      WHEN DATE(b.checkOutDate) = CURDATE() AND b.bookingStatus = 'CheckedIn' THEN 2
      ELSE 3
    END,
    b.checkInDate;
END$$

-- ================================
-- Dashboard Statistics Procedures
-- ================================

CREATE PROCEDURE sp_get_dashboard_stats()
BEGIN
    DECLARE today_checkins INT DEFAULT 0;
    DECLARE today_checkouts INT DEFAULT 0;
    DECLARE total_rooms INT DEFAULT 0;
    DECLARE occupied_rooms INT DEFAULT 0;
    DECLARE available_rooms INT DEFAULT 0;
    DECLARE occupancy_rate DECIMAL(5,2) DEFAULT 0;
    DECLARE today_revenue DECIMAL(15,2) DEFAULT 0;
    DECLARE monthly_revenue DECIMAL(15,2) DEFAULT 0;
    
    -- Today's check-ins
    SELECT COUNT(*) INTO today_checkins
    FROM booking
    WHERE DATE(checkInDate) = CURDATE() 
      AND bookingStatus = 'CheckedIn';
    
    -- Today's check-outs  
    SELECT COUNT(*) INTO today_checkouts
    FROM booking
    WHERE DATE(checkOutDate) = CURDATE() 
      AND bookingStatus = 'CheckedOut';
    
    -- Room statistics
    SELECT COUNT(*) INTO total_rooms FROM room;
    
    SELECT COUNT(DISTINCT r.roomID) INTO occupied_rooms
    FROM room r
    INNER JOIN booking b ON r.roomID = b.roomID
    WHERE b.bookingStatus IN ('CheckedIn', 'Booked')
      AND CURDATE() BETWEEN DATE(b.checkInDate) AND DATE(b.checkOutDate);
    
    SET available_rooms = total_rooms - occupied_rooms;
    
    IF total_rooms > 0 THEN
        SET occupancy_rate = (occupied_rooms * 100.0) / total_rooms;
    END IF;
    
    -- Today's revenue
    SELECT COALESCE(SUM(amount), 0) INTO today_revenue
    FROM payment
    WHERE DATE(transactionDate) = CURDATE();
    
    -- Monthly revenue
    SELECT COALESCE(SUM(amount), 0) INTO monthly_revenue
    FROM payment
    WHERE MONTH(transactionDate) = MONTH(CURDATE())
      AND YEAR(transactionDate) = YEAR(CURDATE());
    
    -- Return all statistics
    SELECT 
        today_checkins,
        today_checkouts,
        total_rooms,
        occupied_rooms,
        available_rooms,
        ROUND(occupancy_rate, 1) AS occupancy_percentage,
        today_revenue,
        monthly_revenue;
END$$

CREATE PROCEDURE sp_get_today_checkins()
BEGIN
  SELECT COUNT(*) AS count
  FROM booking
  WHERE DATE(checkInDate) = CURDATE() 
    AND bookingStatus = 'CheckedIn';
END$$

CREATE PROCEDURE sp_get_today_checkouts()
BEGIN
  SELECT COUNT(*) AS count
  FROM booking
  WHERE DATE(checkOutDate) = CURDATE() 
    AND bookingStatus = 'CheckedOut';
END$$

CREATE PROCEDURE sp_get_occupancy_rate()
BEGIN
  DECLARE total_rooms INT DEFAULT 0;
  DECLARE occupied_rooms INT DEFAULT 0;
  DECLARE occupancy_rate DECIMAL(5,2) DEFAULT 0;
  
  -- Get total rooms
  SELECT COUNT(*) INTO total_rooms FROM room;
  
  -- Get occupied rooms (current bookings)
  SELECT COUNT(DISTINCT r.roomID) INTO occupied_rooms
  FROM room r
  INNER JOIN booking b ON r.roomID = b.roomID
  WHERE b.bookingStatus IN ('CheckedIn', 'Booked')
    AND CURDATE() BETWEEN DATE(b.checkInDate) AND DATE(b.checkOutDate);
  
  -- Calculate occupancy rate
  IF total_rooms > 0 THEN
    SET occupancy_rate = (occupied_rooms * 100.0) / total_rooms;
  END IF;
  
  SELECT 
    total_rooms,
    occupied_rooms,
    ROUND(occupancy_rate, 1) AS occupancy_percentage;
END$$

CREATE PROCEDURE sp_get_monthly_revenue()
BEGIN
  SELECT COALESCE(SUM(amount), 0) AS revenue
  FROM payment
  WHERE MONTH(transactionDate) = MONTH(CURDATE())
    AND YEAR(transactionDate) = YEAR(CURDATE());
END$$

CREATE PROCEDURE sp_get_today_revenue()
BEGIN
  SELECT COALESCE(SUM(amount), 0) AS revenue
  FROM payment
  WHERE DATE(transactionDate) = CURDATE();
END$$

CREATE PROCEDURE sp_get_available_rooms(
    IN p_branchID BIGINT UNSIGNED,
    IN p_checkIn DATETIME,
    IN p_checkOut DATETIME
)
BEGIN
    SELECT 
        r.roomID,
        r.roomNo,
        rt.typeName,
        rt.basePrice,
        r.roomStatus,
        rt.typeID,
        rt.description AS typeDescription
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    WHERE r.branchID = p_branchID
    AND r.roomStatus = 'Available'
    AND r.roomID NOT IN (
        SELECT DISTINCT roomID 
        FROM booking 
        WHERE bookingStatus IN ('Booked', 'CheckedIn')
        AND NOT (DATE(p_checkOut) <= DATE(checkInDate) OR DATE(p_checkIn) >= DATE(checkOutDate))
    )
    ORDER BY rt.typeName, r.roomNo;
END$$

CREATE PROCEDURE sp_get_available_rooms_count()
BEGIN
  SELECT COUNT(*) AS count
  FROM room
  WHERE roomStatus = 'Available';
END$$

-- ================================
-- Room Availability Procedures
-- ================================

CREATE PROCEDURE sp_get_available_rooms_by_branch(
    IN p_branchID BIGINT UNSIGNED,
    IN p_checkIn DATE,
    IN p_checkOut DATE
)
BEGIN
    SELECT 
        r.roomID,
        r.roomNo,
        rt.typeName,
        rt.basePrice,
        r.roomStatus,
        rt.typeID,
        rt.description AS typeDescription
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    WHERE r.branchID = p_branchID
    AND r.roomStatus = 'Available'
    AND r.roomID NOT IN (
        SELECT DISTINCT roomID 
        FROM booking 
        WHERE bookingStatus IN ('Booked', 'CheckedIn')
        AND NOT (p_checkOut <= checkInDate OR p_checkIn >= checkOutDate)
    )
    ORDER BY rt.typeName, r.roomNo;
END$$

-- Room Type Availability Check
CREATE PROCEDURE sp_check_room_type_availability(
    IN p_branchID BIGINT UNSIGNED,
    IN p_typeID BIGINT UNSIGNED,
    IN p_checkIn DATETIME,
    IN p_checkOut DATETIME
)
BEGIN
    SELECT 
        rt.typeID,
        rt.typeName,
        rt.basePrice,
        rt.description,
        COUNT(r.roomID) AS total_rooms,
        COUNT(CASE WHEN r.roomID NOT IN (
            SELECT DISTINCT roomID 
            FROM booking 
            WHERE bookingStatus IN ('Booked', 'CheckedIn')
            AND NOT (DATE(p_checkOut) <= DATE(checkInDate) OR DATE(p_checkIn) >= DATE(checkOutDate))
        ) THEN r.roomID END) AS available_rooms
    FROM room_type rt
    LEFT JOIN room r ON rt.typeID = r.typeID AND r.branchID = p_branchID AND r.roomStatus = 'Available'
    WHERE rt.typeID = p_typeID
    GROUP BY rt.typeID, rt.typeName, rt.basePrice, rt.description;
END$$

-- Get All Room Types with Availability
CREATE PROCEDURE sp_get_room_types_with_availability(
    IN p_branchID BIGINT UNSIGNED,
    IN p_checkIn DATETIME,
    IN p_checkOut DATETIME
)
BEGIN
    SELECT 
        rt.typeID,
        rt.typeName,
        rt.basePrice,
        rt.description,
        COUNT(r.roomID) AS total_rooms,
        COUNT(CASE WHEN r.roomID NOT IN (
            SELECT DISTINCT roomID 
            FROM booking 
            WHERE bookingStatus IN ('Booked', 'CheckedIn')
            AND NOT (DATE(p_checkOut) <= DATE(checkInDate) OR DATE(p_checkIn) >= DATE(checkOutDate))
        ) AND r.roomStatus = 'Available' THEN r.roomID END) AS available_rooms
    FROM room_type rt
    LEFT JOIN room r ON rt.typeID = r.typeID AND r.branchID = p_branchID
    GROUP BY rt.typeID, rt.typeName, rt.basePrice, rt.description
    HAVING available_rooms > 0
    ORDER BY rt.basePrice;
END$$

DELIMITER ;

-- ==========================================
-- PROCEDURE SUMMARY (25 Total Procedures)
-- ==========================================
-- Authentication: sp_login_simple
-- Payments: sp_add_payment, sp_create_invoice  
-- Services: sp_add_service_usage
-- Guests: sp_search_guests, sp_get_all_guests, sp_create_guest, sp_get_guest_by_id
-- Reservations: sp_get_all_reservations, sp_get_reservations_by_status, sp_get_todays_reservations
-- Dashboard: sp_get_dashboard_stats, sp_get_today_checkins, sp_get_today_checkouts, 
--           sp_get_occupancy_rate, sp_get_monthly_revenue, sp_get_today_revenue, sp_get_available_rooms_count
-- Room Availability: sp_get_available_rooms, sp_get_available_rooms_by_branch, 
--                   sp_check_room_type_availability, sp_get_room_types_with_availability
-- ==========================================

-- ==========================================
-- DATABASE PATCH FOR ROOM AVAILABILITY
-- ==========================================
-- Run these SQL commands to fix room availability:

DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_available_rooms$$

CREATE PROCEDURE sp_get_available_rooms(
    IN p_branchID BIGINT UNSIGNED,
    IN p_checkIn DATETIME,
    IN p_checkOut DATETIME
)
BEGIN
    SELECT 
        r.roomID,
        r.roomNo,
        rt.typeName,
        rt.currRate AS basePrice,
        r.roomStatus,
        rt.typeID,
        rt.typeName AS typeDescription,
        rt.capacity
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    WHERE r.branchID = p_branchID
    AND r.roomStatus = 'Available'
    AND r.roomID NOT IN (
        SELECT DISTINCT roomID 
        FROM booking 
        WHERE bookingStatus IN ('Booked', 'CheckedIn')
        AND NOT (DATE(p_checkOut) <= DATE(checkInDate) OR DATE(p_checkIn) >= DATE(checkOutDate))
    )
    ORDER BY rt.typeName, r.roomNo;
END$$

-- ================================
-- Check-in and Check-out Procedures
-- ================================

DROP PROCEDURE IF EXISTS sp_checkin$$

CREATE PROCEDURE sp_checkin(
    IN p_bookingID INT UNSIGNED
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_currentStatus VARCHAR(20);
    DECLARE v_roomID INT UNSIGNED;
    
    -- Check if booking exists and get current status
    SELECT COUNT(*), bookingStatus, roomID 
    INTO v_count, v_currentStatus, v_roomID
    FROM booking 
    WHERE bookingID = p_bookingID;
    
    IF v_count = 0 THEN
        SELECT 0 as success, 'Booking not found' as message;
    ELSEIF v_currentStatus = 'CheckedIn' THEN
        SELECT 0 as success, 'Guest already checked in' as message;
    ELSEIF v_currentStatus = 'CheckedOut' THEN
        SELECT 0 as success, 'Booking already completed' as message;
    ELSEIF v_currentStatus = 'Cancelled' THEN
        SELECT 0 as success, 'Cannot check in cancelled booking' as message;
    ELSE
        -- Update booking status to CheckedIn
        UPDATE booking 
        SET bookingStatus = 'CheckedIn'
        WHERE bookingID = p_bookingID;
        
        -- Update room status to Occupied
        UPDATE room 
        SET roomStatus = 'Occupied' 
        WHERE roomID = v_roomID;
        
        SELECT 1 as success, 'Check-in successful' as message, p_bookingID as bookingID;
    END IF;
END$$

DROP PROCEDURE IF EXISTS sp_checkout$$

CREATE PROCEDURE sp_checkout(
    IN p_bookingID INT UNSIGNED
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_currentStatus VARCHAR(20);
    DECLARE v_roomID INT UNSIGNED;
    
    -- Check if booking exists and get current status
    SELECT COUNT(*), bookingStatus, roomID 
    INTO v_count, v_currentStatus, v_roomID
    FROM booking 
    WHERE bookingID = p_bookingID;
    
    IF v_count = 0 THEN
        SELECT 0 as success, 'Booking not found' as message;
    ELSEIF v_currentStatus = 'CheckedOut' THEN
        SELECT 0 as success, 'Guest already checked out' as message;
    ELSEIF v_currentStatus = 'Cancelled' THEN
        SELECT 0 as success, 'Cannot check out cancelled booking' as message;
    ELSEIF v_currentStatus != 'CheckedIn' THEN
        SELECT 0 as success, 'Guest must be checked in first' as message;
    ELSE
        -- Update booking status to CheckedOut
        UPDATE booking 
        SET bookingStatus = 'CheckedOut'
        WHERE bookingID = p_bookingID;
        
        -- Update room status back to Available
        UPDATE room 
        SET roomStatus = 'Available' 
        WHERE roomID = v_roomID;
        
        SELECT 1 as success, 'Check-out successful' as message, p_bookingID as bookingID;
    END IF;
END$$

-- ================================
-- Invoice Management Procedures
-- ================================

DROP PROCEDURE IF EXISTS sp_get_all_invoices$$

CREATE PROCEDURE sp_get_all_invoices()
BEGIN
    SELECT 
        i.invoiceID,
        i.bookingID,
        i.roomCharges,
        i.serviceCharges,
        i.discountAmount,
        i.taxAmount,
        i.settledAmount,
        i.invoiceStatus,
        (i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) as totalAmount,
        (i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount - i.settledAmount) as balanceAmount,
        g.firstName,
        g.lastName,
        g.phone,
        g.email,
        r.roomNo,
        rt.typeName as roomType,
        b.checkInDate,
        b.checkOutDate
    FROM invoice i
    INNER JOIN booking b ON i.bookingID = b.bookingID
    INNER JOIN guest g ON b.guestID = g.guestID
    INNER JOIN room r ON b.roomID = r.roomID
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    ORDER BY i.invoiceID DESC;
END$$

DELIMITER ;

-- ==========================================

-- ================================
-- Booking Creation Procedure
-- ================================

DROP PROCEDURE IF EXISTS sp_create_booking$$

CREATE PROCEDURE sp_create_booking(
    IN p_guestID BIGINT UNSIGNED,
    IN p_branchID BIGINT UNSIGNED,
    IN p_roomID BIGINT UNSIGNED,
    IN p_checkInDate DATETIME,
    IN p_checkOutDate DATETIME,
    IN p_numGuests INT UNSIGNED
)
BEGIN
    DECLARE v_rate DECIMAL(10,2);
    DECLARE v_bookingID BIGINT UNSIGNED;
    DECLARE v_room_count INT DEFAULT 0;
    
    -- Check if room exists
    SELECT COUNT(*) INTO v_room_count FROM room WHERE roomID = p_roomID;
    
    IF v_room_count = 0 THEN
        SELECT 0 as success, CONCAT('Room with ID ', p_roomID, ' not found') as message;
    ELSE
        -- Get the room rate from room_type table
        SELECT rt.currRate 
        INTO v_rate
        FROM room r
        INNER JOIN room_type rt ON r.typeID = rt.typeID
        WHERE r.roomID = p_roomID;
        
        -- Create the booking
        INSERT INTO booking (
        guestID, 
        branchID, 
        roomID, 
        rate, 
        checkInDate, 
        checkOutDate, 
        numGuests, 
        bookingStatus
    ) VALUES (
        p_guestID,
        p_branchID,
        p_roomID,
        v_rate,
        p_checkInDate,
        p_checkOutDate,
        p_numGuests,
        'Booked'
    );
    
        -- Get the created booking ID
        SET v_bookingID = LAST_INSERT_ID();
        
        SELECT 1 as success, 'Booking created successfully' as message, v_bookingID as bookingID;
    END IF;
END$$

-- ==========================================
-- REPORTING PROCEDURES
-- ==========================================

-- Revenue Report Procedure
DROP PROCEDURE IF EXISTS sp_get_revenue_report$$

CREATE PROCEDURE sp_get_revenue_report(
    IN p_branch_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        DATE(p.transactionDate) AS date,
        COUNT(DISTINCT i.invoiceID) AS total_invoices,
        COUNT(DISTINCT b.bookingID) AS total_bookings,
        SUM(p.amount) AS daily_revenue,
        AVG(p.amount) AS avg_payment_amount,
        SUM(i.roomCharges) AS room_revenue,
        SUM(i.serviceCharges) AS service_revenue,
        SUM(i.taxAmount) AS tax_collected,
        MONTHNAME(p.transactionDate) AS month_name,
        YEAR(p.transactionDate) AS year
    FROM payment p
    INNER JOIN invoice i ON p.invoiceID = i.invoiceID
    INNER JOIN booking b ON i.bookingID = b.bookingID
    WHERE b.branchID = p_branch_id
      AND DATE(p.transactionDate) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(p.transactionDate), MONTHNAME(p.transactionDate), YEAR(p.transactionDate)
    ORDER BY DATE(p.transactionDate) DESC;
END$$

-- Room Occupancy Report Procedure
DROP PROCEDURE IF EXISTS sp_get_room_occupancy_report$$

CREATE PROCEDURE sp_get_room_occupancy_report(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        r.roomNo,
        rt.typeName AS room_type,
        br.location AS branch_name,
        COUNT(b.bookingID) AS total_bookings,
        SUM(DATEDIFF(
            LEAST(DATE(b.checkOutDate), p_end_date),
            GREATEST(DATE(b.checkInDate), p_start_date)
        ) + 1) AS nights_occupied,
        DATEDIFF(p_end_date, p_start_date) + 1 AS total_days_in_period,
        ROUND(
            (SUM(DATEDIFF(
                LEAST(DATE(b.checkOutDate), p_end_date),
                GREATEST(DATE(b.checkInDate), p_start_date)
            ) + 1) * 100.0) / (DATEDIFF(p_end_date, p_start_date) + 1), 
            2
        ) AS occupancy_percentage,
        SUM(b.rate * DATEDIFF(b.checkOutDate, b.checkInDate)) AS room_revenue
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    INNER JOIN branch br ON r.branchID = br.branchID
    LEFT JOIN booking b ON r.roomID = b.roomID 
        AND b.bookingStatus IN ('CheckedIn', 'CheckedOut')
        AND DATE(b.checkInDate) <= p_end_date 
        AND DATE(b.checkOutDate) >= p_start_date
    GROUP BY r.roomID, r.roomNo, rt.typeName, br.location
    ORDER BY occupancy_percentage DESC, r.roomNo;
END$$

-- Guest Billing Summary Procedure
DROP PROCEDURE IF EXISTS sp_get_guest_billing_summary$$

CREATE PROCEDURE sp_get_guest_billing_summary()
BEGIN
    SELECT 
        g.guestID,
        CONCAT(g.firstName, ' ', g.lastName) AS guest_name,
        g.email,
        g.phone,
        COUNT(DISTINCT b.bookingID) AS total_bookings,
        COUNT(DISTINCT i.invoiceID) AS total_invoices,
        SUM(i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) AS total_billed_amount,
        SUM(i.settledAmount) AS total_paid_amount,
        SUM((i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) - i.settledAmount) AS outstanding_balance,
        AVG(i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) AS avg_invoice_amount,
        MAX(p.transactionDate) AS last_payment_date,
        CASE 
            WHEN SUM((i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) - i.settledAmount) > 0 
            THEN 'Has Outstanding Balance'
            ELSE 'Paid in Full'
        END AS payment_status
    FROM guest g
    LEFT JOIN booking b ON g.guestID = b.guestID
    LEFT JOIN invoice i ON b.bookingID = i.bookingID
    LEFT JOIN payment p ON i.invoiceID = p.invoiceID
    WHERE i.invoiceID IS NOT NULL
    GROUP BY g.guestID, g.firstName, g.lastName, g.email, g.phone
    HAVING total_invoices > 0
    ORDER BY outstanding_balance DESC, total_billed_amount DESC;
END$$

-- Service Usage Per Room Procedure
DROP PROCEDURE IF EXISTS sp_get_service_usage_per_room$$

CREATE PROCEDURE sp_get_service_usage_per_room()
BEGIN
    SELECT 
        r.roomNo AS room_number,
        rt.typeName AS room_type,
        br.location AS branch_name,
        cs.serviceType AS service_name,
        cs.ratePerUnit AS service_rate,
        COUNT(su.usageID) AS service_count,
        SUM(su.quantity) AS total_quantity_used,
        SUM(su.quantity * su.rate) AS total_revenue,
        AVG(su.quantity) AS avg_quantity_per_usage,
        MAX(su.usedAt) AS last_used_date
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    INNER JOIN branch br ON r.branchID = br.branchID
    LEFT JOIN booking b ON r.roomID = b.roomID
    LEFT JOIN service_usage su ON b.bookingID = su.bookingID
    LEFT JOIN chargeble_service cs ON su.serviceID = cs.serviceID
    WHERE su.usageID IS NOT NULL
    GROUP BY 
        r.roomID, r.roomNo, rt.typeName, br.location,
        cs.serviceID, cs.serviceType, cs.ratePerUnit
    HAVING service_count > 0
    ORDER BY total_revenue DESC, r.roomNo, cs.serviceType;
END$$

DELIMITER ;

DELIMITER ;

-- ==========================================