import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return <Image src="/brand/games/la-traversee-dark.png" alt="" width={1000} height={1000} className={compact ? "brand-mark brand-mark--traversee brand-mark--small" : "brand-mark brand-mark--traversee"} aria-hidden="true" priority />;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/la-traversee" aria-label="La Traversée, accueil" className="brand"><LogoMark compact={compact} /></Link>;
}
