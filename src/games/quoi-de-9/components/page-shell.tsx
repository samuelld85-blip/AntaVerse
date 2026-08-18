import type { ReactNode } from "react";
import { Brand } from "./brand";
import { BackButton } from "./back-button";

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
            <BackButton />
            <Brand compact />
          </div>
        </header>
      ) : null}
      {children}
    </main>
  );
}
