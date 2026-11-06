"use client";

import React, { useId } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Milk,
  Receipt,
  FileBarChart2,
  Bell,
  LogOut,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardPlus,
} from "lucide-react";

interface SidebarProps {
  role: "farmer" | "admin";
  className?: string;
  onItemClick?: () => void;
  collapsed?: boolean;
  onToggle?: () => void;
  toggleLabel?: string;
}

export function Sidebar({ role, className, onItemClick, collapsed = false, onToggle, toggleLabel }: SidebarProps) {
  const pathname = usePathname();
  const navigationId = useId();
  const { logout, user } = useAuth();

  const farmerNav = [
    { label: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "My Collections", href: "/farmer/collections", icon: Milk },
    { label: "Monthly Earnings", href: "/farmer/payments", icon: Receipt },
    { label: "Notifications", href: "/farmer/notifications", icon: Bell },
    { label: "Profile", href: "/farmer/profile", icon: UserCheck },
  ];

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Farmers", href: "/admin/farmers", icon: Users },
    { label: "Register Farmer", href: "/admin/register-farmer", icon: UserCheck },
    { label: "Milk Collections", href: "/admin/collections", icon: Milk },
    { label: "Add Milk Collection", href: "/admin/add-collection", icon: ClipboardPlus },
    { label: "Monthly Earnings", href: "/admin/payments", icon: Receipt },
    { label: "Reports", href: "/admin/reports", icon: FileBarChart2 },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
  ];

  const navItems = role === "admin" ? adminNav : farmerNav;

  return (
    <aside
      className={cn(
        "bg-[#0B5D3B] text-white flex flex-col h-full select-none shadow-xl border-r border-[#07452C] transition-[width] duration-200 motion-reduce:transition-none",
        collapsed ? "w-20" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-white/10">
          {onToggle && <div className={cn("flex px-3 pt-3", collapsed ? "justify-center" : "justify-end")}>
            <button type="button" onClick={onToggle}
              aria-label={toggleLabel || (collapsed ? "Expand sidebar" : "Collapse sidebar")}
              title={toggleLabel || (collapsed ? "Expand sidebar" : "Collapse sidebar")}
              aria-expanded={!collapsed} aria-controls={navigationId}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>}
          <div className={cn("flex py-4", collapsed ? "justify-center px-2" : "px-6")}>
            <Logo size="md" variant={collapsed ? "icon" : "default"} lightText href={role === "admin" ? "/admin/dashboard" : "/farmer/dashboard"} />
          </div>
        </div>

        {/* Role identifier pill */}
        {!collapsed && <div className="shrink-0 px-6 pt-4 pb-2">
          <div className="px-2.5 py-1 rounded-md bg-white/10 text-white/80 text-[11px] font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4C95D]" />
            {role === "admin" ? "Admin Portal" : "Farmer Portal"}
          </div>
        </div>}

        {/* Navigation items */}
        <nav id={navigationId} aria-label={`${role === "admin" ? "Admin" : "Farmer"} navigation`} className="min-h-0 flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/farmer/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onItemClick}
                title={collapsed ? item.label : undefined}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  collapsed ? "justify-center px-2" : "px-3.5",
                  isActive
                    ? "bg-[#3A8F3D] text-white shadow-xs font-semibold"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-white" : "text-white/70"
                  )}
                />
                <span className={collapsed ? "sr-only" : undefined}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className={cn("shrink-0 border-t border-white/10", collapsed ? "p-3" : "p-4")}>
        <div className={cn("flex items-center gap-3 py-2 mb-2", collapsed ? "justify-center" : "px-2")}>
          <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center font-bold text-sm text-[#F4C95D] shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className={collapsed ? "sr-only" : "flex-1 min-w-0"}>
            <p className="text-xs font-semibold text-white truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-white/60 truncate">{user?.email || "Signed In"}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onItemClick) onItemClick();
            logout();
          }}
          title={collapsed ? "Sign Out" : undefined}
          className={cn("w-full flex items-center gap-2.5 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors", collapsed ? "justify-center px-2" : "px-3")}
        >
          <LogOut className="w-4 h-4 text-white/70" />
          <span className={collapsed ? "sr-only" : undefined}>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
