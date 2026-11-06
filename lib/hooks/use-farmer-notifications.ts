"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";
import { FarmerNotificationsResponse } from "../services/notifications-api";

export function useFarmerNotifications(path = "/api/farmer/notifications/", enabled = true) {
  return useAuthenticatedQuery<FarmerNotificationsResponse>(path, "farmer", {enabled, event: "dairyflow_update_notifications", errorMessage: "Unable to load notifications. Please try again."});
}
