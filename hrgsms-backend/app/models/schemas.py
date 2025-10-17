from pydantic import BaseModel, field_validator
from datetime import date, datetime
from typing import Optional

# --- Auth ---
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str

class RegisterRequest(BaseModel):
    username: str
    password: str
    role: str = "Reception"

    @field_validator("role")
    @classmethod
    def valid_role(cls, v):
        allowed = {"Admin", "Manager", "Reception", "Staff"}
        if v not in allowed:
            raise ValueError("Invalid role")
        return v

# --- Guests ---
class GuestCreate(BaseModel):
    firstName: str
    lastName: str
    phone: str
    email: Optional[str] = None
    idNumber: str

class GuestOut(BaseModel):
    guestID: int
    firstName: str
    lastName: str
    phone: str
    email: Optional[str]
    idNumber: str

# --- Rooms ---
class RoomOut(BaseModel):
    roomID: int
    roomNo: int
    typeName: str
    capacity: int
    currRate: float
    roomStatus: str
    location: str

# --- Reservations ---
class ReservationCreate(BaseModel):
    guestID: int
    branchID: int
    roomID: int
    checkInDate: date
    checkOutDate: date
    numGuests: int

class ReservationOut(BaseModel):
    bookingID: int
    guestID: int
    branchID: int
    roomID: int
    checkInDate: datetime
    checkOutDate: datetime
    numGuests: int
    bookingStatus: str

# --- Services ---
class ServiceUsageCreate(BaseModel):
    bookingID: int
    serviceID: int
    quantity: int = 1

# --- Payments ---
class InvoiceCreate(BaseModel):
    bookingID: int
    policyID: Optional[int] = None
    discountCode: Optional[int] = None

class PaymentCreate(BaseModel):
    invoiceID: int
    amount: float
    paymentMethod: str

# --- Reports ---
class RoomOccupancyReport(BaseModel):
    branchLocation: str
    roomNo: int
    availability: str

class GuestBillingSummary(BaseModel):
    invoiceID: int
    guestName: str
    unpaid_amount: float

class ServiceUsageReport(BaseModel):
    branchLocation: str
    roomNo: int
    serviceType: str
    total_quantity: int
    total_amount: float

class BillGeneration(BaseModel):
    roomCharges: float
    serviceCharges: float
    taxAmount: float
    discountAmount: float
    totalBill: float

# --- Branches ---
class BranchOut(BaseModel):
    branchID: int
    branchLocation: str

# --- Services ---
class ServiceOut(BaseModel):
    serviceID: int
    serviceType: str
    unit: str
    ratePerUnit: float
