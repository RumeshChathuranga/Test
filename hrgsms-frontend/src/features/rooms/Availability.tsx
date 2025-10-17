import { useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import apiClient from "../../api/client";
import Layout from "../../components/Layout";

type Room = {
  roomID: number;
  roomNo: number;
  typeName: string;
  capacity: number;
  basePrice: number;
  roomStatus: string;
  typeID: number;
  typeDescription: string;
};

export default function Availability() {
  const navigate = useNavigate();
  const [branchId, setBranchId] = useState(1);
  const [checkIn, setCheckIn] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [checkOut, setCheckOut] = useState(
    dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm")
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle booking navigation
  const handleBookRoom = (room: Room) => {
    const params = new URLSearchParams({
      roomID: room.roomID.toString(),
      roomNo: room.roomNo.toString(),
      branchID: branchId.toString(),
      checkIn: checkIn,
      checkOut: checkOut,
      typeName: room.typeName,
      rate: room.basePrice.toString(),
      capacity: room.capacity.toString(),
    });
    navigate(`/reservations/new?${params.toString()}`);
  };

  async function search() {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    // Enhanced validation
    const checkInDate = dayjs(checkIn);
    const checkOutDate = dayjs(checkOut);
    const now = dayjs();

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
    setError("");

    try {
      const params = new URLSearchParams({
        branch_id: String(branchId),
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
      });
      const res = await apiClient.get(`/rooms/available?${params.toString()}`);
      setRooms(res.data || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to search rooms");
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Room Availability Search
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Find and book available rooms for your stay
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 mb-8">
          {/* Branch Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Select Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="w-full max-w-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={1}>🏨 Kandy Branch</option>
              <option value={2}>🏖️ Galle Branch</option>
              <option value={3}>🏙️ Colombo Branch</option>
            </select>
          </div>

          {/* Date Time Pickers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Check-in DateTime */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-green-700 dark:text-green-400">
                ✅ Check-in Date & Time
              </label>
              <input
                type="datetime-local"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={dayjs().format("YYYY-MM-DDTHH:mm")}
                className="w-full rounded-lg border border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <div className="text-xs text-green-600 dark:text-green-400">
                Standard hotel check-in: 2:00 PM
              </div>
            </div>

            {/* Check-out DateTime */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-red-700 dark:text-red-400">
                ❌ Check-out Date & Time
              </label>
              <input
                type="datetime-local"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={dayjs().format("YYYY-MM-DDTHH:mm")}
                className="w-full rounded-lg border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
              <div className="text-xs text-red-600 dark:text-red-400">
                Standard hotel check-out: 11:00 AM
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center">
            <button
              onClick={search}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed min-w-[200px]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
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
                  Searching...
                </span>
              ) : (
                "🔍 Search Available Rooms"
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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
                  Search Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
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
                  Searching for available rooms...
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Please wait while we check availability
                </p>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && rooms.length === 0 && checkIn && checkOut && !error && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8">
              <div className="mx-auto h-16 w-16 text-yellow-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                No rooms available
              </h3>
              <p className="text-yellow-700 dark:text-yellow-300">
                No rooms are available for the selected dates and times. Try
                different dates or check other branches.
              </p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {!loading && rooms.length > 0 && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  Available Rooms ({rooms.length})
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {dayjs(checkIn).format("MMM D, YYYY [at] h:mm A")} →{" "}
                  {dayjs(checkOut).format("MMM D, YYYY [at] h:mm A")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">
                  Duration: {dayjs(checkOut).diff(dayjs(checkIn), "hours")}{" "}
                  hours
                </div>
              </div>
            </div>

            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((r) => (
                <div
                  key={r.roomID}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-200 p-6"
                >
                  {/* Room Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      Room #{r.roomNo}
                    </div>
                    <div className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                      {r.roomStatus}
                    </div>
                  </div>

                  {/* Room Details */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Type:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {r.typeName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Capacity:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        👥 {r.capacity} guests
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">
                        Room Type:
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        🏠 {r.typeDescription}
                      </span>
                    </div>
                  </div>

                  {/* Rate Section */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600 dark:text-slate-400">
                        Rate per night:
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          Rs. {r.basePrice.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          + taxes & fees
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleBookRoom(r)}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg py-3 px-4 font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    📅 Book This Room
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
