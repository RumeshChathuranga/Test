-- Guest search procedure for HRGSMS

DELIMITER $$

-- Search guests by name, phone, email, or ID number
CREATE PROCEDURE `sp_search_guests`(
  IN p_search_term VARCHAR(100)
)
BEGIN
  SELECT 
    guestID, 
    firstName, 
    lastName, 
    phone, 
    email, 
    idNumber,
    CONCAT(firstName, ' ', lastName) as fullName
  FROM `guest`
  WHERE 
    (p_search_term IS NULL OR p_search_term = '') 
    OR firstName LIKE CONCAT('%', p_search_term, '%')
    OR lastName LIKE CONCAT('%', p_search_term, '%')
    OR CONCAT(firstName, ' ', lastName) LIKE CONCAT('%', p_search_term, '%')
    OR phone LIKE CONCAT('%', p_search_term, '%')
    OR email LIKE CONCAT('%', p_search_term, '%')
    OR idNumber LIKE CONCAT('%', p_search_term, '%')
  ORDER BY firstName, lastName
  LIMIT 50;
END$$

-- Get all guests (limited to 50 for performance)
CREATE PROCEDURE `sp_get_all_guests`()
BEGIN
  SELECT 
    guestID, 
    firstName, 
    lastName, 
    phone, 
    email, 
    idNumber,
    CONCAT(firstName, ' ', lastName) as fullName
  FROM `guest`
  ORDER BY firstName, lastName
  LIMIT 50;
END$$

DELIMITER ;