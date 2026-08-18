import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/triman-dark.png"
      alt=""
      width={1072}
      height={720}
      className={
        compact
          ? "brand-mark brand-mark--triman brand-mark--small"
          : "brand-mark brand-mark--triman"
      }
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/triman" aria-label="Triman, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
