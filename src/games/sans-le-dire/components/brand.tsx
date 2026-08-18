import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/v1/sans-le-dire-mark.svg"
      alt="Sans le dire"
      width={96}
      height={96}
      className={compact ? "brand-mark brand-mark--small" : "brand-mark"}
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
