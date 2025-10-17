import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export function CreateInvoice() {
  const [form, setForm] = useState({
    bookingID: "",
    discountCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function upd(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }

  async function submit() {
    if (!form.bookingID) {
      setError("Booking ID is required");
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiClient.post("/payments/invoices", {
        bookingID: Number(form.bookingID),
        discountCode: form.discountCode ? Number(form.discountCode) : null,
      });
      setMessage(`✅ Invoice #${res.data.invoice_id} created successfully`);
      setForm({ bookingID: "", discountCode: "" }); // Reset form
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container-app max-w-2xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            📄 Create Invoice
          </h1>
          <p className="text-blue-100 mt-2">
            Generate billing invoice for hotel bookings
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="space-y-5">
            {/* Booking ID */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                🏨 Booking ID *
              </label>
              <input
                type="number"
                value={form.bookingID}
                onChange={(e) => upd("bookingID", e.target.value)}
                placeholder="Enter booking ID (e.g., 123)"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-lg"
                required
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">
                The booking reference number for which to create the invoice
              </p>
            </div>

            {/* Discount Code */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                🎫 Discount Code (Optional)
              </label>
              <input
                type="number"
                value={form.discountCode}
                onChange={(e) => upd("discountCode", e.target.value)}
                placeholder="Enter discount code if available"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors text-lg"
                min="1"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave empty if no discount applies to this booking
              </p>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 flex items-center gap-2">
                ❌ <span>{error}</span>
              </p>
            </div>
          )}

          {message && (
            <div className="mt-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-700 dark:text-green-400 font-medium">
                {message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={submit}
            disabled={loading || !form.bookingID}
            className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Invoice...
              </>
            ) : (
              <>📄 Create Invoice</>
            )}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
              📊 Automatic Calculations
            </h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm">
              Room charges, service charges, and taxes (10%) are calculated
              automatically based on booking details.
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
              💡 Smart Features
            </h3>
            <p className="text-green-600 dark:text-green-400 text-sm">
              Tax policies are applied automatically. Discounts are validated
              for active periods.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export function AddPayment() {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    invoice_id: searchParams.get("invoiceId") || "",
    amount: searchParams.get("amount") || "",
    payment_method: "Card",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  function upd(k: string, v: string) {
    setForm({ ...form, [k]: v });
    // Clear any previous errors when user starts typing
    if (error) setError(null);
  }

  async function submit() {
    setError(null);
    setMessage(null);

    // Validation
    if (!form.invoice_id) {
      setError("Invoice ID is required");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Please enter a valid payment amount");
      return;
    }

    if (!form.payment_method) {
      setError("Please select a payment method");
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.post("/payments/", {
        invoiceID: Number(form.invoice_id),
        amount: Number(form.amount),
        paymentMethod: form.payment_method,
      });

      setMessage(`✅ Payment processed successfully! 
      
💰 Amount: Rs ${Number(form.amount).toFixed(2)}
🏦 Method: ${form.payment_method}
📋 Transaction ID: ${res.data.transaction_id}
📄 Invoice ID: ${form.invoice_id}

The payment has been recorded and the invoice balance will be updated automatically.`);

      // Reset form
      setForm({
        invoice_id: "",
        amount: "",
        payment_method: "Card",
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to process payment");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container-app max-w-3xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            💳 Process Payment
          </h1>
          <p className="text-green-100 mt-2">
            Accept and process customer payments for hotel invoices
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
              💰 Payment Details
            </h2>

            <div className="space-y-5">
              {/* Invoice ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  📋 Invoice ID *
                </label>
                <input
                  type="number"
                  value={form.invoice_id}
                  onChange={(e) => upd("invoice_id", e.target.value)}
                  placeholder="Enter invoice number (e.g., 12345)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors text-lg"
                  required
                  min="1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  The invoice reference number for which payment is being made
                </p>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  💵 Payment Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">
                    Rs
                  </span>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => upd("amount", e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors text-lg font-mono"
                    required
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Enter the amount to be paid (partial payments allowed)
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  🏦 Payment Method *
                </label>
                <select
                  value={form.payment_method}
                  onChange={(e) => upd("payment_method", e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors text-lg"
                  required
                >
                  <option value="Card">💳 Credit/Debit Card</option>
                  <option value="Cash">💵 Cash</option>
                  <option value="Online">🌐 Online Transfer</option>
                  <option value="Other">📋 Other</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">
                  Select how the customer is paying
                </p>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mt-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-red-700 dark:text-red-400 flex items-center gap-2">
                  ❌ <span>{error}</span>
                </p>
              </div>
            )}

            {message && (
              <div className="mt-5 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  {message}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={submit}
              disabled={loading || !form.invoice_id || !form.amount}
              className="mt-6 w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:from-slate-400 disabled:to-slate-500 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>💳 Process Payment</>
              )}
            </button>
          </div>

          {/* Payment Info Sidebar */}
          <div className="space-y-4">
            {/* Payment Security */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
                🔒 Secure Processing
              </h3>
              <p className="text-blue-600 dark:text-blue-400 text-sm">
                All payments are processed securely with automatic transaction
                tracking and audit trails.
              </p>
            </div>

            {/* Payment Methods Info */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2">
                💡 Payment Options
              </h3>
              <ul className="text-green-600 dark:text-green-400 text-sm space-y-1">
                <li>• Partial payments accepted</li>
                <li>• Multiple payment methods</li>
                <li>• Instant transaction confirmation</li>
                <li>• Automatic receipt generation</li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 dark:bg-slate-900/20 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                ⚡ Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  📋 View Recent Invoices
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  📊 Payment History
                </button>
                <button className="w-full text-left px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  🧾 Generate Receipt
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2 flex items-center gap-2">
            💡 Payment Processing Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-yellow-600 dark:text-yellow-400 text-sm">
            <div>
              <p>
                <strong>Partial Payments:</strong> Customers can pay any amount
                towards their invoice. The system will track the remaining
                balance automatically.
              </p>
            </div>
            <div>
              <p>
                <strong>Payment Methods:</strong> Choose the appropriate method
                to ensure proper accounting and reporting.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Re-export the InvoiceList component
export { InvoiceList } from "./InvoiceList";
