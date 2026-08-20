import type { ReactNode } from "react";
import { Brand } from "./brand";
import { BackButton } from "@/games/shared/components/back-button";

export function PageShell({
  children,
  showBrand = true,
}: {
  children: ReactNode;
  showBrand?: boolean;
}) {
  return (
    <main className="safe-shell mx-auto flex w-full max-w-[520px] flex-col">
      {showBrand ? (
        <header className="mb-5 flex items-center justify-between sm:mb-7">
          <div className="flex items-center gap-2.5">
            <BackButton
              homeHref="/quoi-de-9"
              label="Revenir à l’accueil de Quoi de 9"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-subtle bg-[color:var(--surface-subtle)] text-lg text-primary transition hover:bg-[color:var(--surface-hover)] hover:text-primary"
            />
            <Brand compact />
          </div>
        </header>
      ) : null}
      {children}
    </main>
  );
}
