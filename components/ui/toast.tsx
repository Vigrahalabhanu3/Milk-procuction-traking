"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, "id"> | string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: Omit<ToastItem, "id"> | string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const item: ToastItem =
        typeof input === "string"
          ? { id, type: "info", message: input, duration: 4000 }
          : { id, duration: 4000, ...input };

      setToasts((prev) => [...prev, item]);

      setTimeout(() => {
        removeToast(id);
      }, item.duration || 4000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      toast({ type: "success", message, title: title || "Success" });
    },
    [toast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      toast({ type: "error", message, title: title || "Notice" });
    },
    [toast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      toast({ type: "info", message, title: title || "Info" });
    },
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      {/* Toast Notification Container:
          On mobile (small screens): Fixed at top (top-3 left-3 right-3) with high z-index (z-[9999]), completely avoiding bottom nav and keyboard.
          On desktop: Fixed at top-right (sm:top-5 sm:right-6 sm:left-auto) */}
      <div
        className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:top-5 z-[9999] flex flex-col gap-2.5 max-w-md sm:max-w-sm w-auto pointer-events-none mx-auto sm:mx-0 select-none"
        aria-live="polite"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.95 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl border text-sm backdrop-blur-xl touch-manipulation",
                t.type === "success" &&
                  "bg-white/98 border-[#3A8F3D]/40 text-[#17231D] shadow-[0_10px_35px_rgba(11,93,59,0.18)]",
                t.type === "error" &&
                  "bg-white/98 border-[#D9534F]/40 text-[#17231D] shadow-[0_10px_35px_rgba(217,83,79,0.18)]",
                t.type === "info" &&
                  "bg-white/98 border-[#DDE8DF] text-[#17231D] shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
              )}
            >
              {/* Type Icon Badge */}
              <div className="shrink-0 mt-0.5">
                {t.type === "success" && (
                  <div className="w-8 h-8 rounded-full bg-[#0B5D3B]/10 border border-[#0B5D3B]/20 flex items-center justify-center text-[#0B5D3B]">
                    <CheckCircle2 className="w-4 h-4 text-[#0B5D3B]" />
                  </div>
                )}
                {t.type === "error" && (
                  <div className="w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center text-[#D9534F]">
                    <AlertCircle className="w-4 h-4 text-[#D9534F]" />
                  </div>
                )}
                {t.type === "info" && (
                  <div className="w-8 h-8 rounded-full bg-[#0B5D3B]/5 border border-[#DDE8DF] flex items-center justify-center text-[#0B5D3B]">
                    <Info className="w-4 h-4 text-[#0B5D3B]" />
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h5 className="font-extrabold text-[11px] uppercase tracking-wider text-[#6B756E] mb-0.5">
                    {t.title}
                  </h5>
                )}
                <p className="text-xs sm:text-sm font-semibold text-[#17231D] leading-snug break-words">
                  {t.message}
                </p>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1.5 -mr-1 -mt-1 text-[#6B756E] hover:text-[#17231D] hover:bg-black/5 active:bg-black/10 transition-colors rounded-lg touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
