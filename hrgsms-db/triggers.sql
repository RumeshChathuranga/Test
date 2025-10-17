-- ==========================================
-- HRGSMS DATABASE TRIGGERS
-- ==========================================
-- Description: Database triggers for ACID compliance and data integrity
-- Adapted for HRGSMS table structure with lowercase names
-- Last Updated: October 18, 2025
-- ==========================================

USE hrgsms_db;

-- ============================================
-- TRIGGERS FOR ACID COMPLIANCE
-- ============================================

-- Trigger 1: Auto-update room status on check-in
DROP TRIGGER IF EXISTS trg_booking_checkin;
DELIMITER //
CREATE TRIGGER trg_booking_checkin
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.bookingStatus = 'CheckedIn' AND OLD.bookingStatus = 'Booked' THEN
        UPDATE room 
        SET roomStatus = 'Occupied' 
        WHERE roomID = NEW.roomID;
        
        -- Log the check-in
        INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
        VALUES (NEW.branchID, NULL, NEW.bookingID, 'CheckIn', 
                CONCAT('Guest checked in to room ', NEW.roomID));
    END IF;
END//
DELIMITER ;

-- Trigger 2: Auto-update room status on check-out
DROP TRIGGER IF EXISTS trg_booking_checkout;
DELIMITER //
CREATE TRIGGER trg_booking_checkout
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.bookingStatus = 'CheckedOut' AND OLD.bookingStatus = 'CheckedIn' THEN
        UPDATE room 
        SET roomStatus = 'Available' 
        WHERE roomID = NEW.roomID;
        
        -- Log the check-out
        INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
        VALUES (NEW.branchID, NULL, NEW.bookingID, 'CheckOut', 
                CONCAT('Guest checked out from room ', NEW.roomID));
    END IF;
END//
DELIMITER ;

-- Trigger 3: Auto-update room status on booking cancellation
DROP TRIGGER IF EXISTS trg_booking_cancel;
DELIMITER //
CREATE TRIGGER trg_booking_cancel
AFTER UPDATE ON booking
FOR EACH ROW
BEGIN
    IF NEW.bookingStatus = 'Cancelled' AND OLD.bookingStatus IN ('Booked', 'CheckedIn') THEN
        UPDATE room 
        SET roomStatus = 'Available' 
        WHERE roomID = NEW.roomID;
        
        -- Log the cancellation
        INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
        VALUES (NEW.branchID, NULL, NEW.bookingID, 'Update', 
                CONCAT('Booking cancelled for room ', NEW.roomID));
    END IF;
END//
DELIMITER ;

-- Trigger 4: Prevent double booking
DROP TRIGGER IF EXISTS trg_prevent_double_booking;
DELIMITER //
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE booking_count INT;
    
    -- Check for overlapping bookings
    SELECT COUNT(*) INTO booking_count
    FROM booking
    WHERE roomID = NEW.roomID
    AND bookingStatus IN ('Booked', 'CheckedIn')
    AND (
        (checkInDate <= NEW.checkInDate AND checkOutDate > NEW.checkInDate)
        OR (checkInDate < NEW.checkOutDate AND checkOutDate >= NEW.checkOutDate)
        OR (checkInDate >= NEW.checkInDate AND checkOutDate <= NEW.checkOutDate)
    );
    
    IF booking_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Room is already booked for overlapping dates';
    END IF;
END//
DELIMITER ;

-- Trigger 5: Log booking creation
DROP TRIGGER IF EXISTS trg_log_booking_creation;
DELIMITER //
CREATE TRIGGER trg_log_booking_creation
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    VALUES (NEW.branchID, NULL, NEW.bookingID, 'Create', 
            CONCAT('New booking created for room ', NEW.roomID));
END//
DELIMITER ;

