export interface AdminFarmerAccount {
  id: number;
  farmer_id: string;
  name: string;
  village: string;
  is_active: boolean;
  status: "active" | "inactive";
  date_joined: string;
}

export interface FarmerAccountSummary {
  total: number;
  active: number;
  inactive: number;
}

export interface AdminFarmersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AdminFarmerAccount[];
  summary: FarmerAccountSummary;
}

export interface FarmerAccountQuery {
  search?: string;
  status?: "active" | "inactive" | "";
  page?: number;
  pageSize?: number;
}

export function farmerAccountsPath(query: FarmerAccountQuery = {}): string {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("search", query.search.trim());
  if (query.status) params.set("status", query.status);
  params.set("page", String(query.page ?? 1));
  params.set("page_size", String(query.pageSize ?? 20));
  return `/api/admin/farmers/?${params}`;
}
