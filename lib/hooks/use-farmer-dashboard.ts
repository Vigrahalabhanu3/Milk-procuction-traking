"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";
import { FarmerDashboardResponse, DashboardRange } from "../services/farmer-dashboard-api";

export function useFarmerDashboard(range: DashboardRange) {
  return useAuthenticatedQuery<FarmerDashboardResponse>(`/api/farmer/dashboard/?range=${range}`, "farmer", {event: "dairyflow_update_collections", errorMessage: "Unable to load your dashboard. Please try again."});
}
