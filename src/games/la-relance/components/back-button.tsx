"use client";

import { useRouter } from "next/navigation";

export function BackButton() {
  const router = useRouter();

  return (
    <button type="button" onClick={() => router.push("/la-relance")} aria-label="Revenir à l’accueil du jeu">
      <span aria-hidden="true">←</span>
    </button>
  );
}
