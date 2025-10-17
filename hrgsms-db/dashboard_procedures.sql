-- Dashboard statistics stored procedures for HRGSMS

DELIMITER $$

-- Get today's check-ins
CREATE PROCEDURE `sp_get_today_checkins`()
BEGIN
  SELECT COUNT(*) AS count
  FROM `booking`
  WHERE DATE(checkInDate) = CURDATE() 
    AND bookingStatus = 'CheckedIn';
END$$

-- Get today's check-outs
CREATE PROCEDURE `sp_get_today_checkouts`()
BEGIN
  SELECT COUNT(*) AS count
  FROM `booking`
  WHERE DATE(checkOutDate) = CURDATE() 
    AND bookingStatus = 'CheckedOut';
END$$

-- Get current occupancy rate
CREATE PROCEDURE `sp_get_occupancy_rate`()
BEGIN
  DECLARE total_rooms INT DEFAULT 0;
  DECLARE occupied_rooms INT DEFAULT 0;
  DECLARE occupancy_rate DECIMAL(5,2) DEFAULT 0;
  
  -- Get total rooms
  SELECT COUNT(*) INTO total_rooms FROM `room`;
  
  -- Get occupied rooms (current bookings)
  SELECT COUNT(DISTINCT r.roomID) INTO occupied_rooms
  FROM `room` r
  INNER JOIN `booking` b ON r.roomID = b.roomID
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

-- Get today's revenue
CREATE PROCEDURE `sp_get_today_revenue`()
BEGIN
  SELECT COALESCE(SUM(amount), 0) AS revenue
  FROM `payment`
  WHERE DATE(transactionDate) = CURDATE();
END$$

-- Get dashboard statistics (all in one)
CREATE PROCEDURE `sp_get_dashboard_stats`()
BEGIN
  DECLARE today_checkins INT DEFAULT 0;
  DECLARE today_checkouts INT DEFAULT 0;
  DECLARE total_rooms INT DEFAULT 0;
  DECLARE occupied_rooms INT DEFAULT 0;
  DECLARE occupancy_rate DECIMAL(5,2) DEFAULT 0;
  DECLARE today_revenue DECIMAL(15,2) DEFAULT 0;
  
  -- Today's check-ins
  SELECT COUNT(*) INTO today_checkins
  FROM `booking`
  WHERE DATE(checkInDate) = CURDATE() 
    AND bookingStatus = 'CheckedIn';
  
  -- Today's check-outs
  SELECT COUNT(*) INTO today_checkouts
  FROM `booking`
  WHERE DATE(checkOutDate) = CURDATE() 
    AND bookingStatus = 'CheckedOut';
  
  -- Occupancy calculation
  SELECT COUNT(*) INTO total_rooms FROM `room`;
  
  SELECT COUNT(DISTINCT r.roomID) INTO occupied_rooms
  FROM `room` r
  INNER JOIN `booking` b ON r.roomID = b.roomID
  WHERE b.bookingStatus IN ('CheckedIn', 'Booked')
    AND CURDATE() BETWEEN DATE(b.checkInDate) AND DATE(b.checkOutDate);
  
  IF total_rooms > 0 THEN
    SET occupancy_rate = (occupied_rooms * 100.0) / total_rooms;
  END IF;
  
  -- Today's revenue
  SELECT COALESCE(SUM(amount), 0) INTO today_revenue
  FROM `payment`
  WHERE DATE(transactionDate) = CURDATE();
  
  -- Return all stats
  SELECT 
    today_checkins,
    today_checkouts,
    total_rooms,
    occupied_rooms,
    ROUND(occupancy_rate, 1) AS occupancy_percentage,
    today_revenue;
END$$

DELIMITER ;