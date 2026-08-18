import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/quoi-de-9"
      aria-label="Quoi de 9, accueil"
      className="inline-flex items-center gap-2 rounded-xl"
    >
      <Image src="/brand/v1/quoi-de-9-mark.svg" alt="" width={compact ? 32 : 40} height={compact ? 32 : 40} aria-hidden="true" />
      <span className={`${compact ? "text-xl" : "text-2xl"} display-face tracking-tight`}>
        Quoi de 9 ?
      </span>
    </Link>
  );
}
