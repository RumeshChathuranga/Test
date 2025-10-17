-- ==========================================
-- TRIGGERS - Hotel Reservation System
-- ==========================================
-- Description: Automated database triggers for room status management
-- Last Updated: Current consolidation
-- ==========================================

DELIMITER $$

-- Trigger to update room status to 'Occupied' on check-in
CREATE TRIGGER trg_room_occupied_after_checkin
AFTER UPDATE ON `booking`
FOR EACH ROW
BEGIN
  IF NEW.bookingStatus = 'CheckedIn' THEN
    UPDATE `room`
    SET roomStatus = 'Occupied'
    WHERE roomID = NEW.roomID;
  END IF;
END $$

-- Trigger to update room status to 'Available' on check-out
CREATE TRIGGER trg_room_available_after_checkout
AFTER UPDATE ON `booking`
FOR EACH ROW
BEGIN
  IF NEW.bookingStatus = 'CheckedOut' THEN
    UPDATE `room`
    SET roomStatus = 'Available'
    WHERE roomID = NEW.roomID;
  END IF;
END $$

DELIMITER ;