import { useState } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export function CreateInvoice() {
  const [form, setForm] = useState({
    booking_id: "",
    policy_id: "",
    discount_code: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  function upd(k: string, v: string) {
    setForm({ ...form, [k]: v });
  }
  async function submit() {
    setMessage(null);
    const res = await apiClient.post("/payments/invoices", {
      booking_id: Number(form.booking_id),
      policy_id: Number(form.policy_id),
      discount_code: form.discount_code || null,
    });
    setMessage(`Invoice #${res.data.invoice_id} created`);
  }
  return (
    <Layout>
      <div className="container-app max-w-xl py-8 space-y-4">
        <h1 className="text-xl font-semibold">Create Invoice</h1>
        {["booking_id", "policy_id", "discount_code"].map((f) => (
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
          Create Invoice
        </button>
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
