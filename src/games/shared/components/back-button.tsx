"use client";

import { useRouter } from "next/navigation";
import type { Route } from "next";

export function BackButton({ homeHref }: { homeHref: Route }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(homeHref)}
      aria-label="Revenir à l’accueil du jeu"
    >
      <span aria-hidden="true">←</span>
    </button>
  );
}
