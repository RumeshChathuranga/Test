from ..database.queries import call_proc
from datetime import date
from typing import List, Dict

def get_revenue_report(branch_id: int, start_date: date, end_date: date) -> List[Dict]:
    """Get revenue report for a branch using stored procedure."""
    result = call_proc("sp_get_revenue_report", (branch_id, start_date, end_date))
    return result if result else []


def get_guest_billing_summary(branch_id: int = None, start_date: date = None, end_date: date = None) -> List[Dict]:
    """Get billing summary for guests using stored procedure."""
    # The stored procedure doesn't use these parameters yet, but we accept them for API consistency
    result = call_proc("sp_get_guest_billing_summary")
    return result if result else []


def get_service_usage_per_room(branch_id: int = None, start_date: date = None, end_date: date = None) -> List[Dict]:
    """Get service usage per room using stored procedure."""
    # The stored procedure doesn't use these parameters yet, but we accept them for API consistency
    result = call_proc("sp_get_service_usage_per_room")
    return result if result else []


def get_room_occupancy_report(start_date: date, end_date: date, branch_id: int = None) -> List[Dict]:
    """Get room occupancy according to date using stored procedure."""
    result = call_proc("sp_get_room_occupancy_report", (start_date, end_date))
    return result if result else []