import type { HTMLAttributes } from "react";
import type { Card } from "@/games/sans-le-dire/lib/game/types";

export function WordCard({ card, ...rest }: { card: Card } & HTMLAttributes<HTMLElement>) {
  return (
    <section className="word-card" key={card.id} {...rest}>
      <h1>{card.word}</h1>
      <p>Mots interdits</p>
      <ul>
        {card.forbidden.map((word) => (
          <li key={word}>
            <span aria-hidden="true">💣</span> {word}
          </li>
        ))}
      </ul>
    </section>
  );
}
