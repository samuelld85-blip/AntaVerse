"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";

/**
 * Deliberate exit from an in-progress game session — NOT a back button.
 *
 * A game screen is the end of a flow, not a navigation level: showing "←" there
 * would read as "go back one step" when it actually leaves the session. This
 * uses "✕" and an explicit label instead, and sits on the header's trailing
 * edge with the other session actions (restart), never on the leading edge
 * where menu-level back controls live.
 *
 * No confirmation: every game persists its state on each move and offers a
 * resume card on its home screen, so leaving loses nothing.
 */
export function QuitGameButton({ homeHref }: { homeHref: Route }) {
  const router = useRouter();

  return (
    <button
      type="button"
      className="quit-game-button"
      onClick={() => router.push(homeHref)}
      aria-label="Quitter la partie"
      title="Quitter la partie"
    >
      <span aria-hidden="true">✕</span>
    </button>
  );
}
