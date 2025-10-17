# app/api/routes/reports.py
from fastapi import APIRouter, Depends, Query
from datetime import date
from typing import List, Dict
from ...services.report_service import get_revenue_report, get_room_occupancy_report, get_guest_billing_summary, get_service_usage_per_room
from ...api.dependancies import require_roles

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/revenue")
def revenue_report(
    branch_id: int = Query(..., description="Branch ID"),
    start_date: date = Query(..., description="Start date"),
    end_date: date = Query(..., description="End date"),
    user=Depends(require_roles("Admin", "Manager"))
):
    """Get revenue report for a branch within a date range."""
    return get_revenue_report(branch_id, start_date, end_date)

@router.get("/roomOccupancy")
def occupancy_report(
    start_date: date = Query(..., description="Start date"),
    end_date: date = Query(..., description="End date"),
    user=Depends(require_roles("Admin", "Manager"))
):
    """Get revenue report for a branch within a date range."""
    return get_room_occupancy_report(start_date, end_date)


@router.get("/guestBilling")
def occupancy_report(
    user=Depends(require_roles("Admin", "Manager"))
):
    """Get revenue report for a branch within a date range."""
    return get_guest_billing_summary()


@router.get("/serviceUsage")
def occupancy_report(
    user=Depends(require_roles("Admin", "Manager"))
):
    """Get revenue report for a branch within a date range."""
    return get_service_usage_per_room()
