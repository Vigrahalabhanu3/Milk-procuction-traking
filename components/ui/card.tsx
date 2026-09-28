import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-[#DDE8DF] p-5 shadow-xs transition-all duration-200",
        hover && "hover:shadow-md hover:border-[#3A8F3D]/40 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-between gap-4 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn("font-bold text-lg text-[#17231D] tracking-tight", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-xs text-[#6B756E] mt-0.5", className)} {...props}>
      {children}
    </p>
  );
}

export function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  subvalue?: string;
  icon?: React.ElementType;
  trend?: { value: string; positive: boolean };
  className?: string;
}) {
  return (
    <Card hover className={cn("p-3.5 sm:p-5 flex flex-col justify-between", className)}>
      <div className="flex items-start justify-between gap-1">
        <span className="text-[11px] sm:text-xs font-semibold text-[#6B756E] uppercase tracking-wider truncate">{title}</span>
        {Icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#0B5D3B]/10 text-[#0B5D3B] flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#3A8F3D]" />
          </div>
        )}
      </div>

      <div className="mt-2.5 sm:mt-4">
        <div className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#17231D] tracking-tight">{value}</div>
        {(subvalue || trend) && (
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 text-[11px] sm:text-xs text-[#6B756E]">
            {trend && (
              <span className={cn("font-semibold", trend.positive ? "text-[#3A8F3D]" : "text-[#D9534F]")}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </span>
            )}
            {subvalue && <span className="truncate">{subvalue}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
