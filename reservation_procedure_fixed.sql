-- Fixed reservation procedure with better error handling
DROP PROCEDURE IF EXISTS sp_create_booking;

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
  DECLARE v_rate DECIMAL(10,2) DEFAULT 0;
  DECLARE v_totalCost DECIMAL(10,2) DEFAULT 0;
  DECLARE v_bookingID BIGINT UNSIGNED;
  DECLARE v_nights INT DEFAULT 1;
  
  -- Calculate number of nights
  SET v_nights = DATEDIFF(p_checkOutDate, p_checkInDate);
  IF v_nights <= 0 THEN
    SET v_nights = 1;
  END IF;
  
  -- Get current rate for the room
  SELECT COALESCE(rt.currRate, 0) INTO v_rate
  FROM `room` r
  INNER JOIN `room_type` rt ON r.typeID = rt.typeID
  WHERE r.roomID = p_roomID;
  
  -- Check if room exists and has a valid rate
  IF v_rate IS NULL OR v_rate = 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Room not found or rate not available';
  END IF;
  
  -- Calculate total cost
  SET v_totalCost = v_rate * v_nights;
  
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
    numGuests, rate, bookingStatus
  ) VALUES (
    p_guestID, p_branchID, p_roomID, p_checkInDate, p_checkOutDate,
    p_numGuests, v_totalCost, 'Booked'
  );
  
  SET v_bookingID = LAST_INSERT_ID();
  
  -- Return the booking ID
  SELECT v_bookingID as bookingID;
END$$
DELIMITER ;