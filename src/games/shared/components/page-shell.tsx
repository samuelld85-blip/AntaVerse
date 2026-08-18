import type { Route } from "next";
import type { ReactNode } from "react";
import { BackButton } from "./back-button";

// The page chrome (back button + brand mark in a header, above the game
// content) is identical for La Relance and Sans le dire. Quoi de 9 has its
// own Tailwind-based layout and does not use this.
export function PageShell({
  homeHref,
  brand,
  children,
}: {
  homeHref: Route;
  brand: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="page-shell safe-shell">
      <header className="page-header">
        <BackButton homeHref={homeHref} />
        {brand}
      </header>
      {children}
    </main>
  );
}
