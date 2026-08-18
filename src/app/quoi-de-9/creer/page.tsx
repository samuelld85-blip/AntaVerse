import type { Metadata } from "next";
import { PageShell } from "@/games/quoi-de-9/components/page-shell";
import { SetupForm } from "@/games/quoi-de-9/features/setup/setup-form";

export const metadata: Metadata = { title: "Nouvelle partie" };

export default function SetupPage() {
  return (
    <PageShell>
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_22%,rgba(255,95,86,.1),transparent_28rem),radial-gradient(circle_at_88%_70%,rgba(91,124,255,.11),transparent_28rem)]" />
      <div className="mb-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent-text)]">
            Nouvelle partie
          </p>
          <h1 className="display-face balance mt-1.5 text-[clamp(2.6rem,10.5vw,3.35rem)] leading-[0.88]">
            <span className="block">Composez vos</span>
            <span className="block">équipes</span>
          </h1>
        </div>
      </div>
      <SetupForm />
    </PageShell>
  );
}
