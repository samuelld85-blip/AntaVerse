"use client";

import { useRouter } from "next/navigation";

export function BackButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) router.back();
    else router.push("/quoi-de-9");
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label="Revenir à la page précédente"
      className={`${compact ? "h-8 w-8 rounded-lg text-base" : "h-10 w-10 rounded-xl text-lg"} grid shrink-0 place-items-center border border-white/12 bg-white/[.05] text-white/72 transition hover:bg-white/[.09] hover:text-white`}
    >
      <span aria-hidden="true">←</span>
    </button>
  );
}
