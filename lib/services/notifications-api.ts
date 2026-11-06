export interface FarmerNotification {
  id: number;
  audience: "all" | "specific";
  farmer: number | null;
  title: string;
  message: string;
  category: string;
  created_at: string;
}

export interface FarmerNotificationsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FarmerNotification[];
}

export interface DispatchNotification {
  audience: "all" | "specific";
  farmer?: number;
  title: string;
  message: string;
  category: "general" | "milk_collection";
}

// Use only the documented endpoint even when following backend pagination links.
export function notificationPagePath(link: string | null): string | null {
  if (!link) return null;
  try {
    const url = new URL(link, "http://pagination.local");
    return url.pathname === "/api/farmer/notifications/" ? `${url.pathname}${url.search}` : null;
  } catch { return null; }
}
