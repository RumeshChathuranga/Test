from fastapi import APIRouter, Depends, HTTPException, status
from ...api.dependancies import require_roles
from ...models.schemas import GuestCreate, GuestOut
from ...services.booking_service import create_guest, get_guest

router = APIRouter(prefix="/guests", tags=["guests"])

@router.post("/", status_code=201)
def create_guest_endpoint(
    payload: GuestCreate, 
    user=Depends(require_roles("Admin", "Manager", "Reception"))
):
    """Create a new guest."""
    try:
        guest_id = create_guest(
            payload.firstName, 
            payload.lastName, 
            payload.phone, 
            payload.email, 
            payload.idNumber
        )
        return {"guest_id": guest_id, "message": "Guest created successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{guest_id}", response_model=GuestOut)
def get_guest_endpoint(
    guest_id: int, 
    user=Depends(require_roles("Admin", "Manager", "Reception"))
):
    """Get guest information by ID."""
    guest = get_guest(guest_id)
    if not guest:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guest not found")
    return guest