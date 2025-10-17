from fastapi import APIRouter, Depends, Query
from datetime import datetime
from typing import List
from ...api.dependancies import require_roles
from ...models.schemas import RoomOut
from ...services.booking_service import get_available_rooms

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.get("/available")
def get_available_rooms_endpoint(
    branch_id: int = Query(..., description="Branch ID"),
    check_in: datetime = Query(..., description="Check-in date and time"),
    check_out: datetime = Query(..., description="Check-out date and time"),
    user=Depends(require_roles("Admin", "Manager", "Reception"))
):
    """Get available rooms for the specified date range."""
    return get_available_rooms(branch_id, check_in, check_out)
