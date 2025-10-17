-- ==========================================
-- HRGSMS DATABASE INDEXES
-- ==========================================
-- Description: Performance optimization indexes for HRGSMS
-- Adapted for HRGSMS table structure with lowercase names
-- Last Updated: October 18, 2025
-- ==========================================

USE hrgsms_db;

-- ============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================

-- Drop existing indexes if they exist (to avoid conflicts)
DROP INDEX IF EXISTS idx_booking_dates ON booking;
DROP INDEX IF EXISTS idx_booking_status ON booking;
DROP INDEX IF EXISTS idx_booking_guest ON booking;
DROP INDEX IF EXISTS idx_booking_room ON booking;
DROP INDEX IF EXISTS idx_booking_branch ON booking;
DROP INDEX IF EXISTS idx_room_status ON room;
DROP INDEX IF EXISTS idx_room_type ON room;
DROP INDEX IF EXISTS idx_room_branch ON room;
DROP INDEX IF EXISTS idx_guest_phone ON guest;
DROP INDEX IF EXISTS idx_guest_name ON guest;
DROP INDEX IF EXISTS idx_service_usage_booking ON service_usage;
DROP INDEX IF EXISTS idx_service_usage_date ON service_usage;
DROP INDEX IF EXISTS idx_invoice_status ON invoice;
DROP INDEX IF EXISTS idx_invoice_booking ON invoice;
DROP INDEX IF EXISTS idx_payment_invoice ON payment;
DROP INDEX IF EXISTS idx_payment_date ON payment;
DROP INDEX IF EXISTS idx_log_time ON log;
DROP INDEX IF EXISTS idx_log_action ON log;
DROP INDEX IF EXISTS idx_log_booking ON log;
DROP INDEX IF EXISTS idx_booking_room_dates_status ON booking;
DROP INDEX IF EXISTS idx_invoice_branch_date ON invoice;

-- ============================================
-- PRIMARY PERFORMANCE INDEXES
-- ============================================

-- Indexes for booking table (most queried table)
CREATE INDEX idx_booking_dates ON booking(checkInDate, checkOutDate);
CREATE INDEX idx_booking_status ON booking(bookingStatus);
CREATE INDEX idx_booking_guest ON booking(guestID);
CREATE INDEX idx_booking_room ON booking(roomID);
CREATE INDEX idx_booking_branch ON booking(branchID);

-- Indexes for room table
CREATE INDEX idx_room_status ON room(roomStatus);
CREATE INDEX idx_room_type ON room(typeID);
CREATE INDEX idx_room_branch ON room(branchID);
CREATE INDEX idx_room_no ON room(roomNo);

-- Indexes for guest table
CREATE INDEX idx_guest_phone ON guest(phone);
CREATE INDEX idx_guest_email ON guest(email);
CREATE INDEX idx_guest_name ON guest(lastName, firstName);

-- Indexes for service_usage table
CREATE INDEX idx_service_usage_booking ON service_usage(bookingID);
CREATE INDEX idx_service_usage_date ON service_usage(usedAt);
CREATE INDEX idx_service_usage_service ON service_usage(serviceID);

-- Indexes for invoice table
CREATE INDEX idx_invoice_status ON invoice(invoiceStatus);
CREATE INDEX idx_invoice_booking ON invoice(bookingID);

-- Indexes for payment table
CREATE INDEX idx_payment_invoice ON payment(invoiceID);
CREATE INDEX idx_payment_date ON payment(transactionDate);
CREATE INDEX idx_payment_method ON payment(paymentMethod);

-- Indexes for log table (for audit and reporting)
CREATE INDEX idx_log_time ON log(event_time);
CREATE INDEX idx_log_action ON log(logAction);
CREATE INDEX idx_log_booking ON log(bookingID);
CREATE INDEX idx_log_branch ON log(branchID);

-- ============================================
-- COMPOSITE INDEXES FOR COMPLEX QUERIES
-- ============================================

-- Critical composite index for room availability checking
-- This is the most important index for performance
CREATE INDEX idx_booking_room_dates_status ON booking(roomID, checkInDate, checkOutDate, bookingStatus);

-- Composite index for revenue reports and financial queries
CREATE INDEX idx_invoice_booking_status ON invoice(bookingID, invoiceStatus);

-- Composite index for guest billing reports
CREATE INDEX idx_invoice_status_amount ON invoice(invoiceStatus, settledAmount);

-- Composite index for service usage reports
CREATE INDEX idx_service_booking_date ON service_usage(bookingID, usedAt);

-- Composite index for payment tracking
CREATE INDEX idx_payment_invoice_date ON payment(invoiceID, transactionDate);

-- Composite index for room management queries
CREATE INDEX idx_room_branch_status_type ON room(branchID, roomStatus, typeID);

-- ============================================
-- SPECIALIZED INDEXES FOR REPORTS
-- ============================================

-- Index for occupancy reports (by date range and branch)
CREATE INDEX idx_booking_branch_dates_status ON booking(branchID, checkInDate, checkOutDate, bookingStatus);

-- Index for guest history and loyalty tracking
CREATE INDEX idx_booking_guest_date ON booking(guestID, checkInDate);

-- Index for branch-wise performance reports
CREATE INDEX idx_log_branch_time_action ON log(branchID, event_time, logAction);

-- Index for service revenue analysis
CREATE INDEX idx_service_usage_service_date ON service_usage(serviceID, usedAt);

-- ============================================
-- FOREIGN KEY PERFORMANCE INDEXES
-- ============================================

-- Indexes on foreign key columns for JOIN performance
-- (Some may already exist as part of FK constraints, but explicit creation ensures optimization)

-- Branch relationships
CREATE INDEX idx_room_branch_fk ON room(branchID);
CREATE INDEX idx_booking_branch_fk ON booking(branchID);

-- User relationships
CREATE INDEX idx_booking_guest_fk ON booking(guestID);
CREATE INDEX idx_log_user_fk ON log(userID);

-- Room type relationships
CREATE INDEX idx_room_type_fk ON room(typeID);

-- Service relationships
CREATE INDEX idx_service_usage_service_fk ON service_usage(serviceID);

-- Booking relationships
CREATE INDEX idx_invoice_booking_fk ON invoice(bookingID);
CREATE INDEX idx_service_usage_booking_fk ON service_usage(bookingID);
CREATE INDEX idx_log_booking_fk ON log(bookingID);

-- Payment relationships
CREATE INDEX idx_payment_invoice_fk ON payment(invoiceID);

-- ============================================
-- TEXT SEARCH INDEXES
-- ============================================

-- Full-text search indexes for guest information
-- CREATE FULLTEXT INDEX idx_guest_fulltext ON guest(firstName, lastName, email);
-- Note: Commented out as it requires MyISAM or specific InnoDB configuration

-- ============================================
-- PERFORMANCE VERIFICATION
-- ============================================

-- Show all indexes created
SELECT 'Checking created indexes...' as Status;

SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    NON_UNIQUE,
    INDEX_TYPE
FROM 
    INFORMATION_SCHEMA.STATISTICS 
WHERE 
    TABLE_SCHEMA = 'hrgsms_db'
    AND TABLE_NAME IN ('booking', 'room', 'guest', 'invoice', 'payment', 'service_usage', 'log')
ORDER BY 
    TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

SELECT 'All HRGSMS indexes created successfully!' as Status;
SELECT CONCAT('Total indexes created: ', COUNT(*)) as IndexCount 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = 'hrgsms_db'
AND INDEX_NAME != 'PRIMARY';