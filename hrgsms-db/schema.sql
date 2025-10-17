CREATE TABLE `booking` (
  `bookingID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `guestID` bigint unsigned NOT NULL,
  `branchID` bigint unsigned NOT NULL,
  `roomID` bigint unsigned NOT NULL,
  `rate` decimal(10,2) unsigned NOT NULL,
  `checkInDate` datetime NOT NULL,
  `checkOutDate` datetime NOT NULL,
  `numGuests` int unsigned NOT NULL,
  `bookingStatus` enum('Booked','CheckedIn','CheckedOut','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Booked',
  PRIMARY KEY (`bookingID`),
  KEY `fk_guestID` (`guestID`),
  KEY `fk_branchID_booking` (`branchID`),
  KEY `fk_roomID_booking` (`roomID`),
  CONSTRAINT `fk_branchID_booking` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_guestID` FOREIGN KEY (`guestID`) REFERENCES `guest` (`guestID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_roomID_booking` FOREIGN KEY (`roomID`) REFERENCES `room` (`roomID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_date` CHECK ((`checkInDate` <= `checkOutDate`))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `branch` (
  `branchID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `location` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `phone` char(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`branchID`),
  CONSTRAINT `chk_phone` CHECK ((`phone` like _utf8mb4'+94%')),
  CONSTRAINT `chk_rating` CHECK (((`rating` >= 0) and (`rating` <= 5)))
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `chargeble_service` (
  `serviceID` int unsigned NOT NULL AUTO_INCREMENT,
  `unit` enum('per person','per kg','per item','per request') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ratePerUnit` decimal(10,2) unsigned NOT NULL,
  `serviceType` enum('Spa','Pool','Room Service','Minibar','Laundry','Airport Shuttle') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`serviceID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `discount` (
  `discountCode` int unsigned NOT NULL AUTO_INCREMENT,
  `discountName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `discountCondition` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `validFrom` date NOT NULL,
  `validTo` date NOT NULL,
  `discountValue` decimal(6,2) unsigned NOT NULL,
  PRIMARY KEY (`discountCode`),
  CONSTRAINT `chk_dateValidity` CHECK ((`validTo` > `validFrom`))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `guest` (
  `guestID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `firstName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastName` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idNumber` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`guestID`),
  UNIQUE KEY `idNumber` (`idNumber`),
  CONSTRAINT `chk_phone_guest` CHECK ((`phone` like _utf8mb4'+94%'))
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `invoice` (
  `invoiceID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `bookingID` bigint unsigned NOT NULL,
  `policyID` int unsigned DEFAULT NULL,
  `discountCode` int unsigned DEFAULT NULL,
  `paymentPlan` enum('Full','Installment') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Full',
  `roomCharges` decimal(15,2) unsigned NOT NULL DEFAULT '0.00',
  `serviceCharges` decimal(15,2) unsigned NOT NULL DEFAULT '0.00',
  `discountAmount` decimal(10,2) unsigned NOT NULL DEFAULT '0.00',
  `settledAmount` decimal(15,2) unsigned NOT NULL DEFAULT '0.00',
  `invoiceStatus` enum('Pending','Partially Paid','Paid','Cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pending',
  `taxAmount` decimal(10,2) unsigned NOT NULL DEFAULT '0.00',
  `latePolicyID` int unsigned DEFAULT NULL,
  PRIMARY KEY (`invoiceID`),
  UNIQUE KEY `bookingID` (`bookingID`),
  KEY `fk_policyID` (`policyID`),
  KEY `fk_discountCode` (`discountCode`),
  KEY `latePolicyID` (`latePolicyID`),
  CONSTRAINT `fk_bookingID_invoice` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_discountCode` FOREIGN KEY (`discountCode`) REFERENCES `discount` (`discountCode`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_policyID` FOREIGN KEY (`policyID`) REFERENCES `tax_policy` (`policyID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`latePolicyID`) REFERENCES `late_checkout_policy` (`latePolicyID`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `late_checkout_policy` (
  `latePolicyID` int unsigned NOT NULL,
  `amount` decimal(10,2) unsigned DEFAULT NULL,
  PRIMARY KEY (`latePolicyID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `log` (
  `logID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `event_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `branchID` bigint unsigned DEFAULT NULL,
  `userID` int unsigned DEFAULT NULL,
  `bookingID` bigint unsigned DEFAULT NULL,
  `logAction` enum('Create','Update','Delete','CheckIn','CheckOut','Payment','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `logDescription` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`logID`),
  KEY `fk_branchID_log` (`branchID`),
  KEY `fk_userID_log` (`userID`),
  KEY `fk_bookingID_log` (`bookingID`),
  CONSTRAINT `fk_bookingID_log` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_branchID_log` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_userID_log` FOREIGN KEY (`userID`) REFERENCES `user_account` (`userID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `payment` (
  `transactionID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `invoiceID` bigint unsigned NOT NULL,
  `transactionDate` date NOT NULL,
  `paymentMethod` enum('Cash','Card','Online','Other') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(15,2) unsigned NOT NULL,
  PRIMARY KEY (`transactionID`),
  KEY `fk_invoiceID` (`invoiceID`),
  CONSTRAINT `fk_invoiceID` FOREIGN KEY (`invoiceID`) REFERENCES `invoice` (`invoiceID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `room` (
  `roomID` bigint unsigned NOT NULL AUTO_INCREMENT,
  `branchID` bigint unsigned NOT NULL,
  `typeID` int unsigned NOT NULL,
  `roomNo` int unsigned NOT NULL,
  `roomStatus` enum('Occupied','Available') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`roomID`),
  UNIQUE KEY `uq_branch_roomNo` (`branchID`,`roomNo`),
  KEY `fk_typeID` (`typeID`),
  CONSTRAINT `fk_branchID` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_typeID` FOREIGN KEY (`typeID`) REFERENCES `room_type` (`typeID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_roomNo` CHECK ((`roomNo` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `room_type` (
  `typeID` int unsigned NOT NULL AUTO_INCREMENT,
  `typeName` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacity` int NOT NULL,
  `currRate` decimal(10,2) NOT NULL,
  PRIMARY KEY (`typeID`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `service_usage` (
  `usageID` bigint unsigned NOT NULL,
  `bookingID` bigint unsigned NOT NULL,
  `serviceID` int unsigned NOT NULL,
  `rate` decimal(10,2) unsigned NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  `usedAt` timestamp NOT NULL,
  PRIMARY KEY (`usageID`),
  KEY `fk_bookingID_service` (`bookingID`),
  KEY `fk_serviceID` (`serviceID`),
  CONSTRAINT `fk_bookingID_service` FOREIGN KEY (`bookingID`) REFERENCES `booking` (`bookingID`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_serviceID` FOREIGN KEY (`serviceID`) REFERENCES `chargeble_service` (`serviceID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `tax_policy` (
  `policyID` int unsigned NOT NULL AUTO_INCREMENT,
  `rate` decimal(5,4) unsigned NOT NULL,
  `appliesTo` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `policyName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`policyID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_account` (
  `userID` int unsigned NOT NULL AUTO_INCREMENT,
  `branchID` bigint unsigned DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userRole` enum('Admin','Manager','Reception','Staff') COLLATE utf8mb4_unicode_ci NOT NULL,
  `salt` varbinary(16) DEFAULT NULL,
  `password_hash` varbinary(255) DEFAULT NULL,
  PRIMARY KEY (`userID`),
  UNIQUE KEY `username` (`username`),
  KEY `fk_branchID_user` (`branchID`),
  CONSTRAINT `fk_branchID_user` FOREIGN KEY (`branchID`) REFERENCES `branch` (`branchID`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
