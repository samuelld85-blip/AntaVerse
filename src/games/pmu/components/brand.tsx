import Image from "next/image";
import Link from "next/link";

export function LogoMark({ compact = false }: { compact?: boolean }) {
  return <Image src="/brand/games/pmu.svg" alt="" width={220} height={90} className={compact ? "brand-mark brand-mark--pmu brand-mark--small" : "brand-mark brand-mark--pmu"} aria-hidden="true" priority />;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return <Link href="/pmu" aria-label="PMU, accueil" className="brand"><LogoMark compact={compact} /></Link>;
}
