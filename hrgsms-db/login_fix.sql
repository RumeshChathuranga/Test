-- Fixed stored procedures for HRGSMS

DELIMITER $$

-- Simple login procedure that works with our current schema
CREATE PROCEDURE `sp_login_simple`(
  IN p_username VARCHAR(100),
  IN p_password VARCHAR(255)
)
BEGIN
  DECLARE v_userID INT UNSIGNED;
  DECLARE v_role VARCHAR(20);
  DECLARE v_stored_password VARCHAR(255);
  
  -- Get user information
  SELECT userID, userRole, 
         CASE 
           WHEN password_hash IS NULL THEN CONCAT(username, '123')  -- Default password pattern
           ELSE CONVERT(password_hash USING utf8)
         END
  INTO v_userID, v_role, v_stored_password
  FROM `user_account`
  WHERE username = p_username
  LIMIT 1;
  
  IF v_userID IS NULL THEN
    SELECT 0 AS success, NULL AS userID, NULL AS username, NULL AS userRole;
  ELSE
    -- Simple password check
    IF p_password = v_stored_password THEN
      SELECT 1 AS success, v_userID AS userID, p_username AS username, v_role AS userRole;
    ELSE
      SELECT 0 AS success, NULL AS userID, NULL AS username, NULL AS userRole;
    END IF;
  END IF;
END$$

DELIMITER ;