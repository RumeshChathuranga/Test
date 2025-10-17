from datetime import date, datetime
from ..database.queries import call_proc
from typing import List, Dict, Optional

def get_available_rooms(branch_id: int, check_in: datetime, check_out: datetime) -> List[Dict]:
    """Get available rooms for given date range using stored procedure."""
    result = call_proc("sp_get_available_rooms", (branch_id, check_in, check_out))
    return result if result else []

def create_booking(guest_id: int, branch_id: int, room_id: int, 
                  check_in: datetime, check_out: datetime, num_guests: int) -> int:
    """Create a new booking using stored procedure."""
    result = call_proc("sp_create_booking", 
                      (guest_id, branch_id, room_id, check_in, check_out, num_guests))
    if result and len(result) > 0:
        return result[0]["bookingID"]
    raise Exception("Failed to create booking")

def checkin_guest(booking_id: int) -> Dict:
    """Check in a guest using stored procedure."""
    result = call_proc("sp_checkin", (booking_id,))
    if result and len(result) > 0:
        return result[0]
    raise Exception("Check-in failed")

def checkout_guest(booking_id: int) -> Dict:
    """Check out a guest using stored procedure."""
    result = call_proc("sp_checkout", (booking_id,))
    if result and len(result) > 0:
        return result[0]
    raise Exception("Check-out failed")

def create_guest(first_name: str, last_name: str, phone: str, 
                email: str, id_number: str) -> int:
    """Create a new guest using stored procedure."""
    try:
        result = call_proc("sp_create_guest_fixed", (first_name, last_name, phone, email, id_number))
        if result and len(result) > 0:
            return result[0]["guestID"]
        raise Exception("Failed to create guest")
    except Exception as e:
        print(f"Error creating guest: {e}")
        raise Exception(f"Failed to create guest: {str(e)}")

def get_guest(guest_id: int) -> Optional[Dict]:
    """Get guest information using stored procedure."""
    try:
        result = call_proc("sp_get_guest_by_id_fixed", (guest_id,))
        if result and len(result) > 0:
            return result[0]
        return None
    except Exception as e:
        print(f"Error getting guest: {e}")
        return None
