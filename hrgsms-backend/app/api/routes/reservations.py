from fastapi import APIRouter, Depends, HTTPException, status, Query
from datetime import datetime
from typing import Optional
from ...api.dependancies import require_roles
from ...models.schemas import ReservationCreate, ReservationOut
from ...services.booking_service import (
    create_booking, checkin_guest, checkout_guest, create_guest,
    get_all_reservations, get_reservations_by_status, get_todays_reservations
)

router = APIRouter(prefix="/reservations", tags=["reservations"])

@router.get("/")
def get_reservations(
    status: Optional[str] = Query(None, description="Filter by booking status"),
    today: Optional[bool] = Query(False, description="Get today's reservations only"),
    user=Depends(require_roles("Admin", "Manager", "Reception"))
):
    """Get reservations with optional filtering."""
    try:
        if today:
            reservations = get_todays_reservations()
        elif status:
            reservations = get_reservations_by_status(status)
        else:
            reservations = get_all_reservations()
        
        return {"reservations": reservations, "count": len(reservations)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

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
