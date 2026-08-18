import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/v1/la-relance-mark.svg"
      alt=""
      width={96}
      height={96}
      className={compact ? "brand-mark brand-mark--small" : "brand-mark"}
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/la-relance" aria-label="La Relance, accueil" className="brand">
      <LogoMark compact={compact} />
      <span className={compact ? "brand-name brand-name--small" : "brand-name"}>La Relance</span>
    </Link>
  );
}
