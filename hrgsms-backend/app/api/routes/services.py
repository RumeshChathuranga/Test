from fastapi import APIRouter, Depends, HTTPException, status
from ...api.dependancies import require_roles
from ...models.schemas import ServiceUsageCreate
from ...services.service_service import add_service_usage

router = APIRouter(prefix="/services", tags=["services"])

@router.post("/usage", status_code=201)
def add_service_usage_endpoint(
    payload: ServiceUsageCreate, 
    user=Depends(require_roles("Admin", "Manager", "Reception", "Staff"))
):
    """Add service usage for a booking."""
    try:
        usage_id = add_service_usage(payload.bookingID, payload.serviceID, payload.quantity)
        return {"usage_id": usage_id, "message": "Service usage added successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))