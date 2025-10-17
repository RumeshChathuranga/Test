-- ==========================================
-- REPORTING PROCEDURES FOR HRGSMS
-- ==========================================

DELIMITER $$

-- Revenue Report Procedure
DROP PROCEDURE IF EXISTS sp_get_revenue_report$$

CREATE PROCEDURE sp_get_revenue_report(
    IN p_branch_id INT,
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        DATE(p.transactionDate) AS date,
        COUNT(DISTINCT i.invoiceID) AS total_invoices,
        COUNT(DISTINCT b.bookingID) AS total_bookings,
        SUM(p.amount) AS daily_revenue,
        AVG(p.amount) AS avg_payment_amount,
        SUM(i.roomCharges) AS room_revenue,
        SUM(i.serviceCharges) AS service_revenue,
        SUM(i.taxAmount) AS tax_collected,
        MONTHNAME(p.transactionDate) AS month_name,
        YEAR(p.transactionDate) AS year
    FROM payment p
    INNER JOIN invoice i ON p.invoiceID = i.invoiceID
    INNER JOIN booking b ON i.bookingID = b.bookingID
    WHERE b.branchID = p_branch_id
      AND DATE(p.transactionDate) BETWEEN p_start_date AND p_end_date
    GROUP BY DATE(p.transactionDate), MONTHNAME(p.transactionDate), YEAR(p.transactionDate)
    ORDER BY DATE(p.transactionDate) DESC;
END$$

-- Room Occupancy Report Procedure
DROP PROCEDURE IF EXISTS sp_get_room_occupancy_report$$

CREATE PROCEDURE sp_get_room_occupancy_report(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT 
        r.roomNo,
        rt.typeName AS room_type,
        br.location AS branch_name,
        COUNT(b.bookingID) AS total_bookings,
        SUM(DATEDIFF(
            LEAST(DATE(b.checkOutDate), p_end_date),
            GREATEST(DATE(b.checkInDate), p_start_date)
        ) + 1) AS nights_occupied,
        DATEDIFF(p_end_date, p_start_date) + 1 AS total_days_in_period,
        ROUND(
            (SUM(DATEDIFF(
                LEAST(DATE(b.checkOutDate), p_end_date),
                GREATEST(DATE(b.checkInDate), p_start_date)
            ) + 1) * 100.0) / (DATEDIFF(p_end_date, p_start_date) + 1), 
            2
        ) AS occupancy_percentage,
        SUM(b.rate * DATEDIFF(b.checkOutDate, b.checkInDate)) AS room_revenue
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    INNER JOIN branch br ON r.branchID = br.branchID
    LEFT JOIN booking b ON r.roomID = b.roomID 
        AND b.bookingStatus IN ('CheckedIn', 'CheckedOut')
        AND DATE(b.checkInDate) <= p_end_date 
        AND DATE(b.checkOutDate) >= p_start_date
    GROUP BY r.roomID, r.roomNo, rt.typeName, br.location
    ORDER BY occupancy_percentage DESC, r.roomNo;
END$$

-- Guest Billing Summary Procedure
DROP PROCEDURE IF EXISTS sp_get_guest_billing_summary$$

CREATE PROCEDURE sp_get_guest_billing_summary()
BEGIN
    SELECT 
        g.guestID,
        CONCAT(g.firstName, ' ', g.lastName) AS guest_name,
        g.email,
        g.phone,
        COUNT(DISTINCT b.bookingID) AS total_bookings,
        COUNT(DISTINCT i.invoiceID) AS total_invoices,
        SUM(i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) AS total_billed_amount,
        SUM(i.settledAmount) AS total_paid_amount,
        SUM((i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) - i.settledAmount) AS outstanding_balance,
        AVG(i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) AS avg_invoice_amount,
        MAX(p.transactionDate) AS last_payment_date,
        CASE 
            WHEN SUM((i.roomCharges + i.serviceCharges + i.taxAmount - i.discountAmount) - i.settledAmount) > 0 
            THEN 'Has Outstanding Balance'
            ELSE 'Paid in Full'
        END AS payment_status
    FROM guest g
    LEFT JOIN booking b ON g.guestID = b.guestID
    LEFT JOIN invoice i ON b.bookingID = i.bookingID
    LEFT JOIN payment p ON i.invoiceID = p.invoiceID
    WHERE i.invoiceID IS NOT NULL
    GROUP BY g.guestID, g.firstName, g.lastName, g.email, g.phone
    HAVING total_invoices > 0
    ORDER BY outstanding_balance DESC, total_billed_amount DESC;
END$$

-- Service Usage Per Room Procedure
DROP PROCEDURE IF EXISTS sp_get_service_usage_per_room$$

CREATE PROCEDURE sp_get_service_usage_per_room()
BEGIN
    SELECT 
        r.roomNo AS room_number,
        rt.typeName AS room_type,
        br.location AS branch_name,
        cs.serviceType AS service_name,
        cs.ratePerUnit AS service_rate,
        COUNT(su.usageID) AS service_count,
        SUM(su.quantity) AS total_quantity_used,
        SUM(su.quantity * su.rate) AS total_revenue,
        AVG(su.quantity) AS avg_quantity_per_usage,
        MAX(su.usedAt) AS last_used_date
    FROM room r
    INNER JOIN room_type rt ON r.typeID = rt.typeID
    INNER JOIN branch br ON r.branchID = br.branchID
    LEFT JOIN booking b ON r.roomID = b.roomID
    LEFT JOIN service_usage su ON b.bookingID = su.bookingID
    LEFT JOIN chargeble_service cs ON su.serviceID = cs.serviceID
    WHERE su.usageID IS NOT NULL
    GROUP BY 
        r.roomID, r.roomNo, rt.typeName, br.location,
        cs.serviceID, cs.serviceType, cs.ratePerUnit
    HAVING service_count > 0
    ORDER BY total_revenue DESC, r.roomNo, cs.serviceType;
END$$

DELIMITER ;