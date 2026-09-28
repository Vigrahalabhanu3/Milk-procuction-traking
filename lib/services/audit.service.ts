import { AuditLog } from "../types";
import { initialAuditLogs } from "../mock/audit-logs";
import { getStoredData, setStoredData } from "./storage";

const KEY = "audit_logs";

export async function getAuditLogs(): Promise<AuditLog[]> {
  const logs = getStoredData<AuditLog[]>(KEY, initialAuditLogs);
  return [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export async function createAuditLog(entry: {
  adminName?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue: string;
  newValue: string;
}): Promise<AuditLog> {
  const logs = await getAuditLogs();
  const now = new Date();
  const newLog: AuditLog = {
    id: `aud_${Date.now()}`,
    date: now.toISOString().split("T")[0],
    adminName: entry.adminName || "Admin (Rajendra Prasad)",
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    oldValue: entry.oldValue,
    newValue: entry.newValue,
    timestamp: now.toISOString(),
  };

  const updated = [newLog, ...logs];
  setStoredData(KEY, updated);
  return newLog;
}
