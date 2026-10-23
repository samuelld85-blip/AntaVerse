import type { CursedObject, CursedReveal, Player } from "../lib/game/types";

export function CursedObjectPanel({
  objects,
  turnNumber,
  players,
  onResolve,
}: {
  objects: CursedObject[];
  turnNumber: number;
  players: Player[];
  onResolve: (instanceId: string, holderId: string) => void;
}) {
  if (objects.length === 0) return null;
  const due = objects.find((object) => object.dueTurn <= turnNumber);
  if (due) {
    return (
      <section className="cursed-panel cursed-panel--due">
        <p className="event-card-category">
          <span aria-hidden="true">🪄</span> L’objet maudit
        </p>
        <h2>Qui possède {due.objectLabel.toLowerCase()} ?</h2>
        <p>Regardez la table. Touchez le nom de la personne qui le possède maintenant.</p>
        <div className="cursed-holder-grid">
          {players.map((player) => (
            <button
              key={player.id}
              type="button"
              onClick={() => onResolve(due.instanceId, player.id)}
            >
              {player.name}
            </button>
          ))}
        </div>
      </section>
    );
  }
  return (
    <details className="cursed-panel">
      <summary>
        <span aria-hidden="true">🪄</span>
        <span>
          {objects.length} objet{objects.length > 1 ? "s" : ""} maudit
          {objects.length > 1 ? "s" : ""}
        </span>
        <span className="rule-stack-chevron" aria-hidden="true">
          ⌄
        </span>
      </summary>
      <ul>
        {objects.map((object) => (
          <li key={object.instanceId}>
            {object.objectLabel} · encore {object.dueTurn - turnNumber} lancer
            {object.dueTurn - turnNumber > 1 ? "s" : ""}
          </li>
        ))}
      </ul>
    </details>
  );
}

export function CursedRevealCard({
  reveal,
  players,
  onContinue,
}: {
  reveal: CursedReveal;
  players: Player[];
  onContinue: () => void;
}) {
  const holderName = players.find((player) => player.id === reveal.holderId)?.name ?? "Ce joueur";
  const starterName =
    players.find((player) => player.id === reveal.startingHolderId)?.name ?? "Le premier détenteur";
  return (
    <section className="secret-reveal-card" aria-live="polite">
      <p className="event-card-category">
        <span aria-hidden="true">🪄</span> Objet maudit
      </p>
      <h2>{reveal.objectLabel} a été retrouvé !</h2>
      <p className="secret-reveal-result">
        {holderName} boit {reveal.sips} gorgées.
      </p>
      {starterName !== holderName ? <p>{starterName} a réussi à s’en débarrasser.</p> : null}
      <button type="button" className="button button--primary" onClick={onContinue}>
        Continuer <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
