"use client";

import { useState } from "react";

// Namespace complet des données locales AntaVerse (voir docs/compliance/DATA_INVENTORY.md).
// Cette liste doit rester synchronisée avec les clés réellement utilisées par
// chaque src/games/<jeu>/lib/game/persistence.ts.
const LOCAL_STORAGE_KEYS = [
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

function clearAntaVerseLocalData(): void {
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
        <p>
          Cette action efface, uniquement sur cet appareil : les parties en cours ou terminées de
          chaque jeu, et les noms d’équipes mémorisés par Sans le dire. Elle n’efface aucune autre
          donnée du navigateur. Elle est irréversible.
        </p>
        <div className="legal-clear-actions">
          <button type="button" onClick={() => setStatus("idle")}>
            Annuler
          </button>
          <button
            type="button"
            className="legal-clear-confirm-button"
            onClick={() => {
              clearAntaVerseLocalData();
              setStatus("done");
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
