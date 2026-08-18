import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return (
    <Image
      src="/brand/games/purple-dark.png"
      alt=""
      width={133}
      height={62}
      className={
        compact
          ? "brand-mark brand-mark--purple brand-mark--small"
          : "brand-mark brand-mark--purple"
      }
      aria-hidden="true"
      priority
    />
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/purple" aria-label="Purple, accueil" className="brand">
      <LogoMark compact={compact} />
    </Link>
  );
}
