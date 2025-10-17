import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import apiClient from "../../api/client";

interface Service {
  serviceID: number;
  serviceType: string;
  unit: string;
  ratePerUnit: number;
}

export default function Usage() {
  const [services] = useState<Service[]>([
    {
      serviceID: 1,
      serviceType: "Spa",
      unit: "per person",
      ratePerUnit: 5000.0,
    },
    {
      serviceID: 2,
      serviceType: "Pool",
      unit: "per person",
      ratePerUnit: 1500.0,
    },
    {
      serviceID: 3,
      serviceType: "Room Service",
      unit: "per request",
      ratePerUnit: 2000.0,
    },
    {
      serviceID: 4,
      serviceType: "Minibar",
      unit: "per item",
      ratePerUnit: 500.0,
    },
    {
      serviceID: 5,
      serviceType: "Laundry",
      unit: "per kg",
      ratePerUnit: 800.0,
    },
    {
      serviceID: 6,
      serviceType: "Airport Shuttle",
      unit: "per person",
      ratePerUnit: 3000.0,
    },
  ]);

  const [form, setForm] = useState({
    booking_id: "",
    service_id: "",
    quantity: "1",
  });

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (form.service_id) {
      const service = services.find(
        (s) => s.serviceID.toString() === form.service_id
      );
      setSelectedService(service || null);
    } else {
      setSelectedService(null);
    }
  }, [form.service_id, services]);

  function updateForm(key: string, value: string) {
    setForm({ ...form, [key]: value });
    setMessage(null);
    setError(null);
  }

  function getServiceIcon(serviceType: string) {
    const icons: { [key: string]: string } = {
      Spa: "🧖‍♀️",
      Pool: "🏊‍♂️",
      "Room Service": "🛎️",
      Minibar: "🍷",
      Laundry: "👕",
      "Airport Shuttle": "🚐",
    };
    return icons[serviceType] || "🔧";
  }

  async function submitServiceUsage() {
    if (!form.booking_id || !form.service_id || !form.quantity) {
      setError("Please fill in all fields");
      return;
    }

    if (parseInt(form.quantity) <= 0) {
      setError("Quantity must be greater than 0");
      return;
    }

    setMessage(null);
    setError(null);
    setIsLoading(true);

    console.log("Attempting to add service usage:", {
      bookingID: Number(form.booking_id),
      serviceID: Number(form.service_id),
      quantity: Number(form.quantity),
    });

    try {
      const response = await apiClient.post("/services/usage", {
        bookingID: Number(form.booking_id),
        serviceID: Number(form.service_id),
        quantity: Number(form.quantity),
      });

      const serviceName = selectedService?.serviceType || "Service";
      const totalCost =
        (selectedService?.ratePerUnit || 0) * parseInt(form.quantity);

      setMessage(
        `✅ ${serviceName} added successfully!\n` +
          `Usage ID: #${response.data.usage_id}\n` +
          `Booking ID: #${form.booking_id}\n` +
          `Quantity: ${form.quantity} ${selectedService?.unit}\n` +
          `Total Cost: Rs. ${totalCost.toLocaleString()}`
      );

      // Reset form
      setForm({ booking_id: "", service_id: "", quantity: "1" });
      setSelectedService(null);
    } catch (err: any) {
      console.error("Service usage error:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to add service usage"
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              🛎️ Hotel Services Management
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Add and manage chargeable services for checked-in guests
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Service Usage Form */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
                  📝 Add Service Usage
                </h2>

                <div className="space-y-6">
                  {/* Booking ID Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      🏨 Booking ID
                    </label>
                    <input
                      type="number"
                      value={form.booking_id}
                      onChange={(e) => updateForm("booking_id", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter booking ID..."
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      💡 For testing: Try booking ID 7 (checked-in guest) or ID
                      8 (booked guest)
                    </p>
                  </div>

                  {/* Service Selection */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      🛎️ Select Service
                    </label>
                    <select
                      value={form.service_id}
                      onChange={(e) => updateForm("service_id", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Choose a service...</option>
                      {services.map((service) => (
                        <option
                          key={service.serviceID}
                          value={service.serviceID}
                        >
                          {getServiceIcon(service.serviceType)}{" "}
                          {service.serviceType} - Rs.{" "}
                          {service.ratePerUnit.toLocaleString()} {service.unit}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      📊 Quantity
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={form.quantity}
                      onChange={(e) => updateForm("quantity", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter quantity..."
                    />
                  </div>

                  {/* Cost Preview */}
                  {selectedService && form.quantity && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                        💰 Cost Preview
                      </h3>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                        <p>
                          <strong>Service:</strong>{" "}
                          {getServiceIcon(selectedService.serviceType)}{" "}
                          {selectedService.serviceType}
                        </p>
                        <p>
                          <strong>Rate:</strong> Rs.{" "}
                          {selectedService.ratePerUnit.toLocaleString()}{" "}
                          {selectedService.unit}
                        </p>
                        <p>
                          <strong>Quantity:</strong> {form.quantity}
                        </p>
                        <div className="border-t border-blue-200 dark:border-blue-700 pt-2 mt-2">
                          <p className="font-semibold">
                            <strong>Total Cost:</strong> Rs.{" "}
                            {(
                              selectedService.ratePerUnit *
                              parseInt(form.quantity || "0")
                            ).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={submitServiceUsage}
                    disabled={
                      isLoading ||
                      !form.booking_id ||
                      !form.service_id ||
                      !form.quantity
                    }
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>✅ Add Service Usage</>
                    )}
                  </button>

                  {/* Messages */}
                  {message && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-green-400">✅</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-green-800 dark:text-green-200 whitespace-pre-line">
                            {message}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <span className="text-red-400">❌</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm text-red-800 dark:text-red-200">
                            {error}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Available Services Display */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center">
                  🛎️ Available Services
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {services.map((service) => (
                    <div
                      key={service.serviceID}
                      className={`border rounded-lg p-4 transition-all duration-200 cursor-pointer hover:shadow-md ${
                        form.service_id === service.serviceID.toString()
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                      onClick={() =>
                        updateForm("service_id", service.serviceID.toString())
                      }
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {getServiceIcon(service.serviceType)}
                          </span>
                          <div>
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {service.serviceType}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {service.unit}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            Rs. {service.ratePerUnit.toLocaleString()}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {service.unit}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Service Info */}
                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                    📊 Service Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="text-slate-600 dark:text-slate-400">
                        Total Services
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {services.length}
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="text-slate-600 dark:text-slate-400">
                        Rate Range
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        Rs. 500 - 5,000
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
