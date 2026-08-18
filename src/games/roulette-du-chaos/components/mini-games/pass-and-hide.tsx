import type { ReactNode } from "react";
import { Button } from "@/games/shared/components/ui";

/**
 * "Passe le téléphone" secrecy gate (spec §43): shown before a player enters
 * a secret guess so the previous answer stays hidden. Purely controlled —
 * the parent mini-game owns `revealed` and resets it between players.
 */
export function PassAndHide({
  playerName,
  revealed,
  onReveal,
  children,
}: {
  playerName: string;
  revealed: boolean;
  onReveal: () => void;
  children?: ReactNode;
}) {
  if (revealed) return <>{children}</>;

  return (
    <div className="pass-and-hide">
      <p className="pass-and-hide-label">Passe le téléphone à</p>
      <h2 className="pass-and-hide-name">{playerName}</h2>
      <Button type="button" onClick={onReveal}>
        Je suis prêt·e <span aria-hidden="true">→</span>
      </Button>
    </div>
  );
}
