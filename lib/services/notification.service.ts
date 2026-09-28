import { AppNotification } from "../types";
import { initialNotifications } from "../mock/notifications";
import { getStoredData, setStoredData } from "./storage";

const KEY = "notifications";

export async function getNotifications(params?: {
  role?: "FARMER" | "ADMIN";
  farmerId?: string;
}): Promise<AppNotification[]> {
  const notifications = getStoredData<AppNotification[]>(KEY, initialNotifications);

  return notifications
    .filter((n) => {
      if (!params) return true;
      if (params.role === "ADMIN") {
        return n.targetRole === "ADMIN" || n.targetRole === "ALL";
      }
      if (params.role === "FARMER") {
        if (n.targetRole === "ALL") return true;
        if (n.targetRole === "FARMER") {
          if (!n.targetFarmerId) return true;
          return params.farmerId ? n.targetFarmerId.toLowerCase() === params.farmerId.toLowerCase() : true;
        }
        return false;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  const notifications = getStoredData<AppNotification[]>(KEY, initialNotifications);
  const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
  setStoredData(KEY, updated);
  return true;
}

export async function markAllNotificationsAsRead(params?: {
  role?: "FARMER" | "ADMIN";
  farmerId?: string;
}): Promise<boolean> {
  const notifications = getStoredData<AppNotification[]>(KEY, initialNotifications);
  const updated = notifications.map((n) => {
    if (params?.role === "ADMIN" && (n.targetRole === "ADMIN" || n.targetRole === "ALL")) {
      return { ...n, isRead: true };
    }
    if (params?.role === "FARMER") {
      if (n.targetRole === "ALL" || (n.targetRole === "FARMER" && (!n.targetFarmerId || n.targetFarmerId === params.farmerId))) {
        return { ...n, isRead: true };
      }
    }
    return n;
  });
  setStoredData(KEY, updated);
  return true;
}

export async function createNotification(data: {
  title: string;
  message: string;
  targetRole?: "FARMER" | "ADMIN" | "ALL";
  targetFarmerId?: string;
  type?: "collection" | "payment" | "quality" | "announcement" | "system";
}): Promise<AppNotification> {
  const notifications = getStoredData<AppNotification[]>(KEY, initialNotifications);
  const newNotif: AppNotification = {
    id: `notif_${Date.now()}`,
    title: data.title,
    message: data.message,
    targetRole: data.targetRole || "FARMER",
    targetFarmerId: data.targetFarmerId,
    isRead: false,
    createdAt: new Date().toISOString(),
    type: data.type || "system",
  };

  const updated = [newNotif, ...notifications];
  setStoredData(KEY, updated);
  return newNotif;
}
