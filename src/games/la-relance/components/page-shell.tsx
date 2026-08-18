import type { ReactNode } from "react";
import { BackButton } from "@/games/shared/components/back-button";
import { Brand } from "./brand";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="page-shell safe-shell">
      <header className="page-header">
        <BackButton homeHref="/la-relance" />
        <Brand compact />
      </header>
      {children}
    </main>
  );
}
