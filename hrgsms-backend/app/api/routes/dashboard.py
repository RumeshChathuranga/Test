from fastapi import APIRouter, Depends
from ...services.dashboard_service import get_dashboard_stats
from ...api.dependancies import require_roles

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats")
def dashboard_stats(user=Depends(require_roles("Admin", "Manager", "Reception"))):
    """Get dashboard statistics including today's check-ins, check-outs, occupancy, and revenue."""
    return get_dashboard_stats()