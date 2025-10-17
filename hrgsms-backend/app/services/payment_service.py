from ..database.queries import call_proc
from typing import Dict, List

def create_invoice(booking_id: int, discount_code: int = None) -> int:
    """Create invoice for a booking using stored procedure."""
    result = call_proc("sp_create_invoice", (booking_id, discount_code))
    if result and len(result) > 0:
        return result[0]["invoiceID"]
    raise Exception("Failed to create invoice")

def add_payment(invoice_id: int, amount: float, method: str) -> int:
    """Add payment to an invoice using stored procedure."""
    result = call_proc("sp_add_payment", (invoice_id, amount, method))
    if result and len(result) > 0:
        return result[0]["transactionID"]
    raise Exception("Failed to add payment")

def get_all_invoices() -> List[Dict]:
    """Get all invoices with guest and booking details."""
    try:
        result = call_proc("sp_get_all_invoices", ())
        return result if result else []
    except Exception as e:
        print(f"Error getting all invoices: {e}")
        return []


