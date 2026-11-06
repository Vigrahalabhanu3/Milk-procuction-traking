import type { FieldErrors } from "../api/client";
import { validMonth } from "./monthly-earnings-api";

export type ReportType = "daily" | "farmer" | "earnings" | "quality" | "monthly";
export interface ReportFilters { date_from: string; date_to: string; month: string; farmer: string; shift: string; search: string }
export interface ReportResponse {
  count?: number;
  next?: string | null;
  previous?: string | null;
  results?: Record<string, unknown>[];
  summary?: Record<string, unknown>;
  month?: string;
  currency?: string;
  filters?: Record<string, unknown>;
}

export function isDateReport(type: ReportType) { return type === "daily" || type === "farmer" || type === "quality"; }
const paths: Record<ReportType, string> = {
  daily: "/api/admin/reports/daily-milk/",
  farmer: "/api/admin/reports/farmer-production/",
  earnings: "/api/admin/payments/monthly/",
  quality: "/api/admin/reports/milk-quality/",
  monthly: "/api/admin/reports/monthly-summary/",
};
function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateReportFilters(type: ReportType, filters: ReportFilters): FieldErrors {
  const errors: FieldErrors = {};
  if (isDateReport(type)) {
    if (!validDate(filters.date_from)) errors.date_from = ["Choose a valid start date."];
    if (!validDate(filters.date_to)) errors.date_to = ["Choose a valid end date."];
    if (!errors.date_from && !errors.date_to && filters.date_from > filters.date_to) errors.date_to = ["End date must be on or after start date."];
  } else if (!validMonth(filters.month)) errors.month = ["Choose a valid reporting month."];
  return errors;
}
export function reportPath(type: ReportType, filters: ReportFilters, page = 1, pageSize = 20, csv = false): string {
  const params = new URLSearchParams();
  if (isDateReport(type)) {
    params.set("date_from", filters.date_from); params.set("date_to", filters.date_to);
    if (filters.farmer) params.set("farmer", filters.farmer);
    if (filters.shift) params.set("shift", filters.shift);
    if (filters.search.trim()) params.set("search", filters.search.trim());
  } else params.set("month", filters.month);
  if (csv) params.set("format", "csv");
  else if (type !== "monthly") { params.set("page", String(page)); params.set("page_size", String(Math.min(100, pageSize))); }
  return `${paths[type]}?${params}`;
}

export function reportFieldLabel(key: string): string {
  const labels: Record<string, string> = { id: "ID", farmer: "Farmer database ID", farmer_id: "Farmer ID", name: "Farmer name", farmer_name: "Farmer name", quantity_litres: "Total litres", earnings: "Collection earnings", average_fat: "Average fat (%)", average_snf: "Average SNF (%)", fat: "Fat (%)", snf: "SNF (%)", clr: "CLR", temperature: "Temperature (°C)", is_active: "Account active" };
  return labels[key] ?? key.replaceAll("_", " ").replace(/^./, letter => letter.toUpperCase());
}
export function reportCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return typeof value === "object" ? JSON.stringify(value) : String(value);
}

export const reportColumns: Record<ReportType, string[]> = {
  daily: ["date", "morning_litres", "evening_litres", "quantity_litres", "average_fat", "average_snf", "earnings", "farmers_supplied", "collection_count"],
  farmer: ["farmer_id", "name", "village", "days_supplied", "collection_count", "morning_collections", "evening_collections", "quantity_litres", "average_fat", "average_snf", "earnings"],
  earnings: ["farmer_id", "name", "village", "is_active", "days_supplied", "collection_count", "morning_collections", "evening_collections", "quantity_litres", "earnings"],
  quality: ["id", "collection_date", "farmer_id", "farmer_name", "village", "shift", "quantity_litres", "fat", "snf", "clr", "temperature"],
  monthly: ["metric", "value"],
};
