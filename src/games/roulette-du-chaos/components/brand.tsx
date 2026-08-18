import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/roulette-du-chaos-dark.png"
      alt=""
      width={1072}
      height={720}
      className={
        compact ? "brand-mark brand-mark--rdc brand-mark--small" : "brand-mark brand-mark--rdc"
      }
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/roulette-du-chaos" aria-label="Roulette du Chaos, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
