# HRGSMS API - Complete Postman Testing Guide

## Prerequisites

1. **Start the API Server**
   ```bash
   cd /c/Users/tpn14/Documents/MyCode/HRGSMS-36/HRGSMS-36/hrgsms-backend
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

2. **Open Postman** and create a new collection called "HRGSMS API Tests"

3. **Set Base URL**: Create an environment variable
   - Variable: `base_url`
   - Value: `http://127.0.0.1:8000`

---

## 1. Health Check & Basic Tests

### Test 1: Health Check
- **Method**: `GET`
- **URL**: `{{base_url}}/health`
- **Expected Response**: 
  ```json
  {
    "status": "healthy",
    "database": "connected"
  }
  ```
- **Status Code**: `200`

### Test 2: Root Endpoint
- **Method**: `GET`
- **URL**: `{{base_url}}/`
- **Expected Response**:
  ```json
  {
    "message": "HRGSMS API is running",
    "version": "1.0.0"
  }
  ```

---

## 2. Authentication Tests

### Test 3: Register Admin User
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Headers**: `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "username": "admin1",
    "password": "admin123",
    "role": "Admin"
  }
  ```
- **Expected Response**: `201 Created`
  ```json
  {
    "user_id": 1,
    "message": "Registered"
  }
  ```

### Test 4: Register Manager User
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Body**:
  ```json
  {
    "username": "manager1",
    "password": "manager123",
    "role": "Manager"
  }
  ```

### Test 5: Register Reception User
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/register`
- **Body**:
  ```json
  {
    "username": "reception1",
    "password": "reception123",
    "role": "Reception"
  }
  ```

### Test 6: Login as Admin
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body**:
  ```json
  {
    "username": "admin1",
    "password": "admin123"
  }
  ```
- **Expected Response**: `200 OK`
  ```json
  {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "token_type": "bearer",
    "role": "Admin"
  }
  ```
- **Post-Response Script** (save token):
  ```javascript
  if (pm.response.code === 200) {
      const responseJson = pm.response.json();
      pm.environment.set("admin_token", responseJson.access_token);
  }
  ```

### Test 7: Invalid Login
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body**:
  ```json
  {
    "username": "admin1",
    "password": "wrongpassword"
  }
  ```
- **Expected Response**: `401 Unauthorized`

---

## 3. Guest Management Tests

### Test 8: Create Guest
- **Method**: `POST`
- **URL**: `{{base_url}}/guests/`
- **Headers**: 
  - `Authorization: Bearer {{admin_token}}`
  - `Content-Type: application/json`
- **Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "email": "john.doe@email.com",
    "id_number": "ID123456789"
  }
  ```
- **Expected Response**: `201 Created`
- **Post-Response Script**:
  ```javascript
  if (pm.response.code === 201) {
      const responseJson = pm.response.json();
      pm.environment.set("guest_id", responseJson.guest_id);
  }
  ```

### Test 9: Get Guest by ID
- **Method**: `GET`
- **URL**: `{{base_url}}/guests/{{guest_id}}`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response**: `200 OK`

### Test 10: Unauthorized Guest Access
- **Method**: `GET`
- **URL**: `{{base_url}}/guests/1`
- **Headers**: (No Authorization header)
- **Expected Response**: `401 Unauthorized`

---

## 4. Room Management Tests

### Test 11: Get Available Rooms
- **Method**: `GET`
- **URL**: `{{base_url}}/rooms/available`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Query Parameters**:
  - `branch_id`: `1`
  - `check_in`: `2024-11-15T14:00:00`
  - `check_out`: `2024-11-16T11:00:00`
- **Expected Response**: `200 OK` (array of available rooms)

---

## 5. Reservation Management Tests

### Test 12: Create Reservation
- **Method**: `POST`
- **URL**: `{{base_url}}/reservations/`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Body**:
  ```json
  {
    "guest_id": 1,
    "branch_id": 1,
    "room_id": 101,
    "check_in_date": "2024-11-15",
    "check_out_date": "2024-11-16",
    "num_guests": 2
  }
  ```
- **Expected Response**: `201 Created`
- **Post-Response Script**:
  ```javascript
  if (pm.response.code === 201) {
      const responseJson = pm.response.json();
      pm.environment.set("booking_id", responseJson.booking_id);
  }
  ```

### Test 13: Check-in Guest
- **Method**: `POST`
- **URL**: `{{base_url}}/reservations/{{booking_id}}/checkin`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response**: `200 OK`

### Test 14: Check-out Guest
- **Method**: `POST`
- **URL**: `{{base_url}}/reservations/{{booking_id}}/checkout`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response**: `200 OK`

---

## 6. Service Management Tests

### Test 15: Add Service Usage
- **Method**: `POST`
- **URL**: `{{base_url}}/services/usage`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Body**:
  ```json
  {
    "booking_id": 1,
    "service_id": 1,
    "quantity": 2
  }
  ```
- **Expected Response**: `201 Created`

---

## 7. Payment Management Tests

