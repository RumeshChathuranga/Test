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
        result = call_proc("sp_create_guest", (first_name, last_name, phone, email, id_number))
        if result and len(result) > 0:
            return result[0]["guestID"]
        raise Exception("Failed to create guest")
    except Exception as e:
        print(f"Error creating guest: {e}")
        raise Exception(f"Failed to create guest: {str(e)}")

def get_guest(guest_id: int) -> Optional[Dict]:
    """Get guest information using stored procedure."""
    try:
        result = call_proc("sp_get_guest_by_id", (guest_id,))
        if result and len(result) > 0:
            return result[0]
        return None
    except Exception as e:
        print(f"Error getting guest: {e}")
        return None

def search_guests(search_term: str = "") -> List[Dict]:
    """Search guests by name, phone, email, or ID number."""
    try:
        result = call_proc("sp_search_guests", (search_term,))
        return result if result else []
    except Exception as e:
        print(f"Error searching guests: {e}")
        return []

def get_all_guests() -> List[Dict]:
    """Get all guests (limited to 50 for performance)."""
    try:
        result = call_proc("sp_get_all_guests", ())
        return result if result else []
    except Exception as e:
        print(f"Error getting all guests: {e}")
        return []

def get_all_reservations() -> List[Dict]:
    """Get all reservations with guest and room details."""
    try:
        result = call_proc("sp_get_all_reservations", ())
        return result if result else []
    except Exception as e:
        print(f"Error getting all reservations: {e}")
        return []

def get_reservations_by_status(status: str) -> List[Dict]:
    """Get reservations filtered by status."""
    try:
        result = call_proc("sp_get_reservations_by_status", (status,))
        return result if result else []
    except Exception as e:
        print(f"Error getting reservations by status: {e}")
        return []

def get_todays_reservations() -> List[Dict]:
    """Get today's check-ins and check-outs."""
    try:
        result = call_proc("sp_get_todays_reservations", ())
        return result if result else []
    except Exception as e:
        print(f"Error getting today's reservations: {e}")
        return []
