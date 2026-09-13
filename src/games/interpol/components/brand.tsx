import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/interpol.png"
      alt=""
      width={200}
      height={200}
      className={compact ? "brand-mark brand-mark--interpol brand-mark--small" : "brand-mark brand-mark--interpol"}
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/interpol" aria-label="Interpol, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
