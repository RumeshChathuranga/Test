import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import apiClient from "../api/client";

interface DashboardStats {
  today_checkins: number;
  today_checkouts: number;
  total_rooms: number;
  occupied_rooms: number;
  available_rooms: number;
  occupancy_percentage: number;
  today_revenue: number;
  monthly_revenue: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const response = await apiClient.get("/dashboard/stats");
        setStats(response.data);
        setError(null);
      } catch (err: any) {
        setError("Failed to load dashboard statistics");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container-app py-8">
          <h1 className="text-2xl font-semibold mb-4">HRGSMS Dashboard</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 animate-pulse"
              >
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container-app py-8">
          <h1 className="text-2xl font-semibold mb-4">HRGSMS Dashboard</h1>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-app py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">HRGSMS Dashboard</h1>
          <div className="text-sm text-slate-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Today Check-ins
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {stats?.today_checkins || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Today Check-outs
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {stats?.today_checkouts || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">Total Rooms</div>
                <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                  {stats?.total_rooms || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-slate-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Occupied Rooms
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {stats?.occupied_rooms || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Available Rooms
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  {stats?.available_rooms || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Occupancy Rate
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {stats?.occupancy_percentage?.toFixed(1) || 0}%
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Today's Revenue
                </div>
                <div className="text-3xl font-bold text-amber-600">
                  Rs. {stats?.today_revenue?.toLocaleString() || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-6 bg-white dark:bg-slate-900 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-500 mb-1">
                  Monthly Revenue
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  Rs. {stats?.monthly_revenue?.toLocaleString() || 0}
                </div>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
              <div className="font-medium">New Reservation</div>
              <div className="text-sm text-slate-500">Create a new booking</div>
            </button>
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
              <div className="font-medium">Add Guest</div>
              <div className="text-sm text-slate-500">Register new guest</div>
            </button>
            <button className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left">
              <div className="font-medium">Room Status</div>
              <div className="text-sm text-slate-500">
                View room availability
              </div>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
