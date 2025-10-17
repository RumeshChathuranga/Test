-- HRGSMS Database Functions - Consolidated
-- All functions with correct lowercase table names

DELIMITER $$
CREATE FUNCTION fn_has_role(p_userID BIGINT UNSIGNED, p_role VARCHAR(20)) 
RETURNS TINYINT(1)
DETERMINISTIC
RETURN EXISTS (
  SELECT 1 FROM user_account WHERE userID = p_userID AND userRole = p_role
)$$

CREATE FUNCTION fn_password_hash(p_salt VARBINARY(16), p_plain VARCHAR(255)) 
RETURNS VARBINARY(32)
DETERMINISTIC
RETURN UNHEX(SHA2(CONCAT(HEX(p_salt), p_plain), 256))$$

DELIMITER ;