-- Fixed reservation procedures for Linux case sensitivity
DROP PROCEDURE IF EXISTS sp_create_booking;
DROP PROCEDURE IF EXISTS sp_checkin;
DROP PROCEDURE IF EXISTS sp_checkout;

DELIMITER $$
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
  
  -- Get current rate for the room
  SELECT rt.currRate INTO v_rate
  FROM `room` r
  INNER JOIN `room_type` rt ON r.typeID = rt.typeID
  WHERE r.roomID = p_roomID;
  
  -- Check if room is available
  IF EXISTS (
    SELECT 1 FROM `booking` 
    WHERE roomID = p_roomID 
      AND bookingStatus IN ('Booked', 'CheckedIn')
      AND (
        (checkInDate <= p_checkInDate AND checkOutDate > p_checkInDate) OR
        (checkInDate < p_checkOutDate AND checkOutDate >= p_checkOutDate) OR
        (checkInDate >= p_checkInDate AND checkOutDate <= p_checkOutDate)
      )
  ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room is not available for the selected dates';
  END IF;
  
  -- Create the booking
  INSERT INTO `booking` (
    guestID, branchID, roomID, checkInDate, checkOutDate, 
    numGuests, totalCost, bookingStatus, createdAt
  ) VALUES (
    p_guestID, p_branchID, p_roomID, p_checkInDate, p_checkOutDate,
    p_numGuests, v_rate * DATEDIFF(p_checkOutDate, p_checkInDate), 'Booked', NOW()
  );
  
  SET v_bookingID = LAST_INSERT_ID();
  
  -- Return the booking ID
  SELECT v_bookingID as bookingID;
END$$

CREATE PROCEDURE sp_checkin(
  IN p_bookingID BIGINT UNSIGNED
)
BEGIN
  -- Update booking status to CheckedIn
  UPDATE `booking` 
  SET bookingStatus = 'CheckedIn', checkInDate = NOW()
  WHERE bookingID = p_bookingID AND bookingStatus = 'Booked';
  
  IF ROW_COUNT() = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found or already checked in';
  END IF;
  
  SELECT CONCAT('Guest successfully checked in for booking ID ', p_bookingID) as message;
END$$

CREATE PROCEDURE sp_checkout(
  IN p_bookingID BIGINT UNSIGNED
)
BEGIN
  DECLARE v_totalCost DECIMAL(10,2);
  
  -- Get total cost and update status
  SELECT totalCost INTO v_totalCost 
  FROM `booking` 
  WHERE bookingID = p_bookingID AND bookingStatus = 'CheckedIn';
  
  IF v_totalCost IS NULL THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Booking not found or not checked in';
  END IF;
  
  UPDATE `booking` 
  SET bookingStatus = 'CheckedOut', checkOutDate = NOW()
  WHERE bookingID = p_bookingID;
  
  SELECT CONCAT('Guest successfully checked out. Total cost: Rs. ', v_totalCost) as message;
END$$
DELIMITER ;