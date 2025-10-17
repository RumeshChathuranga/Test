import { useState } from "react";
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
  const [form, setForm] = useState({
    invoice_id: "",
    amount: "",
    payment_method: "Card",
  });
  const [message, setMessage] = useState<string | null>(null);
  function upd(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }
  async function submit() {
    setMessage(null);
    const res = await apiClient.post("/payments/", {
      invoice_id: Number(form.invoice_id),
      amount: Number(form.amount),
      payment_method: form.payment_method,
    });
    setMessage(`Payment added TX #${res.data.transaction_id}`);
  }
  return (
    <Layout>
      <div className="container-app max-w-xl py-8 space-y-4">
        <h1 className="text-xl font-semibold">Add Payment</h1>
        {["invoice_id", "amount", "payment_method"].map((f) => (
          <div key={f}>
            <label className="block text-sm font-medium capitalize">
              {f.replace("_", " ")}
            </label>
            <input
              value={(form as any)[f]}
              onChange={(e) => upd(f, e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
        ))}
        {message && <p className="text-green-700">{message}</p>}
        <button
          onClick={submit}
          className="rounded bg-blue-600 text-white px-4 py-2"
        >
          Add Payment
        </button>
      </div>
    </Layout>
  );
}
