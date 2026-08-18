import type { ReactNode } from "react";

export function MiniGameShell({
  title,
  instruction,
  children,
}: {
  title: string;
  instruction: string;
  children: ReactNode;
}) {
  return (
    <section className="mini-game-shell">
      <p className="mini-game-eyebrow">Mini-jeu</p>
      <h1 className="mini-game-title">{title}</h1>
      <p className="mini-game-instruction">{instruction}</p>
      <div className="mini-game-body">{children}</div>
    </section>
  );
}
