"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    async function configureWorker() {
      if (process.env.NODE_ENV === "development") {
        // A production worker can otherwise serve outdated Next.js development chunks.
        const registration = await navigator.serviceWorker.getRegistration("/");
        const worker = registration?.active || registration?.waiting || registration?.installing;
        if (worker?.scriptURL === new URL("/sw.js", window.location.origin).href) {
          await registration?.unregister();
        }
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter(key => key.startsWith("dairyflow-cache-")).map(key => caches.delete(key)));
        }
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
      await registration.update();
    }

    void configureWorker().catch(() => {
      // Offline support is optional; a registration failure must not block the app.
    });
  }, []);

  return null;
}
