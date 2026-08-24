import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/fuck-dark.png"
      alt=""
      width={1000}
      height={1000}
      className={compact ? "brand-mark brand-mark--fuck brand-mark--small" : "brand-mark brand-mark--fuck"}
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/fuck" aria-label="Fuck, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
