"use client";

import { useRouter } from "next/navigation";
import { PageShell } from "@/games/sans-le-dire/components/page-shell";
import { FormatSelectionScreen } from "@/games/sans-le-dire/features/setup/format-selection-screen";

export default function JouerPage() {
  const router = useRouter();

  return (
    <PageShell>
      <FormatSelectionScreen
        onTeams={() => router.push("/sans-le-dire/equipes")}
        onSolo={() => router.push("/sans-le-dire/individuel")}
      />
    </PageShell>
  );
}
