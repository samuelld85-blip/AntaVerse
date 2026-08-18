import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/la-relance-logo.png"
      alt=""
      width={133}
      height={76}
      className={compact ? "brand-mark brand-mark--la-relance brand-mark--small" : "brand-mark brand-mark--la-relance"}
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/la-relance" aria-label="La Relance, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
