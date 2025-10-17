DELIMITER $$
CREATE DEFINER=`hrgsms_usr`@`127.0.0.1` FUNCTION `fn_has_role`(p_userID BIGINT UNSIGNED, p_role VARCHAR(20)) RETURNS tinyint(1)
    DETERMINISTIC
RETURN EXISTS (
  SELECT 1 FROM User_Account WHERE userID = p_userID AND userRole = p_role
)$$
DELIMITER ;

DELIMITER $$
CREATE DEFINER=`hrgsms_usr`@`127.0.0.1` FUNCTION `fn_password_hash`(p_salt VARBINARY(16), p_plain VARCHAR(255)) RETURNS varbinary(32)
    DETERMINISTIC
RETURN UNHEX(SHA2(CONCAT(HEX(p_salt), p_plain), 256))$$
DELIMITER ;
