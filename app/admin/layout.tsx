"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If visiting the admin login screen, do not wrap with the protected AppShell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return <AppShell requiredRole="ADMIN">{children}</AppShell>;
}
