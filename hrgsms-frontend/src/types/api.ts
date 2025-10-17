export type LoginResponse = {
  access_token: string;
  role: "Admin" | "Manager" | "Reception" | "Staff";
};
export type GuestCreate = {
  first_name: string;
  last_name: string;
  phone: string;
  email?: string | null;
  id_number: string;
};
export type GuestOut = {
  guestID: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  idNumber: string;
};
export type AvailableRoom = {
  room_id: number;
  room_number?: string;
  type?: string;
  rate?: number;
};
export type ReservationCreate = {
  guest_id: number;
  branch_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  num_guests: number;
};
export type ServiceUsageCreate = {
  booking_id: number;
  service_id: number;
  quantity: number;
};
export type InvoiceCreate = {
  booking_id: number;
  policy_id: number;
  discount_code?: string | null;
};
export type PaymentCreate = {
  invoice_id: number;
  amount: number;
  payment_method: "Cash" | "Card" | "Online" | "Other";
};
