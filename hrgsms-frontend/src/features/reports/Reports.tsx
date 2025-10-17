import { useState } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

export function RevenueReport() {
  const [branch_id, setBranch] = useState("1");
  const [start_date, setStart] = useState("2024-01-01");
  const [end_date, setEnd] = useState("2024-12-31");
  const [data, setData] = useState<any[]>([]);
  async function run() {
    const res = await apiClient.get(`/reports/revenue`, {
      params: { branch_id, start_date, end_date },
    });
    setData(res.data);
  }
  return (
    <Layout>
      <div className="container-app py-8">
        <h1 className="text-xl font-semibold mb-4">Revenue Report</h1>
        <div className="flex gap-2 mb-4">
          <input
            value={branch_id}
            onChange={(e) => setBranch(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <input
            value={start_date}
            onChange={(e) => setStart(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <input
            value={end_date}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <button onClick={run} className="rounded bg-blue-600 text-white px-4">
            Run
          </button>
        </div>
        <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Layout>
  );
}

export function OccupancyReport() {
  const [start_date, setStart] = useState("2024-01-01");
  const [end_date, setEnd] = useState("2024-12-31");
  const [data, setData] = useState<any[]>([]);
  async function run() {
    const res = await apiClient.get(`/reports/roomOccupancy`, {
      params: { start_date, end_date },
    });
    setData(res.data);
  }
  return (
    <Layout>
      <div className="container-app py-8">
        <h1 className="text-xl font-semibold mb-4">Room Occupancy</h1>
        <div className="flex gap-2 mb-4">
          <input
            value={start_date}
            onChange={(e) => setStart(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <input
            value={end_date}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded border px-3 py-2"
          />
          <button onClick={run} className="rounded bg-blue-600 text-white px-4">
            Run
          </button>
        </div>
        <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Layout>
  );
}

export function GuestBillingReport() {
  const [data, setData] = useState<any[]>([]);
  async function run() {
    const res = await apiClient.get(`/reports/guestBilling`);
    setData(res.data);
  }
  return (
    <Layout>
      <div className="container-app py-8">
        <h1 className="text-xl font-semibold mb-4">Guest Billing</h1>
        <button
          onClick={run}
          className="rounded bg-blue-600 text-white px-4 py-2 mb-4"
        >
          Run
        </button>
        <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Layout>
  );
}

export function ServiceUsageReport() {
  const [data, setData] = useState<any[]>([]);
  async function run() {
    const res = await apiClient.get(`/reports/serviceUsage`);
    setData(res.data);
  }
  return (
    <Layout>
      <div className="container-app py-8">
        <h1 className="text-xl font-semibold mb-4">Service Usage</h1>
        <button
          onClick={run}
          className="rounded bg-blue-600 text-white px-4 py-2 mb-4"
        >
          Run
        </button>
        <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </Layout>
  );
}
