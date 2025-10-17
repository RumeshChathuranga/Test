import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import apiClient from "../../api/client";
import Layout from "../../components/Layout";

const Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").regex(/^\+94\d{9}$/, "Phone must be in format +94xxxxxxxxx"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
});
type FormValues = z.infer<typeof Schema>;

export default function NewGuest() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({ resolver: zodResolver(Schema) });
  const [result, setResult] = useState<string | null>(null);

  async function onSubmit(values: FormValues) {
    setResult(null);
    try {
      const res = await apiClient.post("/guests/", values);
      setResult(`Guest created successfully with ID ${res.data.guest_id}`);
      reset();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || "Failed to create guest";
      setResult(`Error: ${errorMessage}`);
    }
  }

  return (
    <Layout>
      <div className="container-app max-w-xl py-8">
        <h1 className="text-xl font-semibold mb-4">New Guest</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              First Name *
            </label>
            <input
              {...register("firstName")}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Last Name *
            </label>
            <input
              {...register("lastName")}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Phone *
            </label>
            <input
              {...register("phone")}
              type="tel"
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
              placeholder="+94771234567"
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
              placeholder="guest@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              ID Number *
            </label>
            <input
              {...register("idNumber")}
              className="mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
              placeholder="Enter ID/Passport number"
            />
            {errors.idNumber && (
              <p className="text-sm text-red-600 mt-1">
                {errors.idNumber.message}
              </p>
            )}
          </div>

          {result && (
            <div className={`p-3 rounded-md ${result.startsWith('Error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
            }`}>
              {result}
            </div>
          )}
          <button
            disabled={isSubmitting}
            className="rounded bg-blue-600 text-white px-4 py-2"
          >
            {isSubmitting ? "Saving…" : "Create Guest"}
          </button>
        </form>
      </div>
    </Layout>
  );
}
