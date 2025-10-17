import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export function RevenueReport() {
  const [branch_id, setBranch] = useState("1");
  const [start_date, setStart] = useState("2024-01-01");
  const [end_date, setEnd] = useState("2024-12-31");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/reports/revenue`, {
        params: { branch_id, start_date, end_date },
      });
      setData(res.data || []);
    } catch (err: any) {
      setError("Failed to load revenue report");
      console.error("Revenue report error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totalRevenue = data.reduce(
    (sum, item) => sum + (item.daily_revenue || 0),
    0
  );
  const totalInvoices = data.reduce(
    (sum, item) => sum + (item.total_invoices || 0),
    0
  );
  const totalBookings = data.reduce(
    (sum, item) => sum + (item.total_bookings || 0),
    0
  );
  const avgDailyRevenue = data.length > 0 ? totalRevenue / data.length : 0;

  return (
    <Layout>
      <div className="container-app max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            💰 Revenue Report
          </h1>
          <p className="text-green-100 mt-2">
            Detailed revenue analysis and financial performance
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Branch ID
              </label>
              <input
                type="number"
                value={branch_id}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReport}
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>📊 Generate Report</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalInvoices}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Bookings
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalBookings}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                  <span className="text-2xl">🏨</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Avg Daily Revenue
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    Rs {avgDailyRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
            </div>
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

        {/* Revenue Data Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Daily Revenue Breakdown
              </h3>
            </div>
            <div className="overflow-x-auto">
              {data.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Invoices
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Bookings
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Room Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Service Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Tax Collected
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                          Rs {item.daily_revenue?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.total_invoices || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                          {item.total_bookings || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                          Rs {item.room_revenue?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                          Rs {item.service_revenue?.toFixed(2) || "0.00"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                          Rs {item.tax_collected?.toFixed(2) || "0.00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No revenue data found for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function OccupancyReport() {
  const [branch_id, setBranch] = useState("1");
  const [start_date, setStart] = useState("2024-01-01");
  const [end_date, setEnd] = useState("2024-12-31");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/reports/roomOccupancy`, {
        params: { branch_id, start_date, end_date },
      });
      setData(res.data || []);
    } catch (err: any) {
      setError("Failed to load occupancy report");
      console.error("Occupancy report error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate averages
  const avgOccupancyRate =
    data.length > 0
      ? data.reduce((sum, item) => sum + (item.occupancy_percentage || 0), 0) /
        data.length
      : 0;
  const totalRooms = data.length > 0 ? data[0]?.total_rooms || 0 : 0;
  const avgOccupiedRooms =
    data.length > 0
      ? data.reduce((sum, item) => sum + (item.occupied_rooms || 0), 0) /
        data.length
      : 0;

  return (
    <Layout>
      <div className="container-app max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            🏨 Room Occupancy Report
          </h1>
          <p className="text-blue-100 mt-2">
            Track room utilization and occupancy trends
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Branch ID
              </label>
              <input
                type="number"
                value={branch_id}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReport}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>🏨 Generate Report</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Average Occupancy Rate
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {avgOccupancyRate.toFixed(1)}%
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Rooms
                  </p>
                  <p className="text-3xl font-bold text-slate-700 dark:text-slate-200">
                    {totalRooms}
                  </p>
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 p-3 rounded-full">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Avg Occupied Rooms
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {Math.round(avgOccupiedRooms)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
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

        {/* Occupancy Data Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Daily Occupancy Details
              </h3>
            </div>
            <div className="overflow-x-auto">
              {data.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total Rooms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Occupied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Available
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Occupancy Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((item, index) => {
                      const occupancyRate = item.occupancy_percentage || 0;
                      const statusColor =
                        occupancyRate >= 80
                          ? "text-green-600"
                          : occupancyRate >= 60
                          ? "text-yellow-600"
                          : "text-red-600";
                      const statusText =
                        occupancyRate >= 80
                          ? "High"
                          : occupancyRate >= 60
                          ? "Medium"
                          : "Low";

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            {item.total_rooms || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                            {item.occupied_rooms || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            {(item.total_rooms || 0) -
                              (item.occupied_rooms || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(occupancyRate, 100)}%`,
                                  }}
                                />
                              </div>
                              <span className="font-mono">
                                {occupancyRate.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-opacity-10 ${statusColor}`}
                            >
                              {statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No occupancy data found for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function GuestBillingReport() {
  const [branch_id, setBranch] = useState("1");
  const [start_date, setStart] = useState("2024-01-01");
  const [end_date, setEnd] = useState("2024-12-31");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/reports/guestBilling`, {
        params: { branch_id, start_date, end_date },
      });
      setData(res.data || []);
    } catch (err: any) {
      setError("Failed to load guest billing report");
      console.error("Guest billing report error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totalAmount = data.reduce(
    (sum, item) => sum + (item.total_amount || 0),
    0
  );
  const totalPaid = data.reduce((sum, item) => sum + (item.total_paid || 0), 0);
  const totalOutstanding = data.reduce(
    (sum, item) => sum + (item.outstanding_balance || 0),
    0
  );
  const uniqueGuests = new Set(data.map((item) => item.guest_id)).size;

  return (
    <Layout>
      <div className="container-app max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            👤 Guest Billing Report
          </h1>
          <p className="text-purple-100 mt-2">
            Detailed guest billing analysis and payment tracking
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Branch ID
              </label>
              <input
                type="number"
                value={branch_id}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReport}
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>👤 Generate Report</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Billed
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    Rs {totalAmount.toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Paid
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {totalPaid.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Outstanding
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    Rs {totalOutstanding.toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Unique Guests
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {uniqueGuests}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </div>
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

        {/* Guest Billing Data Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Guest Billing Details
              </h3>
            </div>
            <div className="overflow-x-auto">
              {data.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Check-in
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Amount Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Outstanding
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((item, index) => {
                      const outstanding = item.outstanding_balance || 0;
                      const isPaid = outstanding <= 0;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {item.first_name} {item.last_name}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">
                                ID: {item.guest_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 dark:text-white">
                              {item.email}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {item.phone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            {item.check_in_date
                              ? new Date(
                                  item.check_in_date
                                ).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                            Rs {item.total_amount?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-mono">
                            Rs {item.total_paid?.toFixed(2) || "0.00"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            <span
                              className={
                                outstanding > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }
                            >
                              Rs {outstanding.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                isPaid
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                  : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              }`}
                            >
                              {isPaid ? "Paid" : "Outstanding"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No guest billing data found for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export function ServiceUsageReport() {
  const [branch_id, setBranch] = useState("1");
  const [start_date, setStart] = useState("2024-01-01");
  const [end_date, setEnd] = useState("2024-12-31");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/reports/serviceUsage`, {
        params: { branch_id, start_date, end_date },
      });
      setData(res.data || []);
    } catch (err: any) {
      setError("Failed to load service usage report");
      console.error("Service usage report error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate totals
  const totalRevenue = data.reduce(
    (sum, item) => sum + (item.total_revenue || 0),
    0
  );
  const totalServices = data.reduce(
    (sum, item) => sum + (item.service_count || 0),
    0
  );
  const uniqueRooms = new Set(data.map((item) => item.room_number)).size;
  const avgRevenuePerService =
    totalServices > 0 ? totalRevenue / totalServices : 0;

  return (
    <Layout>
      <div className="container-app max-w-7xl py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold flex items-center gap-3">
            🛎️ Service Usage Report
          </h1>
          <p className="text-orange-100 mt-2">
            Track service utilization and revenue per room
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">
            Report Filters
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Branch ID
              </label>
              <input
                type="number"
                value={branch_id}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={start_date}
                onChange={(e) => setStart(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={end_date}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-colors"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={loadReport}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </>
                ) : (
                  <>🛎️ Generate Report</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    Rs {totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/20 p-3 rounded-full">
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Services
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {totalServices}
                  </p>
                </div>
                <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-full">
                  <span className="text-2xl">🛎️</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Rooms Served
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {uniqueRooms}
                  </p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-full">
                  <span className="text-2xl">🏠</span>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Avg per Service
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    Rs {avgRevenuePerService.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-full">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
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

        {/* Service Usage Data Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                Service Usage by Room
              </h3>
            </div>
            <div className="overflow-x-auto">
              {data.length > 0 ? (
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Room Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Services Used
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Total Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Avg per Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Usage Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                    {data.map((item, index) => {
                      const serviceCount = item.service_count || 0;
                      const revenue = item.total_revenue || 0;
                      const avgPerService =
                        serviceCount > 0 ? revenue / serviceCount : 0;

                      // Determine usage level based on service count
                      const usageLevel =
                        serviceCount >= 10
                          ? "High"
                          : serviceCount >= 5
                          ? "Medium"
                          : "Low";
                      const usageColor =
                        serviceCount >= 10
                          ? "text-green-600"
                          : serviceCount >= 5
                          ? "text-yellow-600"
                          : "text-red-600";

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                Room {item.room_number}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                            {item.room_type || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-blue-600">
                                {serviceCount}
                              </span>
                              <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(
                                      (serviceCount / 20) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                            Rs {revenue.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-mono">
                            Rs {avgPerService.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-opacity-10 ${usageColor}`}
                            >
                              {usageLevel}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-slate-500 dark:text-slate-400">
                    No service usage data found for the selected period.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
