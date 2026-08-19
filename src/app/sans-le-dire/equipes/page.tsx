"use client";

import { useState } from "react";
import { PageShell } from "@/games/sans-le-dire/components/page-shell";
import { SetupForm } from "@/games/sans-le-dire/features/setup/setup-form";
import { ModeSelectionScreen } from "@/games/sans-le-dire/features/setup/mode-selection-screen";
import type { PlayMode } from "@/games/sans-le-dire/lib/game/types";

export default function TeamsPage() {
  const [selectedMode, setSelectedMode] = useState<PlayMode | null>(null);

  return (
    <PageShell>
      {!selectedMode ? (
        <ModeSelectionScreen onModeSelected={setSelectedMode} />
      ) : (
        <>
          <section className="setup-heading">
            <p className="eyebrow">Qui s’affronte ?</p>
            <h1>
              Donnez un nom
              <br />à vos équipes.
            </h1>
            <p>Vous pourrez rejouer avec les mêmes noms.</p>
          </section>
          <SetupForm playMode={selectedMode} />
        </>
      )}
    </PageShell>
  );
}
