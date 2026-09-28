import { UserRole } from "../types";

export interface RolePermissions {
  canManageFarmers: boolean;
  canAddCollection: boolean;
  canEditCollection: boolean;
  canDeleteCollection: boolean;
  canManagePayments: boolean;
  canManageMilkRates: boolean;
  canViewReports: boolean;
  canViewAnalytics: boolean;
  canCreateAnnouncements: boolean;
  canSendNotifications: boolean;
  canViewAuditLogs: boolean;
  canManageSettings: boolean;
  canEditOwnProfile: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  ADMIN: {
    canManageFarmers: true,
    canAddCollection: true,
    canEditCollection: true,
    canDeleteCollection: true,
    canManagePayments: true,
    canManageMilkRates: true,
    canViewReports: true,
    canViewAnalytics: true,
    canCreateAnnouncements: true,
    canSendNotifications: true,
    canViewAuditLogs: true,
    canManageSettings: true,
    canEditOwnProfile: true,
  },
  FARMER: {
    canManageFarmers: false,
    canAddCollection: false,
    canEditCollection: false,
    canDeleteCollection: false,
    canManagePayments: false,
    canManageMilkRates: false,
    canViewReports: false,
    canViewAnalytics: false,
    canCreateAnnouncements: false,
    canSendNotifications: false,
    canViewAuditLogs: false,
    canManageSettings: false,
    canEditOwnProfile: true,
  },
};

export function hasPermission(role: UserRole, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[role]?.[permission] ?? false;
}
