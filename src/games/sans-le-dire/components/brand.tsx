import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/sans-le-dire-dark.png"
      alt="Sans le dire"
      width={115}
      height={115}
      className={compact ? "brand-mark brand-mark--sans-le-dire brand-mark--small" : "brand-mark brand-mark--sans-le-dire"}
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/sans-le-dire" aria-label="Sans le dire, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
