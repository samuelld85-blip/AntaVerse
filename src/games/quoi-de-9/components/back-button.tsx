"use client";

import { useRouter } from "next/navigation";

// Menu-level back control for Quoi de 9's non-game screens (rules, setup,
// install). It navigates to an explicit destination rather than
// `router.back()`: browser history doesn't necessarily match the product
// hierarchy (arriving from a shared link, or from the game screen), and every
// screen this shell wraps sits one level under /quoi-de-9. Same behavior as
// `games/shared/components/back-button.tsx`; kept separate only because
// Quoi de 9 styles with Tailwind and does not import `game-base.css`.
export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push("/quoi-de-9")}
      aria-label="Revenir à l’accueil de Quoi de 9"
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-subtle bg-[color:var(--surface-subtle)] text-lg text-primary transition hover:bg-[color:var(--surface-hover)] hover:text-primary"
    >
      <span aria-hidden="true">←</span>
    </button>
  );
}
