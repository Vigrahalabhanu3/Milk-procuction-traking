"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { BrandMark } from "./brand-mark";
import { cn } from "@/lib/utils";

interface BrandLoaderProps {
  message?: string;
  subMessage?: string;
  fullScreen?: boolean;
  className?: string;
}

export function BrandLoader({
  message = "Loading DairyFlow...",
  subMessage,
  fullScreen = true,
  className,
}: BrandLoaderProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerClasses = fullScreen
    ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAFCF8] p-6"
    : cn("flex flex-col items-center justify-center py-16 px-4 bg-[#FAFCF8]/80 rounded-2xl", className);

  return (
    <div className={containerClasses} role="status" aria-live="polite">
      {/* Brand Mark with subtle pulse and soft ring */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
        animate={
          shouldReduceMotion
            ? { opacity: 1 }
            : {
                opacity: [0.95, 1, 0.95],
                scale: [0.98, 1.03, 0.98],
              }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.3 }
            : {
                duration: 2.2,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
        className="relative flex items-center justify-center mb-5"
      >
        <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-[#0B5D3B]/20 via-[#F4C95D]/20 to-[#3A8F3D]/20 blur-2xl pointer-events-none" />
        <div className="p-2 rounded-full bg-white shadow-xl border-2 border-[#3A8F3D]/30 relative z-10">
          <BrandMark size={96} priority />
        </div>
      </motion.div>

      {/* Brand Text */}
      <div className="flex items-center gap-1.5 mb-2 select-none relative z-10">
        <span className="text-3xl font-black tracking-tight text-[#0B5D3B]">Dairy</span>
        <span className="text-3xl font-black tracking-tight text-[#3A8F3D]">Flow</span>
      </div>

      {/* Message */}
      <p className="text-sm font-semibold text-[#17231D] text-center max-w-xs">{message}</p>
      {subMessage && (
        <p className="text-xs text-[#6B756E] text-center mt-1 max-w-xs">{subMessage}</p>
      )}

      {/* Three pulse dots */}
      <div className="flex items-center gap-2 mt-5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#3A8F3D]"
            animate={
              shouldReduceMotion
                ? {}
                : {
                    scale: [0.8, 1.3, 0.8],
                    opacity: [0.35, 1, 0.35],
                  }
            }
            transition={
              shouldReduceMotion
                ? {}
                : {
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }
            }
          />
        ))}
      </div>
    </div>
  );
}
