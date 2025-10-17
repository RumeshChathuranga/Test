import { useState } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export default function NewReservation() {
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

  function upd(key: string, val: string) {
    setForm({ ...form, [key]: val });
  }

  async function create() {
    setMessage(null);
    setError(null);
    
    // Validation
    if (!form.guestID || !form.roomID || !form.checkInDate || !form.checkOutDate) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (new Date(form.checkInDate) >= new Date(form.checkOutDate)) {
      setError("Check-out date must be after check-in date");
      return;
    }
    
    setLoading(true);
    
    try {
      const payload = {
        guestID: Number(form.guestID),
        branchID: Number(form.branchID),
        roomID: Number(form.roomID),
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        numGuests: Number(form.numGuests),
      };
      const res = await apiClient.post("/reservations/", payload);
      setMessage(`Reservation created successfully! Booking ID: ${res.data.booking_id}`);
      
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
      setError(err.response?.data?.detail || "Failed to create reservation");
    } finally {
      setLoading(false);
    }
  }

  async function checkin() {
    const bookingId = prompt("Enter booking ID to check-in");
    if (!bookingId || !bookingId.trim()) return;
    
    setMessage(null);
    setError(null);
    setLoading(true);
    
    try {
      const res = await apiClient.post(`/reservations/${bookingId}/checkin`);
      setMessage(res.data?.message ?? "Guest checked in successfully");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to check-in guest");
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    const bookingId = prompt("Enter booking ID to check-out");
    if (!bookingId || !bookingId.trim()) return;
    
    setMessage(null);
    setError(null);
    setLoading(true);
    
    try {
      const res = await apiClient.post(`/reservations/${bookingId}/checkout`);
      setMessage(res.data?.message ?? "Guest checked out successfully");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to check-out guest");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="container-app max-w-xl py-8 space-y-4">
        <h1 className="text-xl font-semibold">New Reservation</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Guest ID</label>
            <input
              type="number"
              value={form.guestID}
              onChange={(e) => upd("guestID", e.target.value)}
              placeholder="Enter guest ID"
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Branch</label>
            <select
              value={form.branchID}
              onChange={(e) => upd("branchID", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            >
              <option value="1">Kandy</option>
              <option value="2">Galle</option>
              <option value="3">Colombo</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Room ID</label>
            <input
              type="number"
              value={form.roomID}
              onChange={(e) => upd("roomID", e.target.value)}
              placeholder="Enter room ID"
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Check-in Date</label>
            <input
              type="date"
              value={form.checkInDate}
              onChange={(e) => upd("checkInDate", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Check-out Date</label>
            <input
              type="date"
              value={form.checkOutDate}
              onChange={(e) => upd("checkOutDate", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium">Number of Guests</label>
            <input
              type="number"
              min="1"
              value={form.numGuests}
              onChange={(e) => upd("numGuests", e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={create}
            disabled={loading}
            className="rounded bg-blue-600 text-white px-4 py-2 disabled:bg-blue-400 flex-1"
          >
            {loading ? "Creating..." : "Create Reservation"}
          </button>
          <button
            onClick={checkin}
            disabled={loading}
            className="rounded bg-green-600 text-white px-4 py-2 disabled:bg-green-400"
          >
            {loading ? "..." : "Check-in"}
          </button>
          <button
            onClick={checkout}
            disabled={loading}
            className="rounded bg-orange-600 text-white px-4 py-2 disabled:bg-orange-400"
          >
            {loading ? "..." : "Check-out"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
