import { Announcement } from "../types";
import { initialAnnouncements } from "../mock/announcements";
import { getStoredData, setStoredData } from "./storage";
import { createAuditLog } from "./audit.service";

const KEY = "announcements";

export async function getAnnouncements(): Promise<Announcement[]> {
  const announcements = getStoredData<Announcement[]>(KEY, initialAnnouncements);
  return announcements;
}

export async function getActiveAnnouncements(): Promise<Announcement[]> {
  const all = await getAnnouncements();
  return all.filter((a) => a.status === "Active");
}

export async function createAnnouncement(data: {
  title: string;
  message: string;
  startDate: string;
  endDate: string;
  status?: "Active" | "Draft" | "Expired";
  priority?: "Normal" | "High" | "Urgent";
  author?: string;
}): Promise<Announcement> {
  const announcements = await getAnnouncements();
  const newAnn: Announcement = {
    id: `ann_${Date.now()}`,
    title: data.title,
    message: data.message,
    startDate: data.startDate,
    endDate: data.endDate,
    status: data.status || "Active",
    priority: data.priority || "Normal",
    author: data.author || "Dairy Administration",
  };

  const updated = [newAnn, ...announcements];
  setStoredData(KEY, updated);

  await createAuditLog({
    action: "Published Announcement",
    entity: "Community Broadcast",
    entityId: newAnn.id,
    oldValue: "—",
    newValue: newAnn.title,
  });

  return newAnn;
}

export async function deleteAnnouncement(id: string): Promise<boolean> {
  const announcements = await getAnnouncements();
  const filtered = announcements.filter((a) => a.id !== id);
  setStoredData(KEY, filtered);
  return true;
}
