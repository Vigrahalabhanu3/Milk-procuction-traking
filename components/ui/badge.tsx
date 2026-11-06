import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "outline";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "sm", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-[#0B5D3B]/10 text-[#0B5D3B] border-[#0B5D3B]/20",
    success: "bg-[#3A8F3D]/10 text-[#3A8F3D] border-[#3A8F3D]/20",
    warning: "bg-[#F4C95D]/20 text-[#B47805] border-[#F4C95D]/40",
    danger: "bg-[#D9534F]/10 text-[#D9534F] border-[#D9534F]/20",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    outline: "bg-transparent text-[#6B756E] border-[#DDE8DF]",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border tracking-wide uppercase font-medium select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toUpperCase();
  if (s === "PAID" || s === "ACTIVE" || s === "PASSED") {
    return <Badge variant="success">{status}</Badge>;
  }
  if (s === "PENDING" || s === "UPCOMING" || s === "WARNING") {
    return <Badge variant="warning">{status}</Badge>;
  }
  if (s === "PROCESSING") {
    return <Badge variant="info">{status}</Badge>;
  }
  if (s === "INACTIVE" || s === "REJECTED" || s === "EXPIRED") {
    return <Badge variant="danger">{status}</Badge>;
  }
  return <Badge variant="default">{status}</Badge>;
}
