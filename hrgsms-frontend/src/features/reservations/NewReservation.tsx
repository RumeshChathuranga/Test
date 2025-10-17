import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export default function NewReservation() {
  const [searchParams] = useSearchParams();

  // Room information from URL parameters
  const [roomInfo, setRoomInfo] = useState({
    roomID: "",
    roomNo: "",
    typeName: "",
    rate: "",
    capacity: "",
  });

  const [form, setForm] = useState({
    guestID: "",
    branchID: "1",
    roomID: "",
    checkInDate: "",
    checkOutDate: "",
    numGuests: "1",
  });
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from URL parameters
  useEffect(() => {
    const roomID = searchParams.get("roomID") || "";
    const roomNo = searchParams.get("roomNo") || "";
    const branchID = searchParams.get("branchID") || "1";
    const checkIn = searchParams.get("checkIn") || "";
    const checkOut = searchParams.get("checkOut") || "";
    const typeName = searchParams.get("typeName") || "";
    const rate = searchParams.get("rate") || "";
    const capacity = searchParams.get("capacity") || "";

    setRoomInfo({
      roomID,
      roomNo,
      typeName,
      rate,
      capacity,
    });

    setForm((prev) => ({
      ...prev,
      roomID,
      branchID,
      checkInDate: checkIn ? dayjs(checkIn).format("YYYY-MM-DDTHH:mm") : "",
      checkOutDate: checkOut ? dayjs(checkOut).format("YYYY-MM-DDTHH:mm") : "",
    }));
  }, [searchParams]);

  function upd(key: string, val: string) {
    setForm({ ...form, [key]: val });
  }

  async function create() {
    setMessage(null);
    setError(null);

    // Enhanced validation
    if (
      !form.guestID ||
      !form.roomID ||
      !form.checkInDate ||
      !form.checkOutDate
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate guest ID is a positive number
    if (isNaN(Number(form.guestID)) || Number(form.guestID) <= 0) {
      setError("Guest ID must be a valid positive number");
      return;
    }

    // Validate room ID is a positive number
    if (isNaN(Number(form.roomID)) || Number(form.roomID) <= 0) {
      setError("Room ID must be a valid positive number");
      return;
    }

    // Validate number of guests
    if (isNaN(Number(form.numGuests)) || Number(form.numGuests) <= 0) {
      setError("Number of guests must be a valid positive number");
      return;
    }

    // Validate dates
    const checkInDate = dayjs(form.checkInDate);
    const checkOutDate = dayjs(form.checkOutDate);
    const now = dayjs();

    if (!checkInDate.isValid() || !checkOutDate.isValid()) {
      setError("Please enter valid dates");
      return;
    }

    if (checkInDate.isBefore(now.subtract(1, "hour"))) {
      setError("Check-in date cannot be in the past");
      return;
    }

    if (checkOutDate.isBefore(checkInDate)) {
      setError("Check-out date must be after check-in date");
      return;
    }

    if (checkOutDate.diff(checkInDate, "minutes") < 60) {
      setError("Minimum stay is 1 hour");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        guestID: Number(form.guestID),
        branchID: Number(form.branchID),
        roomID: Number(form.roomID),
        checkInDate: dayjs(form.checkInDate).format("YYYY-MM-DD"),
        checkOutDate: dayjs(form.checkOutDate).format("YYYY-MM-DD"),
        numGuests: Number(form.numGuests),
      };

      console.log("Sending payload:", payload); // Debug log
      console.log("Form state:", form); // Debug log

      const res = await apiClient.post("/reservations/", payload);
      setMessage(
        `Reservation created successfully! Booking ID: ${res.data.booking_id}`
      );

      // Reset form
      setForm({
        guestID: "",
        branchID: "1",
        roomID: "",
        checkInDate: "",
        checkOutDate: "",
        numGuests: "1",
      });
    } catch (err: any) {
      console.error("Error creating reservation:", err);
      console.error("Error response:", err.response?.data);

      // Handle different error response formats
      let errorMessage = "Failed to create reservation";

      if (err.response?.data) {
        const errorData = err.response.data;

        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.detail) {
          if (Array.isArray(errorData.detail)) {
            // Handle validation errors array
            errorMessage = errorData.detail
              .map((e: any) => {
                if (typeof e === "string") return e;
                if (e.msg) return `${e.loc?.[1] || "Field"}: ${e.msg}`;
                return JSON.stringify(e);
              })
              .join("; ");
          } else if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else {
            errorMessage = JSON.stringify(errorData.detail);
          }
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else {
          errorMessage = JSON.stringify(errorData);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            🏨 New Reservation
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create a new booking for your selected room
          </p>
        </div>

        {/* Room Information Card (if coming from availability page) */}
        {roomInfo.roomID && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center">
              🏠 Selected Room Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Room #{roomInfo.roomNo}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  {roomInfo.typeName}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  👥 {roomInfo.capacity}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Max Guests
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  Rs. {parseInt(roomInfo.rate).toLocaleString()}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">
                  Per Night
                </div>
              </div>
            </div>
          </div>
        )}

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
                  {typeof error === "string" ? error : JSON.stringify(error)}
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

        {/* Reservation Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
              📋 Reservation Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Guest Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    👤 Guest ID *
                  </label>
                  <input
                    type="number"
                    value={form.guestID}
                    onChange={(e) => upd("guestID", e.target.value)}
                    placeholder="Enter guest ID"
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Enter the guest ID for this reservation
                  </p>
                </div>

                {/* Branch Selection */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    🏢 Branch *
                  </label>
                  <select
                    value={form.branchID}
                    onChange={(e) => upd("branchID", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">📍 Kandy Branch</option>
                    <option value="2">📍 Galle Branch</option>
                    <option value="3">📍 Colombo Branch</option>
                  </select>
                </div>

                {/* Room ID */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    🏠 Room ID *
                  </label>
                  <input
                    type="number"
                    value={form.roomID}
                    onChange={(e) => upd("roomID", e.target.value)}
                    placeholder="Enter room ID"
                    readOnly={!!roomInfo.roomID}
                    className={`w-full rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      roomInfo.roomID
                        ? "bg-slate-100 dark:bg-slate-700"
                        : "bg-slate-50 dark:bg-slate-800"
                    }`}
                  />
                  {roomInfo.roomID && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                      ✅ Room automatically selected from availability search
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Check-in Date */}
                <div>
                  <label className="block text-sm font-semibold text-green-700 dark:text-green-400 mb-2">
                    📅 Check-in Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.checkInDate}
                    onChange={(e) => upd("checkInDate", e.target.value)}
                    min={dayjs().format("YYYY-MM-DDTHH:mm")}
                    className="w-full rounded-lg border border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    Standard check-in time: 2:00 PM
                  </p>
                </div>

                {/* Check-out Date */}
                <div>
                  <label className="block text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                    📅 Check-out Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.checkOutDate}
                    onChange={(e) => upd("checkOutDate", e.target.value)}
                    min={form.checkInDate || dayjs().format("YYYY-MM-DDTHH:mm")}
                    className="w-full rounded-lg border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    Standard check-out time: 11:00 AM
                  </p>
                </div>

                {/* Number of Guests */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    👥 Number of Guests *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={roomInfo.capacity || "10"}
                    value={form.numGuests}
                    onChange={(e) => upd("numGuests", e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {roomInfo.capacity && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Maximum capacity for this room: {roomInfo.capacity} guests
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Duration and Cost Summary */}
            {form.checkInDate && form.checkOutDate && (
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  📊 Booking Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {dayjs(form.checkOutDate).diff(
                        dayjs(form.checkInDate),
                        "day"
                      )}{" "}
                      days
                    </div>
                    <div className="text-sm text-blue-600 dark:text-blue-400">
                      Duration
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {form.numGuests} guest
                      {parseInt(form.numGuests) > 1 ? "s" : ""}
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400">
                      Total Guests
                    </div>
                  </div>
                  {roomInfo.rate && (
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        Rs.{" "}
                        {(
                          parseInt(roomInfo.rate) *
                          dayjs(form.checkOutDate).diff(
                            dayjs(form.checkInDate),
                            "day"
                          )
                        ).toLocaleString()}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Estimated Total
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={create}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg py-4 px-6 font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Reservation...
                  </>
                ) : (
                  <>📋 Create Reservation</>
                )}
              </button>
            </div>

            {/* Navigation to Reservations Management */}
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                🔄 Manage Reservations
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Need to check-in or check-out guests? View and manage all reservations from the reservations management page.
              </p>
              <a
                href="/reservations"
                className="inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg py-3 px-6 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
              >
                📋 View All Reservations
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
