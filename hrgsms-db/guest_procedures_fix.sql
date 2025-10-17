-- Fixed guest procedures for HRGSMS

DELIMITER $$

-- Fixed create guest procedure with correct table name
CREATE PROCEDURE `sp_create_guest_fixed`(
  IN p_firstName VARCHAR(50),
  IN p_lastName VARCHAR(50),
  IN p_phone VARCHAR(20),
  IN p_email VARCHAR(100),
  IN p_idNumber VARCHAR(30)
)
BEGIN
  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;
  
  START TRANSACTION;
  
  INSERT INTO `guest` (firstName, lastName, phone, email, idNumber)
  VALUES (p_firstName, p_lastName, p_phone, p_email, p_idNumber);
  
  SELECT LAST_INSERT_ID() AS guestID;
  
  COMMIT;
END$$

-- Fixed get guest by ID procedure
CREATE PROCEDURE `sp_get_guest_by_id_fixed`(
  IN p_guestID BIGINT UNSIGNED
)
BEGIN
  SELECT guestID, firstName, lastName, phone, email, idNumber
  FROM `guest`
  WHERE guestID = p_guestID;
END$$

DELIMITER ;