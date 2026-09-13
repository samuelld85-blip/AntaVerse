import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`bac-logo${compact ? " bac-logo--small" : ""}`} aria-hidden="true">
      <Image
        src="/brand/games/bac-enchaine.png"
        alt=""
        width={500}
        height={500}
        className="bac-logo__image"
        priority
      />
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/bac-enchaine" aria-label="Bac Enchaîné, accueil" className="brand bac-brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
