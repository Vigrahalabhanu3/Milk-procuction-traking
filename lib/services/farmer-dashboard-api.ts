import type { MilkCollectionRecord } from "./milk-collections-api";

export type DashboardRange = "7d" | "30d" | "3m";
export interface ProductionPoint {
  date: string;
  quantity_litres: string;
  earnings: string;
  morning_litres: string;
  evening_litres: string;
}
export interface FarmerDashboardResponse {
  date: string;
  timezone: string;
  currency: string;
  farmer: { id: number; name: string; farmer_id: string; village: string; chilling_center: string | null };
  today: {
    quantity_litres: string; morning_litres: string; evening_litres: string; earnings: string;
    collection_count: number; morning_time: string | null; evening_time: string | null;
  };
  payments: { pending_amount: string | null; next_disbursement_date: string | null; status: string };
  production: {
    range: DashboardRange; date_from: string; date_to: string;
    quantity_litres: string; earnings: string; days_supplied: number;
    trend: ProductionPoint[]; average_daily_yield_litres: string; average_fat: string | null;
    base_union_rate: string | null;
  };
  recent_collections: MilkCollectionRecord[];
}

// API dates are calendar dates, so formatting must not move them to the previous day.
export function productionDateLabel(value: string, range: DashboardRange, full = false): string {
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    timeZone: "UTC", month: "short",
    day: range === "3m" && value.length === 7 ? undefined : "numeric",
    year: full ? "numeric" : undefined,
  });
}
