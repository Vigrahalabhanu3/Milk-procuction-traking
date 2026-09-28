"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, CheckCircle2, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/language-context";
import { useToast } from "@/components/ui/toast";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const { t } = useLanguage();
  const { success } = useToast();

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      isAppleDevice &&
      userAgent.includes("safari") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("fxios");
    setIsIOS(isSafari);

    // 3. Listen for Android / Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user dismissed it within the last 24 hours
      const lastDismissed = localStorage.getItem("dairyflow_pwa_dismissed");
      const oneDay = 24 * 60 * 60 * 1000;
      if (!lastDismissed || Date.now() - parseInt(lastDismissed, 10) > oneDay) {
        // Small delay so user has seen the page first
        setTimeout(() => setShowPrompt(true), 2500);
      }
    };

    // 4. Listen for appinstalled
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setIsStandalone(true);
      success("DairyFlow is now installed on your home screen!");
    };

    // 5. Listen for manual trigger from Profile or UI buttons
    const handleManualTrigger = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt().catch((err) => console.warn(err));
      } else if (isSafari) {
        setShowIOSGuide(true);
      } else {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("dairyflow_trigger_install", handleManualTrigger);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("dairyflow_trigger_install", handleManualTrigger);
    };
  }, [success]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSGuide(true);
      }
      return;
    }

    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn("PWA install error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("dairyflow_pwa_dismissed", Date.now().toString());
  };

  // Do not render anything if already installed
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Floating Install Banner for Android / Chrome / Mobile */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed bottom-20 left-3 right-3 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-md z-40 select-none"
            role="dialog"
            aria-label="Install DairyFlow PWA"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-[#DDE8DF] rounded-2xl sm:rounded-3xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.14)] flex items-center gap-3.5 relative overflow-hidden">
              {/* Left Logo Icon */}
              <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-[#FAFCF8] border border-[#DDE8DF] shrink-0 p-1 flex items-center justify-center shadow-xs">
                <Image
                  src="/icons/icon-192x192.png"
                  alt="DairyFlow App Icon"
                  width={44}
                  height={44}
                  className="object-contain"
                  priority
                />
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0 pr-6">
                <h4 className="text-xs sm:text-sm font-extrabold text-[#17231D] tracking-tight leading-tight">
                  {t.pwa?.installPromptTitle || "Install DairyFlow App"}
                </h4>
                <p className="text-[11px] sm:text-xs text-[#6B756E] mt-0.5 line-clamp-2 leading-relaxed">
                  {t.pwa?.installPromptDesc || "Install on your home screen for quick 1-tap milk tracking and offline access."}
                </p>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0B5D3B] hover:bg-[#07452C] active:scale-95 text-white text-xs font-bold transition-all shadow-xs touch-manipulation"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t.pwa?.installBtn || "Install App"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#6B756E] hover:text-[#17231D] hover:bg-[#FAFCF8] transition-colors touch-manipulation"
                  >
                    {t.pwa?.dismissBtn || "Later"}
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg text-[#6B756E] hover:text-[#17231D] hover:bg-[#FAFCF8] transition-colors"
                aria-label="Close install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#DDE8DF] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#DDE8DF]">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#0B5D3B]" />
                  <h3 className="text-sm font-bold text-[#17231D]">Install on iPhone / iPad</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-[#6B756E] hover:text-[#17231D] rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#6B756E] leading-relaxed">
                Apple iOS does not allow automatic install popups. Follow these 2 easy steps in Safari:
              </p>

              <div className="space-y-2.5 text-xs text-[#17231D] bg-[#FAFCF8] p-3.5 rounded-2xl border border-[#DDE8DF]">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    Tap the <strong>Share</strong> button (
                    <Share2 className="w-3.5 h-3.5 inline mx-0.5 text-[#0B5D3B]" />
                    ) in Safari toolbar at the bottom.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#0B5D3B] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    Scroll down and tap <strong>Add to Home Screen</strong> (
                    <PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-[#0B5D3B]" />
                    ).
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#0B5D3B] text-white text-xs font-bold shadow-xs hover:bg-[#07452C] transition-colors"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
