import Image from "next/image";
import Link from "next/link";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/quoi-de-9"
      aria-label="Quoi de 9, accueil"
      className="inline-flex items-center rounded-xl"
    >
      <Image
        src="/brand/games/quoi-de-9-dark.png"
        alt="Quoi des 9"
        width={1072}
        height={696}
        className={compact ? "quoi-brand-mark h-12 w-auto" : "quoi-brand-mark h-[6.5rem] w-auto"}
        priority
      />
    </Link>
  );
}