-- Trigger 6: Update invoice status after payment
DROP TRIGGER IF EXISTS trg_update_invoice_after_payment;
DELIMITER //
CREATE TRIGGER trg_update_invoice_after_payment
AFTER INSERT ON payment
FOR EACH ROW
BEGIN
    DECLARE total_amount DECIMAL(15,2);
    DECLARE new_settled DECIMAL(15,2);
    DECLARE new_status VARCHAR(20);
    
    -- Get invoice total and current settled amount
    SELECT (roomCharges + serviceCharges + taxAmount - discountAmount), 
           settledAmount
    INTO total_amount, new_settled
    FROM invoice
    WHERE invoiceID = NEW.invoiceID;
    
    -- Add new payment to settled amount
    SET new_settled = new_settled + NEW.amount;
    
    -- Determine new status
    IF new_settled >= total_amount THEN
        SET new_status = 'Paid';
    ELSEIF new_settled > 0 THEN
        SET new_status = 'Partially Paid';
    ELSE
        SET new_status = 'Pending';
    END IF;
    
    -- Update invoice
    UPDATE invoice
    SET settledAmount = new_settled,
        invoiceStatus = new_status
    WHERE invoiceID = NEW.invoiceID;
    
    -- Log payment
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    SELECT b.branchID, NULL, i.bookingID, 'Payment',
           CONCAT('Payment of Rs ', NEW.amount, ' received')
    FROM invoice i
    JOIN booking b ON i.bookingID = b.bookingID
    WHERE i.invoiceID = NEW.invoiceID;
END//
DELIMITER ;

-- Trigger 7: Validate check-out date
DROP TRIGGER IF EXISTS trg_validate_booking_dates;
DELIMITER //
CREATE TRIGGER trg_validate_booking_dates
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    IF NEW.checkOutDate <= NEW.checkInDate THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Check-out date must be after check-in date';
    END IF;
    
    IF NEW.checkInDate < NOW() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Check-in date cannot be in the past';
    END IF;
END//
DELIMITER ;

-- Trigger 8: Auto-calculate room rate in booking
DROP TRIGGER IF EXISTS trg_calculate_booking_rate;
DELIMITER //
CREATE TRIGGER trg_calculate_booking_rate
BEFORE INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE room_rate DECIMAL(10,2);
    
    -- Get current room rate from room_type
    SELECT rt.currRate INTO room_rate
    FROM room r
    JOIN room_type rt ON r.typeID = rt.typeID
    WHERE r.roomID = NEW.roomID;
    
    -- Set the rate (snapshot at booking time)
    SET NEW.rate = room_rate;
END//
DELIMITER ;

-- Trigger 9: Update invoice service charges when service is added
DROP TRIGGER IF EXISTS trg_update_service_charges_insert;
DELIMITER //
CREATE TRIGGER trg_update_service_charges_insert
AFTER INSERT ON service_usage
FOR EACH ROW
BEGIN
    DECLARE service_cost DECIMAL(15,2);
    
    -- Calculate the cost for this service
    SET service_cost = NEW.rate * NEW.quantity;
    
    -- Update the invoice service charges
    UPDATE invoice
    SET serviceCharges = serviceCharges + service_cost
    WHERE bookingID = NEW.bookingID;
    
    -- Log the service addition
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    SELECT b.branchID, NULL, NEW.bookingID, 'Update',
           CONCAT('Service charge added: Rs ', service_cost)
    FROM booking b
    WHERE b.bookingID = NEW.bookingID;
END//
DELIMITER ;

-- Trigger 10: Update invoice service charges when service is updated
DROP TRIGGER IF EXISTS trg_update_service_charges_update;
DELIMITER //
CREATE TRIGGER trg_update_service_charges_update
AFTER UPDATE ON service_usage
FOR EACH ROW
BEGIN
    DECLARE old_cost DECIMAL(15,2);
    DECLARE new_cost DECIMAL(15,2);
    DECLARE cost_difference DECIMAL(15,2);
    
    -- Calculate old and new costs
    SET old_cost = OLD.rate * OLD.quantity;
    SET new_cost = NEW.rate * NEW.quantity;
    SET cost_difference = new_cost - old_cost;
    
    -- Update the invoice service charges
    UPDATE invoice
    SET serviceCharges = serviceCharges + cost_difference
    WHERE bookingID = NEW.bookingID;
    
    -- Log the service update
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    SELECT b.branchID, NULL, NEW.bookingID, 'Update',
           CONCAT('Service charge updated. Difference: Rs ', cost_difference)
    FROM booking b
    WHERE b.bookingID = NEW.bookingID;
END//
DELIMITER ;

