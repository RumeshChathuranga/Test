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
  (4, 'Deluxe', 3, 18000.00);

-- Rooms (reference typeID and branchID)
INSERT INTO Room (roomID, branchID, typeID, roomNo, roomStatus) VALUES
  (1, 1, 1, 101, 'Available'),
  (2, 1, 2, 102, 'Available'),
  (3, 1, 3, 103, 'Available'),
  (4, 2, 1, 201, 'Available'),
  (5, 2, 2, 202, 'Available'),
  (6, 2, 3, 203, 'Available'),
  (7, 3, 1, 301, 'Available'),
  (8, 3, 2, 302, 'Available'),
  (9, 3, 3, 303, 'Available'),
  (10, 3, 4, 304, 'Available');
  
  -- Chargeble Services (6 services)
INSERT INTO Chargeble_Service (serviceID, serviceType, unit, ratePerUnit) VALUES
  (1, 'Spa', 'per person', 5000.00),
  (2, 'Pool', 'per person', 1500.00),
  (3, 'Room Service', 'per request', 1000.00),
  (4, 'Laundry', 'per kg', 1000.00),
  (5, 'Minibar', 'per item', 500.00),
  (6, 'Airport Shuttle', 'per request', 3000.00);
  
  -- Guests (5 guests)
INSERT INTO Guest (guestID, firstName, lastName, phone, email,idNumber) VALUES
  (1, 'Alice', 'Smith', '+9412345678', 'alice@example.com',333388222888),
  (2, 'Bob', 'Johnson', '+9423456789', 'bob@example.com',200308111555),
  (3, 'Carol', 'Williams', '+9434567890', 'carol@example.com',2002068113385),
  (4, 'David', 'Brown', '+9445678901', 'david@example.com',200108391824),
  (5, 'Eve', 'Davis', '+9456789012', 'eve@example.com',200802300123);

-- Bookings (8 bookings)
INSERT INTO Booking (bookingID, guestID, branchID, roomID, rate, checkInDate, checkOutDate, numGuests, bookingStatus) VALUES
  (1, 1, 1, 1, 80.00, '2025-10-01', '2025-10-03', 1, 'CheckedOut'),
  (2, 2, 1, 2, 120.00, '2025-10-02', '2025-10-05', 2, 'CheckedOut'),
  (3, 3, 2, 4, 85.00, '2025-10-04', '2025-10-06', 1, 'CheckedOut'),
  (4, 4, 2, 5, 130.00, '2025-10-05', '2025-10-07', 2, 'CheckedOut'),
  (5, 5, 3, 7, 90.00, '2025-10-06', '2025-10-09', 1, 'CheckedOut'),
  (6, 1, 3, 8, 140.00, '2025-10-07', '2025-10-10', 2, 'CheckedIn'),
  (7, 2, 3, 9, 270.00, '2025-10-08', '2025-10-12', 4, 'Booked'),
  (8, 3, 1, 3, 250.00, '2025-10-09', '2025-10-11', 3, 'Booked');
  
-- Service usage (various bookings and services)
INSERT INTO Service_Usage (usageID, bookingID, serviceID, rate, quantity, usedAt) VALUES
  (1, 1, 1, 5000.00, 1, '2025-10-01 10:00:00'),
  (2, 1, 3, 1000.00, 2, '2025-10-02 12:00:00'),
  (3, 2, 2, 1500.00, 2, '2025-10-03 09:00:00'),
  (4, 3, 4, 1000.00, 3, '2025-10-04 14:00:00'),
  (5, 4, 5, 500.00, 4, '2025-10-05 16:00:00'),
  (6, 5, 6, 3000.00, 1, '2025-10-06 11:00:00'),
  (7, 6, 1, 5000.00, 1, '2025-10-07 10:00:00'),
  (8, 7, 3, 1000.00, 1, '2025-10-08 13:00:00');
  
  INSERT INTO Invoice (
  invoiceID, bookingID, latePolicyID, policyID, discountCode, paymentPlan,
  roomCharges, serviceCharges, discountAmount, taxAmount, settledAmount, invoiceStatus
) VALUES
  (1, 1, 1, 1, 1, 'Full', 16000.00, 9000.00, 2000.00, 2500.00, 28500.00, 'Paid'),
  (2, 2, NULL, 2, 2, 'Installment', 3600.00, 3000.00, 1500.00, 1950.0, 2000.00, 'Partially Paid'),
  (3, 3, 2, 1, NULL, 'Full', 17000.00, 3000.00, 0.00, 2000.00, 1000.00, 'Partially Paid'),
  (4, 4, NULL, 1, NULL, 'Full', 26000.00, 3200.00, 0.00, 2920.00, 29200.00, 'Paid'),
  (5, 5, 1, 2, 1, 'Installment', 27000.00, 3000.00, 2000.00, 1500.00, 10000.00, 'Partially Paid'),
  (6, 6, NULL, 1, NULL, 'Full', 42000.00, 5000.00, 0.00, 4700.00, 51700.00, 'Paid'),
  (7, 7, NULL, 2, NULL, 'Full', 108000.00, 2000.00, 0.00, 5500.00, 0.00, 'Pending'),
  (8, 8, 2, 1, 2, 'Full', 50000.00, 0.00, 1500.00, 51.50, 0.00, 'Pending');

  -- Payments for invoices (at least 3 partial payments)
INSERT INTO Payment (transactionID, invoiceID, transactionDate, paymentMethod, amount) VALUES
  (1, 1, '2025-10-03', 'Card', 28500.00),           -- Full payment for invoice 1
  (2, 2, '2025-10-05', 'Cash', 1000.00),           -- Partial payment for invoice 2
  (3, 2, '2025-10-06', 'Online', 1000.00),         -- Partial payment for invoice 2
  (4, 3, '2025-10-06', 'Card', 1000.00),           -- Partial payment for invoice 3
  (5, 4, '2025-10-07', 'Card', 29200.00),           -- Full payment for invoice 4
  (6, 5, '2025-10-09', 'Cash', 10000.00),           -- Partial payment for invoice 5
  (7, 6, '2025-10-10', 'Online', 51700.00);         -- Full payment for invoice 6
