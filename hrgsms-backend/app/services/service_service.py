# app/services/service_service.py
from ..database.queries import call_proc
from typing import Dict, List

def add_service_usage(booking_id: int, service_id: int, quantity: int) -> int:
    """Add service usage for a booking using stored procedure."""
    result = call_proc('sp_add_service_usage', (booking_id, service_id, quantity))
    if result and len(result) > 0:
        return result[0]["usageID"]
    raise Exception("Failed to add service usage")
