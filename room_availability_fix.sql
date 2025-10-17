-- Fixed room availability procedure for Linux case sensitivity
DROP PROCEDURE IF EXISTS sp_get_available_rooms;

DELIMITER $$
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
    rt.capacity,
    rt.currRate,
    r.roomStatus,
    b.location
  FROM `room` r
  INNER JOIN `room_type` rt ON r.typeID = rt.typeID
  INNER JOIN `branch` b ON r.branchID = b.branchID
  WHERE r.branchID = p_branchID
    AND r.roomStatus = 'Available'
    AND r.roomID NOT IN (
      SELECT roomID FROM `booking` 
      WHERE bookingStatus IN ('Booked', 'CheckedIn')
        AND (
          (checkInDate <= p_checkIn AND checkOutDate > p_checkIn) OR
          (checkInDate < p_checkOut AND checkOutDate >= p_checkOut) OR
          (checkInDate >= p_checkIn AND checkOutDate <= p_checkOut)
        )
    );
END$$
DELIMITER ;