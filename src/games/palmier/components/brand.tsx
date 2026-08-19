import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/palmier-dark.png"
      alt=""
      width={1448}
      height={1086}
      className={
        compact ? "brand-mark brand-mark--plm brand-mark--small" : "brand-mark brand-mark--plm"
      }
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/palmier" aria-label="Palmier, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
