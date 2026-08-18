"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js");
      return;
    }

    void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
      if (!registrations.length) return;
      await Promise.all(registrations.map((registration) => registration.unregister()));
      window.location.reload();
    });
  }, []);

  return null;
}
