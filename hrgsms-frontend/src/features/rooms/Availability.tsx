import { useState } from "react";
import dayjs from "dayjs";
import apiClient from "../../api/client";
import Layout from "../../components/Layout";

type Room = {
  roomID: number;
  roomNo: number;
  typeName: string;
  capacity: number;
  currRate: number;
  roomStatus: string;
  location: string;
};

export default function Availability() {
  const [branchId, setBranchId] = useState(1);
  const [checkIn, setCheckIn] = useState(dayjs().format("YYYY-MM-DDTHH:mm"));
  const [checkOut, setCheckOut] = useState(
    dayjs().add(1, "day").format("YYYY-MM-DDTHH:mm")
  );
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    if (!checkIn || !checkOut) {
      setError("Please select both check-in and check-out dates");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        branch_id: String(branchId),
        check_in: dayjs(checkIn).toISOString(),
        check_out: dayjs(checkOut).toISOString(),
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
        <h1 className="text-xl font-semibold mb-4">Room Availability</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium">Branch</label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(Number(e.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            >
              <option value={1}>Kandy</option>
              <option value={2}>Galle</option>
              <option value={3}>Colombo</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Check-in</label>
            <input
              type="datetime-local"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Check-out</label>
            <input
              type="datetime-local"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={search}
              disabled={loading}
              className="rounded bg-blue-600 text-white px-4 py-2 w-full disabled:bg-blue-400"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-slate-600">
              Searching for available rooms...
            </p>
          </div>
        )}

        {!loading && rooms.length === 0 && checkIn && checkOut && (
          <div className="text-center py-8 text-slate-500">
            No rooms available for the selected dates.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rooms.map((r) => (
            <div
              key={r.roomID}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900"
            >
              <div className="font-medium">Room #{r.roomNo}</div>
              <div className="text-sm text-slate-500">
                Type: {r.typeName} (Capacity: {r.capacity})
              </div>
              <div className="text-sm text-slate-500">
                Rate: Rs. {r.currRate.toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">
                Status: {r.roomStatus}
              </div>
              <div className="text-sm text-slate-500">
                Location: {r.location}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
