"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { MobileNav } from "./mobile-nav";
import { FarmerBottomNav } from "./farmer-bottom-nav";
import { useAuth } from "@/lib/auth/auth-context";
import { BrandLoader } from "@/components/brand/brand-loader";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  requiredRole: "FARMER" | "ADMIN";
}

export function AppShell({ children, requiredRole }: AppShellProps) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login
        router.replace(requiredRole === "ADMIN" ? "/admin/login" : "/login");
      } else if (role !== requiredRole) {
        // Enforce role separation
        if (role === "ADMIN") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/farmer/dashboard");
        }
      }
    }
  }, [user, role, isLoading, requiredRole, router]);

  if (isLoading || !user || role !== requiredRole) {
    return <BrandLoader message="Authenticating DairyFlow session..." fullScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFCF8]">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar role={requiredRole} />
      </div>

      {/* Mobile Drawer (Admin only) */}
      {requiredRole === "ADMIN" && (
        <MobileNav
          isOpen={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          role={requiredRole}
        />
      )}

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden overflow-y-hidden">
        <Topbar role={requiredRole} onOpenMobileNav={() => setMobileNavOpen(true)} />
        <main
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8",
            requiredRole === "FARMER" ? "pb-24 lg:pb-8" : "pb-12 lg:pb-8"
          )}
        >
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>

      {/* Farmer Mobile Bottom Navigation Bar */}
      {requiredRole === "FARMER" && <FarmerBottomNav />}
    </div>
  );
}
