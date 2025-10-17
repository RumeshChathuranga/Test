import { type PropsWithChildren } from "react";
import { Link } from "react-router-dom";
import { getRole, clearAuth } from "../lib/storage";
import ThemeToggle from "./ThemeToggle";

export default function Layout({ children }: PropsWithChildren) {
  const role = getRole();
  function onLogout() {
    clearAuth();
    if (typeof window !== "undefined") window.location.href = "/login";
  }
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[240px_1fr]">
      <aside className="hidden lg:block border-r border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
        <div className="text-lg font-semibold mb-6">HRGSMS</div>
        <nav className="space-y-2 text-sm">
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/"
          >
            Dashboard
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/guests"
          >
            Guests
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/guests/new"
          >
            New Guest
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/rooms/availability"
          >
            Room Availability
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/reservations"
          >
            View Reservations
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/reservations/new"
          >
            New Reservation
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/services"
          >
            Service Usage
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/billing/invoice"
          >
            Create Invoice
          </Link>
          <Link
            className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
            to="/billing/payment"
          >
            Add Payment
          </Link>
          {(role === "Admin" || role === "Manager") && (
            <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-xs uppercase text-slate-500 mb-1">
                Reports
              </div>
              <Link
                className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                to="/reports/revenue"
              >
                Revenue
              </Link>
              <Link
                className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                to="/reports/occupancy"
              >
                Occupancy
              </Link>
              <Link
                className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                to="/reports/guest-billing"
              >
                Guest Billing
              </Link>
              <Link
                className="block px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                to="/reports/service-usage"
              >
                Service Usage
              </Link>
            </div>
          )}
        </nav>
      </aside>
      <main>
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-4 py-3 gap-3">
          <div className="lg:hidden font-semibold">HRGSMS</div>
          <div className="flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <div className="text-sm text-slate-600 dark:text-slate-300">
              Role: {role ?? "—"}
            </div>
            <button
              onClick={onLogout}
              className="text-sm px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            >
              Logout
            </button>
          </div>
        </header>
        <div className="p-4">{children}</div>
      </main>
    </div>
  );
}
