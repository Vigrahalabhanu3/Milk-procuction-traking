import type { FieldErrors } from "../api/client";
import type { UserRole } from "../types";

export interface MilkCollectionRecord {
  id: number | string;
  farmer: number;
  farmer_name: string;
  farmer_id: string;
  village: string;
  created_at: string;
  collection_date: string;
  shift: "morning" | "evening";
  quantity_litres: string;
  rate_per_litre: string;
  amount: string;
  fat?: string | null;
  snf?: string | null;
  clr?: string | null;
  temperature?: string | null;
  notes?: string;
}

export interface MilkCollectionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MilkCollectionRecord[];
  summary: { quantity_litres: string; amount: string };
}

export interface CollectionQuery {
  date?: string;
  date_from?: string;
  date_to?: string;
  shift?: string;
  search?: string;
  farmer?: string;
  page?: number;
  page_size?: number;
}

export function collectionsPath(role: UserRole, query: CollectionQuery = {}): string {
  const params = new URLSearchParams();
  if (query.date) params.set("date", query.date);
  else {
    if (query.date_from) params.set("date_from", query.date_from);
    if (query.date_to) params.set("date_to", query.date_to);
  }
  if (query.shift) params.set("shift", query.shift.toLowerCase());
  if (role === "admin") {
    if (query.search?.trim()) params.set("search", query.search.trim());
    if (query.farmer) params.set("farmer", query.farmer);
  }
  params.set("page", String(query.page ?? 1));
  params.set("page_size", String(query.page_size ?? 10));
  return `/api/${role}/milk-collections/?${params}`;
}

export interface CollectionForm {
  date: string; shift: string; quantity: string; rate: string;
  fat: string; snf: string; clr: string; temperature: string; notes: string;
}

export function collectionPayload(form: CollectionForm, farmer: number | "") {
  return {
    farmer,
    collection_date: form.date,
    shift: form.shift.toLowerCase(),
    quantity_litres: form.quantity.trim(),
    rate_per_litre: form.rate.trim(),
    fat: form.fat.trim() || null,
    snf: form.snf.trim() || null,
    clr: form.clr.trim() || null,
    temperature: form.temperature.trim() || null,
    notes: form.notes,
  };
}

export function validateCollection(form: CollectionForm, farmer: number | ""): FieldErrors {
  const errors: FieldErrors = {};
  if (!Number.isInteger(farmer) || Number(farmer) <= 0) errors.farmer = ["Select a farmer."];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) errors.collection_date = ["Choose a collection date."];
  if (!["morning", "evening"].includes(form.shift.toLowerCase())) errors.shift = ["Select a shift."];
  if (!form.quantity.trim() || !Number.isFinite(Number(form.quantity)) || Number(form.quantity) <= 0) errors.quantity_litres = ["Enter a quantity greater than zero."];
  if (!form.rate.trim() || !Number.isFinite(Number(form.rate)) || Number(form.rate) < 0) errors.rate_per_litre = ["Enter a valid rate of zero or more."];
  for (const field of ["fat", "snf", "clr", "temperature"] as const) {
    if (form[field].trim() && !Number.isFinite(Number(form[field]))) errors[field] = ["Enter a valid reading."];
  }
  return errors;
}
