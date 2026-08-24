"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Le build Android contient déjà tous les fichiers de l'export statique.
    // Un Service Worker y dupliquerait inutilement l'application dans le Cache API.
    if (Capacitor.isNativePlatform()) return;

    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
        if (!registrations.length) return;
        await Promise.all(registrations.map((registration) => registration.unregister()));
        window.location.reload();
      });
      return;
    }

    // Le rechargement déclenché par un changement de service worker est géré par le script
    // inline du document : il reste actif même si les chunks applicatifs manquent.
    let registration: ServiceWorkerRegistration | undefined;
    // `updateViaCache: "none"` empêche le cache HTTP du navigateur de masquer un sw.js à jour.
    void navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((value) => {
        registration = value;
        return value.update();
      })
      .catch(() => undefined);

    // Une PWA installée reste ouverte des heures : on revérifie la présence d'un déploiement
    // plus récent à chaque retour au premier plan.
    const checkForUpdate = () => {
      if (document.visibilityState !== "visible") return;
      void registration?.update().catch(() => undefined);
    };
    document.addEventListener("visibilitychange", checkForUpdate);

    return () => {
      document.removeEventListener("visibilitychange", checkForUpdate);
    };
  }, []);

  return null;
}
