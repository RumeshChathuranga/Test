import { useState } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export default function Usage() {
  const [form, setForm] = useState({
    booking_id: "",
    service_id: "",
    quantity: "1",
  });
  const [message, setMessage] = useState<string | null>(null);
  function upd(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }
  async function submit() {
    setMessage(null);
    const res = await apiClient.post("/services/usage", {
      booking_id: Number(form.booking_id),
      service_id: Number(form.service_id),
      quantity: Number(form.quantity),
    });
    setMessage(`Usage added #${res.data.usage_id}`);
  }
  return (
    <Layout>
      <div className="container-app max-w-xl py-8 space-y-4">
        <h1 className="text-xl font-semibold">Add Service Usage</h1>
        {["booking_id", "service_id", "quantity"].map((f) => (
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
          Add Usage
        </button>
      </div>
    </Layout>
  );
}
