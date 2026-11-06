"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Bell, User, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { useFarmerNotifications } from "@/lib/hooks/use-farmer-notifications";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Logo } from "@/components/brand/logo";
import { BrandMark } from "@/components/brand/brand-mark";
import { LanguageSelector } from "@/components/ui/language-selector";

interface TopbarProps {
  onOpenMobileNav: () => void;
  role: "farmer" | "admin";
}

export function Topbar({ onOpenMobileNav, role }: TopbarProps) {
  const { user } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const notificationId = useId();
  const notificationRef = useRef<HTMLDivElement>(null);
  const notificationButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!showDropdown) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !notificationRef.current?.contains(event.target)) setShowDropdown(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setShowDropdown(false); notificationButton.current?.focus(); }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [showDropdown]);
  const notificationsQuery = useFarmerNotifications("/api/farmer/notifications/", role === "farmer" && showDropdown);
  const notifications = notificationsQuery.data?.results.slice(0, 5) ?? [];

  const notifLink = role === "admin" ? "/admin/notifications" : "/farmer/notifications";
  const profileLink = role === "admin" ? "/admin/dashboard" : "/farmer/profile";

  return (
    <header className="h-16 bg-white border-b border-[#DDE8DF] px-2.5 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      {/* Left: Mobile hamburger (Admin only, Farmers use bottom nav) + Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        {role === "admin" && (
          <button
            onClick={onOpenMobileNav}
            className="lg:hidden p-2 rounded-xl text-[#17231D] hover:bg-[#0B5D3B]/5 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-[#0B5D3B]" />
          </button>
        )}

        {/* Mobile Header Logo - xs on compact phones, sm on tablets */}
        <div className="lg:hidden flex items-center">
          <Logo size="xs" href={role === "admin" ? "/admin/dashboard" : "/farmer/dashboard"} className="sm:hidden" />
          <Logo size="sm" href={role === "admin" ? "/admin/dashboard" : "/farmer/dashboard"} className="hidden sm:inline-flex" />
        </div>

        {/* Desktop Header Facility Indicator with Official Logo */}
        <div className="hidden lg:flex items-center gap-2.5 text-xs font-semibold text-[#6B756E]">
          <BrandMark size={24} priority />
          <div className="flex items-center gap-2">
            <span className="text-[#17231D] font-bold">DairyFlow</span>
            <span aria-hidden="true" className="text-[#6B756E]">•</span>
            <span className="inline-flex items-center gap-1.5 text-[#256B2A]">
              <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[#256B2A] motion-safe:animate-pulse" />
              Live Operations Active
            </span>
          </div>
        </div>
      </div>

      {/* Right: Language Selector, Notification center and user profile */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <LanguageSelector variant="circle" />
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button
            ref={notificationButton}
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative p-2 rounded-xl text-[#17231D] hover:bg-[#0B5D3B]/5 transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Notifications"
            aria-expanded={showDropdown}
            aria-controls={showDropdown ? notificationId : undefined}
          >
            <Bell className="w-5 h-5 text-[#6B756E]" />

          </button>

          {/* Quick Notification Dropdown - Responsive Full Mobile Width Safe */}
          {showDropdown && (
            <div id={notificationId} role="region" aria-label="Recent notifications" className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-auto sm:mt-2 w-[calc(100vw-16px)] sm:w-80 max-w-sm bg-white rounded-2xl border border-[#DDE8DF] shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DDE8DF]">
                <h4 className="text-xs font-bold text-[#17231D] uppercase tracking-wider">Notifications</h4>
                <Link
                  href={notifLink}
                  prefetch={true}
                  onClick={() => setShowDropdown(false)}
                  className="text-xs text-[#0B5D3B] hover:underline font-semibold flex items-center gap-1"
                >
                  View All <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {role === "admin" ? (
                  <p className="py-4 text-center text-xs text-[#6B756E]">Open the dispatch center to send farmer notifications.</p>
                ) : notificationsQuery.isLoading ? (
                  <div className="flex justify-center py-4"><LoadingSpinner label="Loading notifications..." showLabel /></div>
                ) : notificationsQuery.error ? (
                  <div role="alert" className="space-y-2 p-2 text-xs text-[#D9534F]"><p>{notificationsQuery.error}</p><button type="button" className="font-semibold underline" onClick={notificationsQuery.reload}>Retry</button></div>
                ) : notifications.length === 0 ? (
                  <p className="text-xs text-[#6B756E] text-center py-4">No recent notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-2.5 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/60 text-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#17231D] truncate">{n.title}</span>
                      </div>
                      <p className="text-[#6B756E] line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill / Profile */}
        <Link
          href={profileLink}
          aria-label={role === "admin" ? "Admin dashboard" : "Your profile"}
          prefetch={true}
          className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 sm:pl-2.5 rounded-xl hover:bg-[#0B5D3B]/5 border border-transparent hover:border-[#DDE8DF] transition-all group min-h-[40px]"
        >
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#17231D] leading-tight group-hover:text-[#0B5D3B] transition-colors">
              {user?.name || (role === "admin" ? "Admin" : "Farmer")}
            </p>
            <p className="text-[10px] font-semibold text-[#6B756E] uppercase tracking-wider">
              {user?.farmer_id || (role === "admin" ? "Supervisor" : "Member")}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#0B5D3B]/10 border border-[#0B5D3B]/20 flex items-center justify-center text-[#0B5D3B] font-bold text-xs">
            <User className="w-4 h-4 text-[#0B5D3B]" />
          </div>
        </Link>
      </div>
    </header>
  );
}
