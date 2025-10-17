DELIMITER $$
CREATE PROCEDURE sp_add_service_usage(
  IN p_bookingID BIGINT UNSIGNED,
  IN p_serviceID INT UNSIGNED,
  IN p_quantity INT UNSIGNED
)
BEGIN
  DECLARE v_rate DECIMAL(10,2);
  
  -- Get current service rate
  SELECT ratePerUnit INTO v_rate
  FROM chargeble_service
  WHERE serviceID = p_serviceID;
  
  INSERT INTO service_usage (bookingID, serviceID, rate, quantity, usedAt)
  VALUES (p_bookingID, p_serviceID, v_rate, p_quantity, NOW());
  
  SELECT LAST_INSERT_ID() AS usageID;
END$$
DELIMITER ;