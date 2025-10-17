import { Route, Routes, Navigate } from "react-router-dom";
import "./App.css";

import { RequireAuth, RequireRole } from "./features/auth/guards";
import LoginPage from "./features/auth/LoginPage";
import Dashboard from "./routes/Dashboard";
import NewGuest from "./features/guests/NewGuest";
import GuestsList from "./features/guests/GuestsList";
import ViewGuest from "./features/guests/ViewGuest";
import Availability from "./features/rooms/Availability";
import NewReservation from "./features/reservations/NewReservation";
import ReservationsList from "./features/reservations/ReservationsList";
import Usage from "./features/services/Usage";
import { CreateInvoice, AddPayment } from "./features/payments/Billing";
import { InvoiceList } from "./features/payments/InvoiceList";
import {
  RevenueReport,
  OccupancyReport,
  GuestBillingReport,
  ServiceUsageReport,
} from "./features/reports/Reports";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />

      <Route
        path="/guests"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <GuestsList />
          </RequireRole>
        }
      />

      <Route
        path="/guests/new"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <NewGuest />
          </RequireRole>
        }
      />

      <Route
        path="/guests/:id"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <ViewGuest />
          </RequireRole>
        }
      />

      <Route
        path="/rooms/availability"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <Availability />
          </RequireRole>
        }
      />

      <Route
        path="/reservations/new"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <NewReservation />
          </RequireRole>
        }
      />

      <Route
        path="/reservations"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <ReservationsList />
          </RequireRole>
        }
      />

      <Route
        path="/services"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <Usage />
          </RequireRole>
        }
      />

      <Route
        path="/billing/invoice"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <CreateInvoice />
          </RequireRole>
        }
      />

      <Route
        path="/billing/payment"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <AddPayment />
          </RequireRole>
        }
      />

      <Route
        path="/billing/invoices"
        element={
          <RequireRole roles={["Admin", "Manager", "Reception"]}>
            <InvoiceList />
          </RequireRole>
        }
      />

      <Route
        path="/reports/*"
        element={
          <RequireRole roles={["Admin", "Manager"]}>
            <Routes>
              <Route path="revenue" element={<RevenueReport />} />
              <Route path="occupancy" element={<OccupancyReport />} />
              <Route path="guest-billing" element={<GuestBillingReport />} />
              <Route path="service-usage" element={<ServiceUsageReport />} />
            </Routes>
          </RequireRole>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
