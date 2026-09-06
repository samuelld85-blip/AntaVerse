"use client";

import { useState } from "react";

// Namespace complet des données locales AntaVerse (voir docs/compliance/DATA_INVENTORY.md).
// Cette liste doit rester synchronisée avec les clés réellement utilisées par
// chaque src/games/<jeu>/lib/game/persistence.ts.
const LOCAL_STORAGE_KEYS = [
  "antaverse:sport:v1",
  "la-relance:current-game",
  "sans-le-dire:current-game",
  "sans-le-dire:solo-current-game",
  // Legacy preference key: it is no longer written, but can remain on an
  // older installation until the user clears their local data.
  "sans-le-dire:team-names",
  "palmier:current-game",
  "triman:current-game",
  "purple:current-game",
  // Legacy optional preference key, kept here solely so older installations
  // can erase it.
  "purple:reveal-mode",
  "roulette-du-chaos:current-game",
  "fuck:current-game",
  "la-traversee:current-game",
  "pmu:current-game",
  "qui-des-9:current-game",
] as const;

const INDEXED_DB_NAME = "qui-des-9";
const WINDOW_NAME_PREFIX = "qui-des-9-game:";

async function clearAntaVerseLocalData(): Promise<void> {
  // Local erasure must not become an empty cloud backup on the next Sport visit.
  const { getCloud } = await import("@/sport/cloud/client");
  const client = getCloud();
  if (client) {
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
  }
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    const subscription = await registration?.pushManager?.getSubscription();
    await subscription?.unsubscribe();
  }
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("antaverse:sport:")) window.localStorage.removeItem(key);
  }
  for (const key of LOCAL_STORAGE_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Stockage indisponible (navigation privée) : rien à effacer.
    }
  }
  if (window.name.startsWith(WINDOW_NAME_PREFIX)) window.name = "";
  try {
    window.indexedDB.deleteDatabase(INDEXED_DB_NAME);
  } catch {
    // IndexedDB indisponible sur cette origine.
  }
  try {
    window.sessionStorage.removeItem("sans-le-dire:team-names");
  } catch {
    // Stockage de session indisponible : rien à effacer.
  }
}

export function ClearLocalDataButton() {
  const [status, setStatus] = useState<"idle" | "confirm" | "done">("idle");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (status === "done") {
    return (
      <p className="legal-clear-done" role="status">
        Données locales effacées sur cet appareil. Rechargez l’application pour repartir de zéro.
      </p>
    );
  }

  if (status === "confirm") {
    return (
      <div className="legal-clear-confirm">
        {error && <p role="alert">{error}</p>}
        <p>
          Cette action efface, uniquement sur cet appareil : les parties en cours ou terminées de
          chaque jeu, le carnet Sport (séance en cours, historique et favoris), et les noms
          d’équipes mémorisés par Sans le dire. Elle n’efface aucune autre donnée du navigateur.
          Elle est irréversible.
        </p>
        <div className="legal-clear-actions">
          <button type="button" onClick={() => setStatus("idle")}>
            Annuler
          </button>
          <button
            type="button"
            className="legal-clear-confirm-button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await clearAntaVerseLocalData();
                setStatus("done");
              } catch {
                setError(
                  "Effacement incomplet. Vérifiez votre connexion et réessayez, ou utilisez les réglages du navigateur.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            Confirmer l’effacement
          </button>
        </div>
      </div>
    );
  }

  return (
    <button type="button" className="legal-clear-trigger" onClick={() => setStatus("confirm")}>
      Effacer mes données locales
    </button>
  );
}
