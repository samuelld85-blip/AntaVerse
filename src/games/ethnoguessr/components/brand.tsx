import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/ethnoguessr.png"
      alt=""
      width={500}
      height={500}
      className={
        compact ? "brand-mark brand-mark--eg brand-mark--small" : "brand-mark brand-mark--eg"
      }
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/ethnoguessr" aria-label="EthnoGuessr, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
