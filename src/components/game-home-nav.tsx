import Link from "next/link";
import type { Route } from "next";
import { GlobalHomeLink } from "@/components/global-home-link";

export function GameHomeNav({ rulesHref }: { rulesHref: Route }) {
  return (
    <div className="flex items-center gap-2">
      <GlobalHomeLink label="Jeux" />
      <Link
        href={rulesHref}
        className="min-h-11 rounded-full border border-white/15 px-3 py-3 text-[10px] font-black uppercase tracking-[0.08em] text-white/70"
      >
        Règles
      </Link>
    </div>
  );
}
