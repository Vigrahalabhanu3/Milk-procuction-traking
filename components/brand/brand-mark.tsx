"use client";

import React, { useState } from "react";
import Image from "next/image";
import { brandConfig } from "@/lib/config/brand";
import { cn } from "@/lib/utils";

interface BrandMarkProps {
  className?: string;
  size?: number;
  alt?: string;
  priority?: boolean;
}

export function BrandMark({
  className,
  size = 40,
  alt = "DairyFlow Official Logo",
  priority = false,
}: BrandMarkProps) {
  const [errorCount, setErrorCount] = useState(0);

  // Progressive fallback: external url -> local copy -> vector fallback
  const getSource = () => {
    if (errorCount === 0 && brandConfig.logoUrl) {
      return brandConfig.logoUrl;
    }
    if (errorCount === 1) {
      return "/official-logo.png";
    }
    return "/placeholder-logo.svg";
  };

  const src = getSource();

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center shrink-0 select-none rounded-full overflow-hidden bg-white shadow-xs border border-[#3A8F3D]/25 transition-transform",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        onError={() => setErrorCount((prev) => prev + 1)}
        className="w-full h-full object-contain rounded-full p-0.5"
        unoptimized={src.startsWith("http") || src.endsWith(".svg")}
      />
    </div>
  );
}
