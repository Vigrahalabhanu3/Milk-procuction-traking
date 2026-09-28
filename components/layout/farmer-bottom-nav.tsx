"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Milk, Award, Receipt, UserCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/language-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function FarmerBottomNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      label: t.farmerNav?.dashboard || "Dashboard",
      href: "/farmer/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: t.farmerNav?.collections || "Collections",
      href: "/farmer/collections",
      icon: Milk,
    },
    {
      label: t.farmerNav?.quality || "Quality",
      href: "/farmer/quality",
      icon: Award,
    },
    {
      label: t.farmerNav?.payments || "Payments",
      href: "/farmer/payments",
      icon: Receipt,
    },
    {
      label: t.farmerNav?.profile || "Profile",
      href: "/farmer/profile",
      icon: UserCheck,
    },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#DDE8DF] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1 pb-[max(env(safe-area-inset-bottom),0.5rem)] select-none"
      aria-label="Farmer Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/farmer/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl min-h-[50px] transition-all group active:scale-95",
                isActive ? "text-[#0B5D3B]" : "text-[#6B756E] hover:text-[#17231D]"
              )}
            >
              {/* Icon Container with Active Highlight */}
              <div
                className={cn(
                  "relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200",
                  isActive
                    ? "bg-[#0B5D3B] text-white shadow-xs"
                    : "text-[#6B756E] group-hover:bg-[#0B5D3B]/5"
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isActive ? "scale-110 text-white" : "text-[#6B756E]"
                  )}
                />
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] tracking-tight mt-0.5 font-bold truncate max-w-[64px] text-center",
                  isActive ? "text-[#0B5D3B] font-extrabold" : "text-[#6B756E]"
                )}
              >
                {item.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <motion.div
                  layoutId="farmerBottomNavIndicator"
                  className="w-1 h-1 rounded-full bg-[#3A8F3D] mt-0.5"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
