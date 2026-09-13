import Link from "next/link";
import Image from "next/image";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`pifometre-logo${compact ? " pifometre-logo--small" : ""}`} aria-hidden="true">
      <Image className="pifometre-logo__image pifometre-logo__image--dark" src="/brand/games/pifometre-logo-dark.png" alt="" width={500} height={500} sizes="(max-width: 480px) 32vw, 192px" />
      <Image className="pifometre-logo__image pifometre-logo__image--light" src="/brand/games/pifometre-logo-light.png" alt="" width={500} height={500} sizes="(max-width: 480px) 32vw, 192px" />
    </span>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/pifometre" aria-label="Le Pifomètre, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
