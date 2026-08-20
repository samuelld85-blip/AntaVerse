import Link from "next/link";
import type { Route } from "next";
import { GlobalHomeLink } from "@/components/global-home-link";

export function GameHomeNav({ rulesHref }: { rulesHref: Route }) {
  return (
    <div className="flex items-center gap-2">
      <GlobalHomeLink label="Jeux" />
      <Link href={rulesHref} className="game-rules-link">
        Règles
      </Link>
    </div>
  );
}
