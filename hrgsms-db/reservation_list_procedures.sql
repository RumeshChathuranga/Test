-- Stored procedure to get all reservations with guest and room details
DELIMITER $$

DROP PROCEDURE IF EXISTS sp_get_all_reservations$$
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

DROP PROCEDURE IF EXISTS sp_get_reservations_by_status$$
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

DROP PROCEDURE IF EXISTS sp_get_todays_reservations$$
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

DELIMITER ;