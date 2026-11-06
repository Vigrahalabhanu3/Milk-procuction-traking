"use client";

import { useAuthenticatedQuery } from "./use-authenticated-query";
import { collectionsPath, CollectionQuery, MilkCollectionsResponse } from "../services/milk-collections-api";
import { UserRole } from "../types";

export function useMilkCollections(role: UserRole, query: CollectionQuery, enabled = true) {
  return useAuthenticatedQuery<MilkCollectionsResponse>(collectionsPath(role, query), role, {enabled, delay: 250, event: "dairyflow_update_collections", errorMessage: "Unable to load milk collections. Please try again."});
}
