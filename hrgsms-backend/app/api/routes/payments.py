# app/api/routes/payments.py
from fastapi import APIRouter, Depends, HTTPException, status
from ...models.schemas import InvoiceCreate, PaymentCreate
from ...services.payment_service import create_invoice, add_payment, get_all_invoices
from ...api.dependancies import require_roles

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/invoices", status_code=201)
def create_invoice_endpoint(
    payload: InvoiceCreate, 
    user=Depends(require_roles("Admin", "Manager", "Reception"))
):
    """Create an invoice for a booking."""
    try:
        invoice_id = create_invoice(payload.bookingID, payload.discountCode)
        return {"invoice_id": invoice_id, "message": "Invoice created successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/", status_code=201)
def add_payment_endpoint(
    payload: PaymentCreate, 
    user=Depends(require_roles("Admin", "Manager", "Reception"))
):
    """Add a payment to an invoice."""
    try:
        transaction_id = add_payment(payload.invoiceID, payload.amount, payload.paymentMethod)
        return {"transaction_id": transaction_id, "message": "Payment added successfully"}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/invoices")
def get_invoices_endpoint(user=Depends(require_roles("Admin", "Manager", "Reception"))):
    """Get all invoices with guest and booking details."""
    try:
        invoices = get_all_invoices()
        return {"invoices": invoices, "total": len(invoices)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
