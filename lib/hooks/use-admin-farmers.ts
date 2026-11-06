"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";
import { AdminFarmersResponse, FarmerAccountQuery, farmerAccountsPath } from "../services/admin-farmers.service";

export function useAdminFarmers(query: FarmerAccountQuery = {}) {
  return useAuthenticatedQuery<AdminFarmersResponse>(farmerAccountsPath(query), "admin", {delay: 250, errorMessage: "Unable to load farmer accounts. Please try again."});
}
