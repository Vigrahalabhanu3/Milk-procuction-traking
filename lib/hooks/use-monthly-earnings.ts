"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";
import { AdminMonthlyEarnings, FarmerMonthlyEarnings, monthlyEarningsPath, validMonth } from "../services/monthly-earnings-api";
import { UserRole } from "../types";

export function useMonthlyEarnings(role: UserRole, month: string, page = 1, pageSize = 20) {
  return useAuthenticatedQuery<AdminMonthlyEarnings | FarmerMonthlyEarnings>(monthlyEarningsPath(role, month, page, pageSize), role, {enabled: validMonth(month), event: "dairyflow_update_collections", errorMessage: "Unable to load monthly earnings. Please try again."});
}
