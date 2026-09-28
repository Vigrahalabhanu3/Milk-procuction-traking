import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-[#DDE8DF]/50", className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      <div className="flex items-center gap-4 py-2 border-b border-[#DDE8DF]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 py-3.5 border-b border-[#DDE8DF]/40">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#DDE8DF] p-3.5 sm:p-5 space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-3 w-16 sm:w-24" />
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl" />
          </div>
          <Skeleton className="h-6 sm:h-7 w-20 sm:w-32" />
          <Skeleton className="h-2.5 sm:h-3 w-14 sm:w-20" />
        </div>
      ))}
    </div>
  );
}

export function MobileCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="divide-y divide-[#DDE8DF]/60">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 space-y-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
          <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-[#FAFCF8] border border-[#DDE8DF]/50">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="h-9 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function ResponsiveListSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div>
      <div className="hidden md:block">
        <TableSkeleton rows={rows} cols={cols} />
      </div>
      <div className="md:hidden">
        <MobileCardsSkeleton count={rows > 4 ? 4 : rows} />
      </div>
    </div>
  );
}
