from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from ...api.dependancies import require_roles
from ...models.schemas import ReservationCreate, ReservationOut
from ...services.booking_service import create_booking, checkin_guest, checkout_guest, create_guest

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.post("/", status_code=201)
def create_reservation(payload: ReservationCreate, user=Depends(require_roles("Admin", "Manager", "Reception"))):
    try:
        # Convert dates to datetime for the stored procedure
        check_in_dt = datetime.combine(payload.checkInDate, datetime.min.time())
        check_out_dt = datetime.combine(payload.checkOutDate, datetime.min.time())
        
        booking_id = create_booking(
            payload.guestID, 
            payload.branchID,
            payload.roomID, 
            check_in_dt, 
            check_out_dt, 
            payload.numGuests
        )
        return {"booking_id": booking_id, "message": "Reservation created successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{booking_id}/checkin")
def checkin(booking_id: int, user=Depends(require_roles("Admin", "Manager", "Reception"))):
    try:
        result = checkin_guest(booking_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/{booking_id}/checkout")
def checkout(booking_id: int, user=Depends(require_roles("Admin", "Manager", "Reception"))):
    try:
        result = checkout_guest(booking_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
