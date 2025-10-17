import { useState, useEffect } from "react";
import dayjs from "dayjs";
import apiClient from "../../api/client";
import Layout from "../../components/Layout";

type Reservation = {
  bookingID: number;
  guestID: number;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  branchID: number;
  branchName: string;
  roomID: number;
  roomNo: number;
  roomType: string;
  rate: number;
  checkInDate: string;
  checkOutDate: string;
  numGuests: number;
  bookingStatus: string;
  stayDuration: number;
  actionRequired?: string;
};

export default function ReservationsList() {
  const [allReservations, setAllReservations] = useState<Reservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<
    Reservation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");

  useEffect(() => {
    loadReservations();
  }, [filter]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [allReservations, searchTerm, branchFilter, dateFilter]);

  // Apply search and additional filters to the reservations
  function applyFiltersAndSearch() {
    let filtered = [...allReservations];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (reservation) =>
          reservation.guestName.toLowerCase().includes(searchLower) ||
          reservation.guestPhone.includes(searchTerm) ||
          reservation.guestEmail.toLowerCase().includes(searchLower) ||
          reservation.bookingID.toString().includes(searchTerm) ||
          reservation.roomNo.toString().includes(searchTerm) ||
          reservation.roomType.toLowerCase().includes(searchLower) ||
          reservation.branchName.toLowerCase().includes(searchLower)
      );
    }

    // Apply branch filter
    if (branchFilter !== "all") {
      filtered = filtered.filter(
        (reservation) => reservation.branchID.toString() === branchFilter
      );
    }

    // Apply date filter
    if (dateFilter !== "all") {
      const today = dayjs();
      const tomorrow = today.add(1, "day");
      const week = today.add(7, "days");

      filtered = filtered.filter((reservation) => {
        const checkIn = dayjs(reservation.checkInDate);
        const checkOut = dayjs(reservation.checkOutDate);

        switch (dateFilter) {
          case "today":
            return (
              checkIn.isSame(today, "day") || checkOut.isSame(today, "day")
            );
          case "tomorrow":
            return (
              checkIn.isSame(tomorrow, "day") ||
              checkOut.isSame(tomorrow, "day")
            );
          case "this_week":
            return checkIn.isBefore(week) && checkOut.isAfter(today);
          case "past":
            return checkOut.isBefore(today, "day");
          case "future":
            return checkIn.isAfter(today, "day");
          default:
            return true;
        }
      });
    }

    setFilteredReservations(filtered);
  }

  async function loadReservations() {
    setLoading(true);
    setError(null);

    try {
      let url = "/reservations/";
      const params = new URLSearchParams();

      if (filter === "today") {
        params.append("today", "true");
      } else if (filter !== "all") {
        params.append("status", filter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await apiClient.get(url);
      setAllReservations(response.data.reservations || []);
    } catch (err: any) {
      console.error("Error loading reservations:", err);
      setError(err.response?.data?.detail || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckin(bookingID: number) {
    if (!confirm(`Are you sure you want to check in booking #${bookingID}?`)) {
      return;
    }

    setMessage(null);
    setError(null);

    try {
      const response = await apiClient.post(
        `/reservations/${bookingID}/checkin`
      );
      setMessage(response.data?.message || "Guest checked in successfully");
      await loadReservations(); // Refresh the list
    } catch (err: any) {
      console.error("Check-in error:", err);
      setError(err.response?.data?.detail || "Failed to check in guest");
    }
  }

  async function handleCheckout(bookingID: number) {
    if (!confirm(`Are you sure you want to check out booking #${bookingID}?`)) {
      return;
    }

    setMessage(null);
    setError(null);

    try {
      const response = await apiClient.post(
        `/reservations/${bookingID}/checkout`
      );
      setMessage(response.data?.message || "Guest checked out successfully");
      await loadReservations(); // Refresh the list
    } catch (err: any) {
      console.error("Check-out error:", err);
      setError(err.response?.data?.detail || "Failed to check out guest");
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case "Booked":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "CheckedIn":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "CheckedOut":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200";
    }
  }

  // Highlight search terms in text
  function highlightSearchTerm(text: string, searchTerm: string) {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              🏨 Reservations Management
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              View and manage all hotel reservations
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              All Reservations
            </button>
            <button
              onClick={() => setFilter("today")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "today"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              📅 Today's Actions
            </button>
            <button
              onClick={() => setFilter("Booked")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "Booked"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              📋 Booked
            </button>
            <button
              onClick={() => setFilter("CheckedIn")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "CheckedIn"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              }`}
            >
              🏠 Checked In
            </button>
          </div>
        </div>

        {/* Search and Advanced Filters */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center">
            🔍 Search & Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                🔎 Search Reservations
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by guest name, phone, email, booking ID, or room number..."
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Branch Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                🏢 Branch
              </label>
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Branches</option>
                <option value="1">📍 Kandy</option>
                <option value="2">📍 Galle</option>
                <option value="3">📍 Colombo</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                📅 Date Range
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">📅 Today</option>
                <option value="tomorrow">🌅 Tomorrow</option>
                <option value="this_week">📋 This Week</option>
                <option value="future">⏭️ Future</option>
                <option value="past">⏮️ Past</option>
              </select>
            </div>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || branchFilter !== "all" || dateFilter !== "all") && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setBranchFilter("all");
                  setDateFilter("all");
                }}
                className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                🧹 Clear Filters
              </button>
            </div>
          )}

          {/* Results Summary */}
          {(searchTerm || branchFilter !== "all" || dateFilter !== "all") && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📊 Showing {filteredReservations.length} of{" "}
                {allReservations.length} reservations
                {searchTerm && ` matching "${searchTerm}"`}
                {branchFilter !== "all" &&
                  ` in ${
                    branchFilter === "1"
                      ? "Kandy"
                      : branchFilter === "2"
                      ? "Galle"
                      : "Colombo"
                  }`}
                {dateFilter !== "all" && ` for ${dateFilter.replace("_", " ")}`}
              </p>
            </div>
          )}
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                  Success
                </h3>
                <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                  {message}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-6 py-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-4"></div>
              <div>
                <p className="text-lg font-medium text-blue-900 dark:text-blue-100">
                  Loading reservations...
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Please wait while we fetch the data
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Reservations Table */}
        {!loading && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Reservations ({filteredReservations.length})
              </h2>
            </div>

            {filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                  No reservations found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {filter === "all"
                    ? "No reservations have been made yet."
                    : `No reservations found for the selected filter: ${filter}`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 dark:bg-slate-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Booking
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Guest
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Room
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Dates
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {filteredReservations.map((reservation: Reservation) => (
                      <tr
                        key={reservation.bookingID}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              #
                              {highlightSearchTerm(
                                reservation.bookingID.toString(),
                                searchTerm
                              )}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {reservation.stayDuration} day
                              {reservation.stayDuration !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {highlightSearchTerm(
                                reservation.guestName,
                                searchTerm
                              )}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              📞{" "}
                              {highlightSearchTerm(
                                reservation.guestPhone,
                                searchTerm
                              )}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              ✉️{" "}
                              {highlightSearchTerm(
                                reservation.guestEmail,
                                searchTerm
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              Room #
                              {highlightSearchTerm(
                                reservation.roomNo.toString(),
                                searchTerm
                              )}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {reservation.roomType}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              📍 {reservation.branchName}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Rs. {reservation.rate.toLocaleString()}/night
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              <span className="text-green-600 dark:text-green-400">
                                In:
                              </span>{" "}
                              {dayjs(reservation.checkInDate).format(
                                "MMM D, YYYY"
                              )}
                            </div>
                            <div className="text-sm text-slate-900 dark:text-slate-100">
                              <span className="text-red-600 dark:text-red-400">
                                Out:
                              </span>{" "}
                              {dayjs(reservation.checkOutDate).format(
                                "MMM D, YYYY"
                              )}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              👥 {reservation.numGuests} guest
                              {reservation.numGuests !== 1 ? "s" : ""}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                              reservation.bookingStatus
                            )}`}
                          >
                            {reservation.bookingStatus}
                          </span>
                          {reservation.actionRequired && (
                            <div className="mt-1 text-xs text-orange-600 dark:text-orange-400 font-medium">
                              {reservation.actionRequired}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {reservation.bookingStatus === "Booked" && (
                              <button
                                onClick={() =>
                                  handleCheckin(reservation.bookingID)
                                }
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                ✅ Check In
                              </button>
                            )}
                            {reservation.bookingStatus === "CheckedIn" && (
                              <button
                                onClick={() =>
                                  handleCheckout(reservation.bookingID)
                                }
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                              >
                                ❌ Check Out
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
