import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`qndd-logo${compact ? " qndd-logo--small" : ""}`} aria-hidden="true">
      <Image src="/brand/games/qui-de-nous-deux.png" alt="" width={1280} height={1280} sizes="(max-width: 480px) 38vw, 180px" />
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href={"/qui-de-nous-deux" as Route} aria-label="Qui de nous deux, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
