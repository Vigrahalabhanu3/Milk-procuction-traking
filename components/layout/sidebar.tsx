"use client";

import React from "react";
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
  TrendingUp,
  FileBarChart2,
  PieChart,
  Megaphone,
  Bell,
  ShieldCheck,
  Settings,
  LogOut,
  Award,
  UserCheck,
} from "lucide-react";

interface SidebarProps {
  role: "FARMER" | "ADMIN";
  className?: string;
  onItemClick?: () => void;
}

export function Sidebar({ role, className, onItemClick }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const farmerNav = [
    { label: "Dashboard", href: "/farmer/dashboard", icon: LayoutDashboard },
    { label: "My Collections", href: "/farmer/collections", icon: Milk },
    { label: "Milk Quality", href: "/farmer/quality", icon: Award },
    { label: "Payments", href: "/farmer/payments", icon: Receipt },
    { label: "Notifications", href: "/farmer/notifications", icon: Bell },
    { label: "Profile", href: "/farmer/profile", icon: UserCheck },
  ];

  const adminNav = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Farmers", href: "/admin/farmers", icon: Users },
    { label: "Milk Collections", href: "/admin/collections", icon: Milk },
    { label: "Payments", href: "/admin/payments", icon: Receipt },
    { label: "Milk Rates", href: "/admin/milk-rates", icon: TrendingUp },
    { label: "Reports", href: "/admin/reports", icon: FileBarChart2 },
    { label: "Analytics", href: "/admin/analytics", icon: PieChart },
    { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ];

  const navItems = role === "ADMIN" ? adminNav : farmerNav;

  return (
    <aside
      className={cn(
        "w-64 bg-[#0B5D3B] text-white flex flex-col justify-between h-full select-none shadow-xl border-r border-[#07452C]",
        className
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="px-6 py-6 border-b border-white/10 flex items-center">
          <Logo size="md" lightText href={role === "ADMIN" ? "/admin/dashboard" : "/farmer/dashboard"} />
        </div>

        {/* Role identifier pill */}
        <div className="px-6 pt-4 pb-2">
          <div className="px-2.5 py-1 rounded-md bg-white/10 text-white/80 text-[11px] font-semibold tracking-wider uppercase inline-flex items-center gap-1.5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F4C95D]" />
            {role === "ADMIN" ? "Admin Portal" : "Farmer Portal"}
          </div>
        </div>

        {/* Navigation items */}
        <nav className="px-3 py-2 space-y-1 overflow-y-auto max-h-[calc(100vh-230px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && item.href !== "/farmer/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={true}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
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
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-9 h-9 rounded-full bg-white/15 border border-white/20 flex items-center justify-center font-bold text-sm text-[#F4C95D] shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "User"}</p>
            <p className="text-[11px] text-white/60 truncate">{user?.email || "Signed In"}</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (onItemClick) onItemClick();
            logout();
          }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4 text-white/70" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
