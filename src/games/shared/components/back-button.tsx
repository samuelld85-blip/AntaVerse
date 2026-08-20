"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";

/**
 * Menu-level back control: rules, setup and other screens that sit one level
 * under a game's home. Not for gameplay — leaving an in-progress session is
 * `QuitGameButton`, which reads as an exit rather than a step backwards.
 *
 * Navigates to an explicit destination rather than `router.back()`: browser
 * history doesn't necessarily match the product hierarchy (a shared link, or
 * arriving from the game screen), so "back" would land somewhere unintended.
 *
 * `className` exists because Quoi de 9 styles with Tailwind and doesn't import
 * `game-base.css`, where the other six games' `.page-header button` rule lives.
 * Same component and same behavior everywhere; only the styling hook differs.
 */
export function BackButton({
  homeHref,
  className,
  label = "Revenir à l’accueil du jeu",
}: {
  homeHref: Route;
  className?: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      className={className}
      onClick={() => router.push(homeHref)}
      aria-label={label}
    >
      <span aria-hidden="true">←</span>
    </button>
  );
}
