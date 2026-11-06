"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";
import { ReportResponse } from "../services/reports-api";

export function useReportPreview(path: string, enabled: boolean) {
  return useAuthenticatedQuery<ReportResponse>(path, "admin", {enabled, delay: 200, errorMessage: "Unable to load the report. Please try again."});
}
