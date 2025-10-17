import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export function InvoiceList() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load invoices when component mounts
  useEffect(() => {
    loadInvoices();
  }, []);

  async function loadInvoices() {
    setLoading(true);
    setError(null);

    try {
      const res = await apiClient.get("/payments/invoices");
      setInvoices(res.data.invoices || []);
    } catch (err: any) {
      setError("Failed to load invoices");
      console.error("Error loading invoices:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter invoices based on status and search query
  const filteredInvoices = invoices.filter((invoice) => {
    // Status filter
    let statusMatch = true;
    if (filter === "pending") statusMatch = invoice.invoiceStatus === "Pending";
    if (filter === "paid") statusMatch = invoice.invoiceStatus === "Paid";
    if (filter === "outstanding") statusMatch = invoice.balanceAmount > 0;

    // Search filter by name, email, or invoice ID
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        invoice.firstName?.toLowerCase().includes(query) ||
        invoice.lastName?.toLowerCase().includes(query) ||
        invoice.email?.toLowerCase().includes(query) ||
        invoice.invoiceID?.toString().includes(query) ||
        invoice.bookingID?.toString().includes(query);
    }

    return statusMatch && searchMatch;
  });

  // Quick payment function
  function handleQuickPayment(invoiceId: number, balanceAmount: number) {
    // Navigate to add payment page with pre-filled invoice ID
    navigate(`/billing/payment?invoiceId=${invoiceId}&amount=${balanceAmount}`);
  }

  return (
    <Layout>
      <div className="container-app max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            📋 Invoice Management
          </h1>
          <p className="text-purple-100 mt-2">
            View and manage all hotel invoices and process payments
          </p>
        </div>

        {/* Search and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or invoice ID..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              All ({invoices.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Pending ({invoices.filter((i) => i.invoiceStatus === "Pending").length})
            </button>
            <button
              onClick={() => setFilter("outstanding")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "outstanding"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Outstanding ({invoices.filter((i) => i.balanceAmount > 0).length})
            </button>
            <button
              onClick={() => setFilter("paid")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "paid"
                  ? "bg-purple-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              Paid ({invoices.filter((i) => i.invoiceStatus === "Paid").length})
            </button>
          </div>

          <button
            onClick={loadInvoices}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🔄 Refresh
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Loading invoices...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-700 dark:text-red-400 flex items-center gap-2">
              ❌ <span>{error}</span>
            </p>
          </div>
        )}

        {/* Invoice Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredInvoices.map((invoice) => (
              <div
                key={invoice.invoiceID}
                className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow"
              >
                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                      Invoice #{invoice.invoiceID}
                    </h3>
                    <p className="text-sm text-slate-500">
                      Booking #{invoice.bookingID}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.invoiceStatus === "Paid"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : invoice.invoiceStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    }`}
                  >
                    {invoice.invoiceStatus}
                  </span>
                </div>

                {/* Guest Info */}
                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <p className="font-medium text-slate-800 dark:text-white">
                    {invoice.firstName} {invoice.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{invoice.email}</p>
                  <p className="text-sm text-slate-500">Room {invoice.roomNo} - {invoice.roomType}</p>
                  <p className="text-sm text-slate-500">
                    {new Date(invoice.checkInDate).toLocaleDateString()} - {new Date(invoice.checkOutDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Financial Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Room Charges:</span>
                    <span className="font-mono">Rs {invoice.roomCharges?.toFixed(2) || "0.00"}</span>
                  </div>
                  {invoice.serviceCharges > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Service Charges:</span>
                      <span className="font-mono">Rs {invoice.serviceCharges.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.taxAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Tax:</span>
                      <span className="font-mono">Rs {invoice.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Discount:</span>
                      <span className="font-mono text-green-600">-Rs {invoice.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount:</span>
                    <span className="font-mono">Rs {invoice.totalAmount?.toFixed(2) || "0.00"}</span>
                  </div>
                  {invoice.settledAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Paid:</span>
                      <span className="font-mono text-green-600">Rs {invoice.settledAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {invoice.balanceAmount > 0 && (
                    <div className="flex justify-between font-semibold text-red-600 dark:text-red-400">
                      <span>Balance Due:</span>
                      <span className="font-mono">Rs {invoice.balanceAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {invoice.balanceAmount > 0 && (
                    <button
                      onClick={() => handleQuickPayment(invoice.invoiceID, invoice.balanceAmount)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      💳 Pay Rs {invoice.balanceAmount.toFixed(2)}
                    </button>
                  )}
                  <button className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm transition-colors">
                    📋 Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 text-lg mb-4">No invoices found</p>
            <p className="text-slate-400">
              {filter === "all" ? "No invoices have been created yet." : `No ${filter} invoices found.`}
            </p>
          </div>
        )}

        {/* Summary Stats */}
        {!loading && !error && invoices.length > 0 && (
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{invoices.length}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Invoices</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  Rs {invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  Rs {invoices.reduce((sum, inv) => sum + (inv.balanceAmount || 0), 0).toFixed(2)}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Outstanding</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {invoices.filter((i) => (i.balanceAmount || 0) > 0).length}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Unpaid</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}