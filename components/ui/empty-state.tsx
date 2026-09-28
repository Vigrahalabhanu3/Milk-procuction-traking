import React from "react";
import { BrandMark } from "@/components/brand/brand-mark";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ElementType;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionText,
  onAction,
  icon: Icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 rounded-2xl border border-dashed border-[#DDE8DF] bg-white/60",
        className
      )}
    >
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0B5D3B]/5 border border-[#DDE8DF] flex items-center justify-center">
          {Icon ? <Icon className="w-8 h-8 text-[#3A8F3D]" /> : <BrandMark size={36} />}
        </div>
      </div>

      <h4 className="text-base sm:text-lg font-bold text-[#17231D] mb-1">{title}</h4>
      <p className="text-xs sm:text-sm text-[#6B756E] max-w-sm mb-5">{description}</p>

      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
