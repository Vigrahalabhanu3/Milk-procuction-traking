import type { UserRole } from "../types";

export interface MonthlyTotals {
  days_supplied: number;
  collection_count: number;
  morning_collections: number;
  evening_collections: number;
  quantity_litres: string;
  earnings: string;
}
export interface FarmerMonthlyRow extends MonthlyTotals {
  id: number;
  farmer_id: string;
  name: string;
  village: string;
  is_active: boolean;
}
export interface AdminMonthlyEarnings {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmerMonthlyRow[];
  month: string;
  currency: string;
  summary: MonthlyTotals & { total_farmers: number; farmers_with_collections: number };
}
export interface DailyEarnings {
  date: string;
  quantity_litres: string;
  earnings: string;
  collection_count: number;
  morning_collections: number;
  evening_collections: number;
}
export interface FarmerMonthlyEarnings {
  month: string;
  currency: string;
  farmer: { id: number; farmer_id: string; name: string; village: string };
  summary: MonthlyTotals;
  daily_breakdown: DailyEarnings[];
}

export function validMonth(month: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
}
export function monthlyEarningsPath(role: UserRole, month: string, page = 1, pageSize = 20) {
  const params = new URLSearchParams({ month });
  if (role === "admin") { params.set("page", String(page)); params.set("page_size", String(pageSize)); }
  return `/api/${role}/payments/monthly/?${params}`;
}