### Test 16: Create Invoice
- **Method**: `POST`
- **URL**: `{{base_url}}/payments/invoices`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Body**:
  ```json
  {
    "booking_id": 1,
    "policy_id": 1,
    "discount_code": null
  }
  ```
- **Expected Response**: `201 Created`
- **Post-Response Script**:
  ```javascript
  if (pm.response.code === 201) {
      const responseJson = pm.response.json();
      pm.environment.set("invoice_id", responseJson.invoice_id);
  }
  ```

### Test 17: Add Payment
- **Method**: `POST`
- **URL**: `{{base_url}}/payments/`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Body**:
  ```json
  {
    "invoice_id": 1,
    "amount": 150.00,
    "payment_method": "Card"
  }
  ```
- **Expected Response**: `201 Created`

---

## 8. Reports Tests (Admin/Manager Only)

### Test 18: Revenue Report
- **Method**: `GET`
- **URL**: `{{base_url}}/reports/revenue`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Query Parameters**:
  - `branch_id`: `1`
  - `start_date`: `2024-01-01`
  - `end_date`: `2024-12-31`
- **Expected Response**: `200 OK` (array of revenue data)

### Test 19: Room Occupancy Report
- **Method**: `GET`
- **URL**: `{{base_url}}/reports/roomOccupancy`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Query Parameters**:
  - `start_date`: `2024-01-01`
  - `end_date`: `2024-12-31`
- **Expected Response**: `200 OK`

### Test 20: Guest Billing Report
- **Method**: `GET`
- **URL**: `{{base_url}}/reports/guestBilling`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response**: `200 OK`

### Test 21: Service Usage Report
- **Method**: `GET`
- **URL**: `{{base_url}}/reports/serviceUsage`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response**: `200 OK`

---

## 9. Authorization Tests

### Test 22: Reports Access with Reception Role
1. First login as reception user:
   - **Method**: `POST`
   - **URL**: `{{base_url}}/auth/login`
   - **Body**:
     ```json
     {
       "username": "reception1",
       "password": "reception123"
     }
     ```
   - Save token as `reception_token`

2. Try to access reports:
   - **Method**: `GET`
   - **URL**: `{{base_url}}/reports/revenue?branch_id=1&start_date=2024-01-01&end_date=2024-12-31`
   - **Headers**: `Authorization: Bearer {{reception_token}}`
   - **Expected Response**: `403 Forbidden`

---

## 10. Error Handling Tests

### Test 23: Invalid JSON Format
- **Method**: `POST`
- **URL**: `{{base_url}}/auth/login`
- **Body** (invalid JSON):
  ```
  {
    "username": "admin1"
    "password": "admin123"  // Missing comma
  }
  ```
- **Expected Response**: `422 Unprocessable Entity`

### Test 24: Missing Required Fields
- **Method**: `POST`
- **URL**: `{{base_url}}/guests/`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Body**:
  ```json
  {
    "first_name": "John"
    // Missing required fields
  }
  ```
- **Expected Response**: `422 Unprocessable Entity`

### Test 25: Non-existent Resource
- **Method**: `GET`
- **URL**: `{{base_url}}/guests/99999`
- **Headers**: `Authorization: Bearer {{admin_token}}`
- **Expected Response**: `404 Not Found`

---

## Environment Variables to Set

Create these environment variables in Postman:

| Variable | Example Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://127.0.0.1:8000` | API base URL |
| `admin_token` | `eyJ0eXAiOiJKV1Q...` | Admin JWT token |
| `manager_token` | `eyJ0eXAiOiJKV1Q...` | Manager JWT token |
| `reception_token` | `eyJ0eXAiOiJKV1Q...` | Reception JWT token |
| `guest_id` | `1` | Created guest ID |
| `booking_id` | `1` | Created booking ID |
| `invoice_id` | `1` | Created invoice ID |

---

## Expected Status Codes Summary

| Scenario | Expected Code |
|----------|---------------|
| Successful GET/PUT | `200 OK` |
| Successful POST | `201 Created` |
| Missing Authentication | `401 Unauthorized` |
| Insufficient Permissions | `403 Forbidden` |
| Resource Not Found | `404 Not Found` |
| Validation Error | `422 Unprocessable Entity` |
| Server Error | `500 Internal Server Error` |

---

## Troubleshooting

### If you get 500 errors:
1. Check server logs in the terminal
2. Verify database connection
3. Ensure all stored procedures are created

### If you get 401/403 errors:
1. Verify the token is valid and not expired
2. Check user role permissions
3. Ensure Authorization header format: `Bearer <token>`

### If you get connection errors:
1. Ensure the server is running on port 8000
2. Check if the base_url is correct
3. Verify no firewall blocking the connection

---

## Running All Tests

To run all tests efficiently:

1. **Setup Phase**: Run tests 1-7 to verify basic functionality and get tokens
2. **CRUD Operations**: Run tests 8-17 to test core business logic
3. **Reports**: Run tests 18-21 to verify reporting functionality
4. **Security**: Run tests 22-25 to verify proper authorization

**Pro Tip**: Create a Postman Collection Runner to automate all these tests in sequence!