import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

type Guest = {
  guestID: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  idNumber: string;
  fullName?: string;
};

type SearchResponse = {
  guests: Guest[];
  count: number;
};

export default function GuestsList() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  // Load all guests on initial load
  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests(search?: string) {
    try {
      setLoading(true);
      setError(null);

      const params = search ? { q: search } : {};
      const res = await apiClient.get<SearchResponse>("/guests/search", {
        params,
      });

      setGuests(res.data.guests || []);
    } catch (e: any) {
      console.error("Error loading guests:", e);

      // Handle different types of errors
      let errorMessage = "Failed to load guests";

      if (e?.response?.status === 401 || e?.response?.status === 403) {
        errorMessage = "Authentication required. Please log in again.";
      } else if (e?.response?.status === 422) {
        // Handle validation errors
        const detail = e?.response?.data?.detail;
        if (Array.isArray(detail)) {
          errorMessage = `Validation error: ${detail
            .map((err) => err.msg)
            .join(", ")}`;
        } else if (typeof detail === "string") {
          errorMessage = detail;
        } else {
          errorMessage = "Invalid request parameters";
        }
      } else if (e?.response?.data?.detail) {
        if (typeof e.response.data.detail === "string") {
          errorMessage = e.response.data.detail;
        } else {
          errorMessage = "Server error occurred";
        }
      } else if (e?.message) {
        errorMessage = e.message;
      }

      setError(errorMessage);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  }

  // Handle search with debounce
  useEffect(() => {
    if (searchTerm.trim() === "") {
      loadGuests();
      return;
    }

    const timeoutId = setTimeout(() => {
      setSearching(true);
      loadGuests(searchTerm.trim()).finally(() => setSearching(false));
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchTerm(e.target.value);
  }

  function clearSearch() {
    setSearchTerm("");
  }

  return (
    <Layout>
      <div className="container-app py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Guests Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage hotel guest information and profiles
            </p>
          </div>
          <Link
            to="/guests/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Guest
          </Link>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 mb-6">
          <div className="flex gap-3 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search guests by name, phone, email, or ID number..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 pl-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-md"
              >
                Clear
              </button>
            )}
          </div>

          {(searching || loading) && (
            <div className="mt-2 text-sm text-slate-500">
              {searching ? "Searching..." : "Loading..."}
            </div>
          )}
        </div>

        {/* Results Section */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 mb-4">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              {searchTerm ? (
                <>
                  Found {guests.length} guest(s) matching "{searchTerm}"
                </>
              ) : (
                <>Showing {guests.length} guest(s)</>
              )}
            </div>

            {guests.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                {searchTerm ? (
                  <>
                    No guests found matching "{searchTerm}".
                    <br />
                    <button
                      onClick={clearSearch}
                      className="mt-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      Show all guests
                    </button>
                  </>
                ) : (
                  <>
                    No guests found.
                    <br />
                    <Link
                      to="/guests/new"
                      className="mt-2 text-blue-600 hover:text-blue-700 underline"
                    >
                      Add the first guest
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Guest ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          ID Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                      {guests.map((guest) => (
                        <tr
                          key={guest.guestID}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            #{guest.guestID}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                              {guest.firstName} {guest.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {guest.phone}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {guest.email || "—"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                            {guest.idNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-3">
                              <Link
                                to={`/guests/${guest.guestID}`}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                View
                              </Link>
                              <Link
                                to={`/reservations/new?guestId=${guest.guestID}`}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 font-medium flex items-center gap-1"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0m-6 0h6m-6 0a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-6a2 2 0 00-2-2m-6 0h6"
                                  />
                                </svg>
                                Book
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
