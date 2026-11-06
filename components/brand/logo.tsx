"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "./brand-mark";
import { cn } from "@/lib/utils";

export interface LogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "default" | "compact" | "icon";
  className?: string;
  href?: string;
  lightText?: boolean;
  animated?: boolean;
}

const sizeConfig = {
  xs: { markSize: 24, textSize: "text-sm", subSize: "text-[9px]", gap: "gap-1.5" },
  sm: { markSize: 28, textSize: "text-base", subSize: "text-[10px]", gap: "gap-2" },
  md: { markSize: 36, textSize: "text-xl", subSize: "text-xs", gap: "gap-2.5" },
  lg: { markSize: 48, textSize: "text-2xl", subSize: "text-xs", gap: "gap-3" },
  xl: { markSize: 64, textSize: "text-3xl", subSize: "text-sm", gap: "gap-4" },
};

export function Logo({
  size = "md",
  variant = "default",
  className,
  href = "/",
  lightText = false,
  animated = false,
}: LogoProps) {
  const shouldReduceMotion = useReducedMotion();
  const config = sizeConfig[size] || sizeConfig.md;

  const content = (
    <div className={cn("inline-flex items-center", config.gap, !href && className)}>
      <BrandMark size={config.markSize} priority />
      {variant !== "icon" && (
        <div className="flex flex-col leading-none select-none">
          <div className="flex items-center tracking-tight font-bold">
            <span
              className={cn(
                config.textSize,
                "font-extrabold tracking-tight",
                lightText ? "text-white" : "text-[#0B5D3B]"
              )}
            >
              Dairy
            </span>
            <span
              className={cn(
                config.textSize,
                "font-extrabold tracking-tight",
                lightText ? "text-[#F4C95D]" : "text-[#28732C]"
              )}
            >
              Flow
            </span>
          </div>
          {variant === "default" && size !== "sm" && (
            <span
              className={cn(
                config.subSize,
                "font-medium tracking-wide uppercase mt-0.5",
                lightText ? "text-white/70" : "text-[#6B756E]"
              )}
            >
              Milk Management
            </span>
          )}
        </div>
      )}
    </div>
  );

  const wrapped = href ? (
    <Link href={href} aria-label="DairyFlow home" className={cn("inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3A8F3D] rounded-lg", className)}>
      {content}
    </Link>
  ) : (
    content
  );

  if (animated && !shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="inline-flex"
      >
        {wrapped}
      </motion.div>
    );
  }

  return wrapped;
}
