import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ label = "Loading...", className, showLabel = false }: {
  label?: string;
  className?: string;
  showLabel?: boolean;
}) {
  return <span role="status" className={cn("inline-flex items-center gap-2 text-sm font-medium text-[#0B5D3B]", className)}>
    <Loader2 aria-hidden="true" className="h-5 w-5 shrink-0 animate-spin motion-reduce:animate-none" />
    <span className={showLabel ? undefined : "sr-only"}>{label}</span>
  </span>;
}

export function DataLoader({ label = "Loading data...", className }: { label?: string; className?: string }) {
  return <div className={cn("flex min-h-56 items-center justify-center p-6", className)}>
    <LoadingSpinner label={label} showLabel />
  </div>;
}
