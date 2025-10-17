-- Branches
INSERT INTO `branch` (branchID, location,rating,phone,email) VALUES
  (1, 'Kandy', 4.7, '+94773853091' ,'skyKandy@gamil.com'),
  (2, 'Galle', '4.5', '+94775005806', 'skyGalle@gmail.com'),
  (3, 'Colombo', '4.2', '+94773274105', 'skyColombo@gmail.com');

-- Room Types
INSERT INTO `room_type` (typeID, typeName, capacity, currRate) VALUES
  (1, 'Single', 1, 8000.00),
  (2, 'Double', 2, 12000.00),
  (3, 'Suite', 4, 25000.00),
  (4, 'Family', 6, 35000.00);

-- Rooms
INSERT INTO `room` (roomID, branchID, typeID, roomNo, roomStatus) VALUES
  (1, 1, 1, 101, 'Available'),
  (2, 1, 1, 102, 'Available'),
  (3, 1, 2, 201, 'Available'),
  (4, 1, 2, 202, 'Available'),
  (5, 1, 3, 301, 'Available'),
  (6, 2, 1, 101, 'Available'),
  (7, 2, 2, 201, 'Available'),
  (8, 2, 3, 301, 'Available'),
  (9, 3, 1, 101, 'Available'),
  (10, 3, 2, 201, 'Available');

-- Chargeable Services
INSERT INTO `chargeble_service` (serviceID, serviceType, unit, ratePerUnit) VALUES
  (1, 'Spa', 'per person', 5000.00),
  (2, 'Pool', 'per person', 1500.00),
  (3, 'Room Service', 'per request', 2000.00),
  (4, 'Minibar', 'per item', 500.00),
  (5, 'Laundry', 'per kg', 800.00),
  (6, 'Airport Shuttle', 'per person', 3000.00);

-- Guests
INSERT INTO `guest` (guestID, firstName, lastName, phone, email,idNumber) VALUES
  (1, 'John', 'Doe', '+94771234567', 'john.doe@email.com', 'ID123456789'),
  (2, 'Jane', 'Smith', '+94779876543', 'jane.smith@email.com', 'ID987654321'),
  (3, 'Bob', 'Johnson', '+94775555555', 'bob.johnson@email.com', 'ID555666777'),
  (4, 'Alice', 'Brown', '+94773333333', 'alice.brown@email.com', 'ID333444555'),
  (5, 'Charlie', 'Wilson', '+94777777777', 'charlie.wilson@email.com', 'ID777888999'),
  (6, 'Diana', 'Davis', '+94772222222', 'diana.davis@email.com', 'ID222333444');

-- Bookings
INSERT INTO `booking` (bookingID, guestID, branchID, roomID, rate, checkInDate, checkOutDate, numGuests, bookingStatus) VALUES
  (1, 1, 1, 1, 8000.00, '2024-01-15 14:00:00', '2024-01-17 11:00:00', 1, 'CheckedOut'),
  (2, 2, 1, 3, 12000.00, '2024-01-20 14:00:00', '2024-01-23 11:00:00', 2, 'CheckedOut'),
  (3, 3, 2, 6, 8000.00, '2024-02-01 14:00:00', '2024-02-03 11:00:00', 1, 'CheckedOut'),
  (4, 4, 1, 5, 25000.00, '2024-02-10 14:00:00', '2024-02-14 11:00:00', 4, 'CheckedOut'),
  (5, 5, 3, 9, 8000.00, '2024-02-20 14:00:00', '2024-02-22 11:00:00', 1, 'CheckedOut'),
  (6, 6, 2, 7, 12000.00, '2024-03-01 14:00:00', '2024-03-04 11:00:00', 2, 'CheckedOut'),
  (7, 1, 1, 2, 8000.00, '2024-03-15 14:00:00', '2024-03-17 11:00:00', 1, 'CheckedIn'),
  (8, 2, 2, 8, 25000.00, '2024-03-20 14:00:00', '2024-03-25 11:00:00', 4, 'Booked');

-- Service Usage
INSERT INTO `service_usage` (usageID, bookingID, serviceID, rate, quantity, usedAt) VALUES
  (1, 1, 3, 2000.00, 1, '2024-01-16 19:30:00'),
  (2, 2, 1, 5000.00, 2, '2024-01-21 10:00:00'),
  (3, 2, 2, 1500.00, 2, '2024-01-21 15:00:00'),
  (4, 3, 4, 500.00, 3, '2024-02-02 20:00:00'),
  (5, 4, 1, 5000.00, 4, '2024-02-11 11:00:00'),
  (6, 4, 6, 3000.00, 4, '2024-02-14 09:00:00'),
  (7, 5, 3, 2000.00, 1, '2024-02-21 18:00:00'),
  (8, 6, 5, 800.00, 2, '2024-03-02 08:00:00');

-- Invoices
INSERT INTO `invoice` (
  invoiceID, bookingID, policyID, discountCode, paymentPlan, 
  roomCharges, serviceCharges, discountAmount, settledAmount, 
  invoiceStatus, taxAmount, latePolicyID
) VALUES
  (1, 1, NULL, NULL, 'Full', 16000.00, 2000.00, 0.00, 18000.00, 'Paid', 0.00, NULL),
  (2, 2, NULL, NULL, 'Full', 36000.00, 13000.00, 0.00, 49000.00, 'Paid', 0.00, NULL),
  (3, 3, NULL, NULL, 'Full', 16000.00, 1500.00, 0.00, 17500.00, 'Paid', 0.00, NULL),
  (4, 4, NULL, NULL, 'Full', 100000.00, 32000.00, 0.00, 132000.00, 'Paid', 0.00, NULL),
  (5, 5, NULL, NULL, 'Full', 16000.00, 2000.00, 0.00, 18000.00, 'Paid', 0.00, NULL),
  (6, 6, NULL, NULL, 'Full', 36000.00, 1600.00, 0.00, 37600.00, 'Paid', 0.00, NULL),
  (7, 7, NULL, NULL, 'Full', 16000.00, 0.00, 0.00, 0.00, 'Pending', 0.00, NULL),
  (8, 8, NULL, NULL, 'Full', 125000.00, 0.00, 0.00, 0.00, 'Pending', 0.00, NULL);

-- Payments
INSERT INTO `payment` (transactionID, invoiceID, transactionDate, paymentMethod, amount) VALUES
  (1, 1, '2024-01-17', 'Card', 18000.00),
  (2, 2, '2024-01-23', 'Cash', 49000.00),
  (3, 3, '2024-02-03', 'Online', 17500.00),
  (4, 4, '2024-02-14', 'Card', 132000.00),
  (5, 5, '2024-02-22', 'Cash', 18000.00),
  (6, 6, '2024-03-04', 'Online', 37600.00),
  (7, 4, '2024-02-10', 'Card', 50000.00);

-- User Accounts (for testing)
INSERT INTO `user_account` (userID, branchID, username, userRole, salt, password_hash) VALUES
  (1, 1, 'admin', 'Admin', NULL, NULL),
  (2, 1, 'manager_kandy', 'Manager', NULL, NULL),
  (3, 2, 'manager_galle', 'Manager', NULL, NULL),
  (4, 1, 'reception_kandy', 'Reception', NULL, NULL),
  (5, 2, 'reception_galle', 'Reception', NULL, NULL);