-- Trigger 11: Update invoice service charges when service is removed
DROP TRIGGER IF EXISTS trg_update_service_charges_delete;
DELIMITER //
CREATE TRIGGER trg_update_service_charges_delete
AFTER DELETE ON service_usage
FOR EACH ROW
BEGIN
    DECLARE removed_cost DECIMAL(15,2);
    
    -- Calculate the cost that was removed
    SET removed_cost = OLD.rate * OLD.quantity;
    
    -- Update the invoice service charges
    UPDATE invoice
    SET serviceCharges = serviceCharges - removed_cost
    WHERE bookingID = OLD.bookingID;
    
    -- Log the service removal
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    SELECT b.branchID, NULL, OLD.bookingID, 'Delete',
           CONCAT('Service charge removed: Rs ', removed_cost)
    FROM booking b
    WHERE b.bookingID = OLD.bookingID;
END//
DELIMITER ;

-- Trigger 12: Validate room availability before booking update
DROP TRIGGER IF EXISTS trg_validate_room_status;
DELIMITER //
CREATE TRIGGER trg_validate_room_status
BEFORE UPDATE ON booking
FOR EACH ROW
BEGIN
    DECLARE room_status_check VARCHAR(20);
    
    -- If booking is being changed to CheckedIn, ensure room is available
    IF NEW.bookingStatus = 'CheckedIn' AND OLD.bookingStatus = 'Booked' THEN
        SELECT roomStatus INTO room_status_check
        FROM room
        WHERE roomID = NEW.roomID;
        
        IF room_status_check = 'Occupied' THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Cannot check in: Room is currently occupied';
        END IF;
    END IF;
END//
DELIMITER ;

-- Trigger 13: Auto-calculate invoice room charges on booking creation
DROP TRIGGER IF EXISTS trg_calculate_room_charges;
DELIMITER //
CREATE TRIGGER trg_calculate_room_charges
AFTER INSERT ON booking
FOR EACH ROW
BEGIN
    DECLARE nights INT;
    DECLARE room_charges DECIMAL(15,2);
    DECLARE tax_rate DECIMAL(5,2) DEFAULT 12.0; -- Default 12% tax
    DECLARE tax_amount DECIMAL(15,2);
    
    -- Calculate number of nights
    SET nights = DATEDIFF(NEW.checkOutDate, NEW.checkInDate);
    
    -- Calculate room charges
    SET room_charges = NEW.rate * nights;
    
    -- Calculate tax amount
    SET tax_amount = room_charges * (tax_rate / 100);
    
    -- Create invoice for this booking
    INSERT INTO invoice (bookingID, roomCharges, serviceCharges, taxAmount, discountAmount, settledAmount, invoiceStatus)
    VALUES (NEW.bookingID, room_charges, 0.00, tax_amount, 0.00, 0.00, 'Pending');
    
    -- Log invoice creation
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    VALUES (NEW.branchID, NULL, NEW.bookingID, 'Create',
            CONCAT('Invoice created with room charges: Rs ', room_charges));
END//
DELIMITER ;

-- ============================================
-- UTILITY TRIGGERS FOR AUDIT TRAILS
-- ============================================

-- Trigger 14: Log guest updates
DROP TRIGGER IF EXISTS trg_log_guest_updates;
DELIMITER //
CREATE TRIGGER trg_log_guest_updates
AFTER UPDATE ON guest
FOR EACH ROW
BEGIN
    INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
    VALUES (NULL, NULL, NULL, 'Update',
            CONCAT('Guest information updated for ID: ', NEW.guestID));
END//
DELIMITER ;

-- Trigger 15: Log room status changes
DROP TRIGGER IF EXISTS trg_log_room_status_changes;
DELIMITER //
CREATE TRIGGER trg_log_room_status_changes
AFTER UPDATE ON room
FOR EACH ROW
BEGIN
    IF OLD.roomStatus != NEW.roomStatus THEN
        INSERT INTO log (branchID, userID, bookingID, logAction, logDescription)
        VALUES (NEW.branchID, NULL, NULL, 'Update',
                CONCAT('Room ', NEW.roomNo, ' status changed from ', OLD.roomStatus, ' to ', NEW.roomStatus));
    END IF;
END//
DELIMITER ;

SELECT 'All HRGSMS triggers created successfully!' as Status;