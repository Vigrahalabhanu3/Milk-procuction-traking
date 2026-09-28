import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  loadingText?: string;
}

export function buttonVariants({
  variant = "primary",
  size = "md",
  className = "",
}: {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
} = {}) {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A8F3D] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]";

  const variants = {
    primary: "bg-[#0B5D3B] text-white hover:bg-[#07452C] shadow-sm shadow-[#0B5D3B]/20",
    secondary: "bg-[#3A8F3D] text-white hover:bg-[#0B5D3B] shadow-sm shadow-[#3A8F3D]/20",
    outline: "border border-[#DDE8DF] bg-white text-[#17231D] hover:bg-[#FAFCF8] hover:border-[#3A8F3D]",
    ghost: "text-[#17231D] hover:bg-[#0B5D3B]/5",
    danger: "bg-[#D9534F] text-white hover:bg-[#c2423e] shadow-sm shadow-[#D9534F]/20",
    link: "text-[#0B5D3B] hover:underline p-0 h-auto font-normal",
  };

  const sizes = {
    sm: "h-9 px-3 text-xs gap-1.5",
    md: "h-11 px-4 text-sm gap-2",
    lg: "h-12 px-6 text-base gap-2.5",
    icon: "h-10 w-10 p-0",
  };

  return cn(baseStyles, variants[variant], sizes[size], className);
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading = false, loadingText, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
