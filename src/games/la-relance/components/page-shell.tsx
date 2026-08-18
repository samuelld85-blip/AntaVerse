import type { ReactNode } from "react";
import { Brand } from "./brand";
import { BackButton } from "./back-button";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="page-shell safe-shell">
      <header className="page-header">
        <BackButton />
        <Brand compact />
      </header>
      {children}
    </main>
  );
}
