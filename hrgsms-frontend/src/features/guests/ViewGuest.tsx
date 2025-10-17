import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

type Guest = {
  guestID: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  idNumber: string;
};

export default function ViewGuest() {
  const { id } = useParams();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get(`/guests/${id}`);
        setGuest(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to load guest");
      }
    }
    if (id) load();
  }, [id]);

  return (
    <Layout>
      <div className="container-app py-8">
        <h1 className="text-xl font-semibold mb-4">Guest Details</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}
        {!guest ? (
          <div className="text-slate-500">Loading…</div>
        ) : (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900 max-w-lg">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">ID</div>
              <div>{guest.guestID}</div>
              <div className="text-slate-500">Name</div>
              <div>
                {guest.firstName} {guest.lastName}
              </div>
              <div className="text-slate-500">Phone</div>
              <div>{guest.phone}</div>
              <div className="text-slate-500">Email</div>
              <div>{guest.email ?? "—"}</div>
              <div className="text-slate-500">ID Number</div>
              <div>{guest.idNumber}</div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
