"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";

export interface FarmerOption {
  id: number;
  farmer_id: string;
  name: string;
  village: string;
}

interface FarmerOptionsResponse {
  count: number;
  results: FarmerOption[];
}

export function useFarmerOptions() {
  const query = useAuthenticatedQuery<FarmerOptionsResponse>("/api/admin/farmers/options/", "admin", {errorMessage: "Unable to load farmers. Please try again."});
  return {farmers: query.data?.results ?? [], count: query.data?.count ?? 0, error: query.error ?? "", isLoading: query.isLoading, reload: query.reload};
}
