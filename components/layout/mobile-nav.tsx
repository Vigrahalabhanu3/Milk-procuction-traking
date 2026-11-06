"use client";

import React, { useEffect } from "react";
import { Sidebar } from "./sidebar";
import { motion, AnimatePresence } from "framer-motion";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  role: "farmer" | "admin";
}

export function MobileNav({ isOpen, onClose, role }: MobileNavProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            aria-hidden="true"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 260 }}
            className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl"
          >
            <Sidebar role={role} onItemClick={onClose} onToggle={onClose} toggleLabel="Close sidebar" className="w-full" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
