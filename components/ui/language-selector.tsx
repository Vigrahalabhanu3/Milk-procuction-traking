"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/language-context";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface LanguageSelectorProps {
  className?: string;
  variant?: "circle" | "compact" | "pill" | "dropdown";
  dark?: boolean;
  showBadge?: boolean;
}

export function LanguageSelector({
  className,
  variant = "circle",
  dark = false,
  showBadge = false,
}: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. Segmented Pill Mode (Wide switch for desktop footers or explicit pill requests)
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-full text-xs font-semibold select-none border transition-all",
          dark
            ? "bg-white/10 border-white/20 text-white"
            : "bg-[#FAFCF8] border-[#DDE8DF] text-[#17231D] shadow-2xs",
          className
        )}
        role="group"
        aria-label="Language selection"
      >
        <div className="flex items-center pl-2 pr-1.5 text-[#6B756E]" aria-hidden="true">
          <Globe className={cn("w-3.5 h-3.5", dark ? "text-white/70" : "text-[#0B5D3B]")} />
        </div>

        <button
          type="button"
          onClick={() => setLanguage("en")}
          className={cn(
            "relative px-2.5 py-1 rounded-full text-xs transition-colors duration-200 z-10",
            language === "en"
              ? dark
                ? "text-[#0B5D3B] font-bold"
                : "text-white font-bold"
              : dark
              ? "text-white/80 hover:text-white"
              : "text-[#6B756E] hover:text-[#17231D]"
          )}
          aria-pressed={language === "en"}
        >
          {language === "en" && (
            <motion.div
              layoutId="activeLangIndicator"
              className={cn(
                "absolute inset-0 rounded-full shadow-xs -z-10",
                dark ? "bg-[#F4C95D]" : "bg-[#0B5D3B]"
              )}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          English
        </button>

        <button
          type="button"
          onClick={() => setLanguage("te")}
          className={cn(
            "relative px-2.5 py-1 rounded-full text-xs transition-colors duration-200 z-10",
            language === "te"
              ? dark
                ? "text-[#0B5D3B] font-bold"
                : "text-white font-bold"
              : dark
              ? "text-white/80 hover:text-white"
              : "text-[#6B756E] hover:text-[#17231D]"
          )}
          aria-pressed={language === "te"}
        >
          {language === "te" && (
            <motion.div
              layoutId="activeLangIndicator"
              className={cn(
                "absolute inset-0 rounded-full shadow-xs -z-10",
                dark ? "bg-[#F4C95D]" : "bg-[#0B5D3B]"
              )}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          తెలుగు
        </button>
      </div>
    );
  }

  // 2. Small Circle Icon Mode (Default & Compact) - Minimalist, farmer-friendly, zero clutter
  return (
    <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3A8F3D]/30 relative touch-manipulation select-none group",
          dark
            ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
            : "bg-white border-[#DDE8DF] text-[#0B5D3B] hover:bg-[#0B5D3B]/5 hover:border-[#3A8F3D]/60 shadow-2xs"
        )}
        aria-expanded={dropdownOpen}
        aria-label={`Language selector (Active: ${language === "en" ? "English" : "Telugu"})`}
        title={language === "en" ? "Change Language (English)" : "భాష మార్చండి (తెలుగు)"}
      >
        <Globe
          className={cn(
            "w-4 h-4 transition-transform group-hover:scale-110",
            dark ? "text-white" : "text-[#0B5D3B]"
          )}
        />
        {showBadge && (
          <span
            className={cn(
              "absolute -bottom-0.5 -right-0.5 px-1 py-0 rounded-full text-[8px] font-black uppercase leading-tight border shadow-2xs",
              dark
                ? "bg-[#F4C95D] text-[#07452C] border-[#07452C]"
                : "bg-[#0B5D3B] text-white border-white"
            )}
          >
            {language}
          </span>
        )}
      </button>

      {/* Floating Dropdown on Click */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white rounded-2xl border border-[#DDE8DF] shadow-xl py-1.5 z-50 overflow-hidden"
          >
            <div className="px-3 py-1.5 border-b border-[#DDE8DF]/60 text-[10px] font-bold text-[#6B756E] uppercase tracking-wider">
              Language / భాష
            </div>
            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                setDropdownOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-xs flex items-center justify-between transition-colors",
                language === "en"
                  ? "bg-[#0B5D3B]/10 text-[#0B5D3B] font-bold"
                  : "text-[#17231D] hover:bg-[#FAFCF8]"
              )}
            >
              <span>English</span>
              {language === "en" && <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setLanguage("te");
                setDropdownOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-xs flex items-center justify-between transition-colors",
                language === "te"
                  ? "bg-[#0B5D3B]/10 text-[#0B5D3B] font-bold"
                  : "text-[#17231D] hover:bg-[#FAFCF8]"
              )}
            >
              <span>తెలుగు</span>
              {language === "te" && <Check className="w-3.5 h-3.5 text-[#0B5D3B]" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
