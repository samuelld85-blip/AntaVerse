"use client";

import { useState } from "react";
import type { Player, SecretChallenge, SecretReveal } from "../lib/game/types";

export function SecretChallengeHub({
  challenges,
  players,
  onResolve,
}: {
  challenges: SecretChallenge[];
  players: Player[];
  onResolve: (instanceId: string, success: boolean) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<"owner" | "accuse">("owner");
  const [visible, setVisible] = useState(false);
  if (challenges.length === 0) return null;
  const selected = challenges.find((challenge) => challenge.instanceId === selectedId);
  const ownerName = selected
    ? players.find((player) => player.id === selected.ownerId)?.name ?? "Joueur"
    : null;

  return (
    <details className="secret-hub">
      <summary>
        <span aria-hidden="true">🕵️</span>
        <span>{challenges.length} mission{challenges.length > 1 ? "s" : ""} secrète{challenges.length > 1 ? "s" : ""}</span>
        <span className="rule-stack-chevron" aria-hidden="true">⌄</span>
      </summary>
      <div className="secret-hub-body">
        {!selected ? (
          <>
            <p>Choisis ta mission, puis prends le téléphone seul·e pour la consulter ou la révéler.</p>
            {challenges.map((challenge) => {
              const name = players.find((player) => player.id === challenge.ownerId)?.name ?? "Joueur";
              return (
                <div key={challenge.instanceId} className="secret-hub-mission-row">
                  <span>Mission de {name}</span>
                  <button type="button" onClick={() => { setSelectedId(challenge.instanceId); setMode("owner"); setVisible(false); }}>
                    Ma mission
                  </button>
                  <button type="button" onClick={() => { setSelectedId(challenge.instanceId); setMode("accuse"); setVisible(false); }}>
                    Accuser
                  </button>
                </div>
              );
            })}
          </>
        ) : visible ? (
          <>
            <p className="secret-pick-owner">Mission de {ownerName}</p>
            <p className="secret-pick-task">{selected.task}</p>
            <p className="secret-pick-hint">Réussie sans être démasqué·e : distribue {selected.rewardSips} gorgées. Si quelqu’un a deviné avant, la mission échoue.</p>
            <div className="secret-hub-actions">
              {mode === "accuse" ? (
                <>
                  <button type="button" className="button button--primary" onClick={() => onResolve(selected.instanceId, false)}>
                    C’était ça · démasqué·e
                  </button>
                  <button type="button" className="button" onClick={() => { setVisible(false); setSelectedId(null); }}>
                    Raté · mission continue
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="button button--primary" onClick={() => onResolve(selected.instanceId, true)}>
                    J’ai réussi · révéler
                  </button>
                  <button type="button" className="button" onClick={() => onResolve(selected.instanceId, false)}>
                    On m’a démasqué·e
                  </button>
                </>
              )}
              <button type="button" className="secret-hub-text-button" onClick={() => setVisible(false)}>
                Remasquer
              </button>
            </div>
          </>
        ) : (
          <>
            <p>{mode === "accuse" ? "L'accusateur annonce sa supposition à voix haute. Passe ensuite le téléphone au joueur de la mission pour vérifier seul." : `Passe le téléphone à ${ownerName}. Les autres détournent les yeux.`}</p>
            <button type="button" className="button button--primary" onClick={() => setVisible(true)}>
              {mode === "accuse" ? `${ownerName} vérifie en privé` : "Je suis prêt·e · voir ma mission"}
            </button>
            <button type="button" className="secret-hub-text-button" onClick={() => setSelectedId(null)}>
              Retour aux missions
            </button>
          </>
        )}
      </div>
    </details>
  );
}

export function SecretRevealCard({
  reveal,
  players,
  onContinue,
}: {
  reveal: SecretReveal;
  players: Player[];
  onContinue: () => void;
}) {
  const name = players.find((player) => player.id === reveal.ownerId)?.name ?? "Joueur";
  return (
    <section className="secret-reveal-card" aria-live="polite">
      <p className="event-card-category"><span aria-hidden="true">🕵️</span> Mission révélée</p>
      <h2>{reveal.success ? "Mission accomplie !" : "Mission démasquée !"}</h2>
      <p className="secret-reveal-task">{reveal.task}</p>
      <p className="secret-reveal-result">
        {reveal.success
          ? `${name} distribue ${reveal.sips} gorgées.`
          : `${name} boit ${reveal.sips} gorgée.`}
      </p>
      <button type="button" className="button button--primary" onClick={onContinue}>
        Continuer <span aria-hidden="true">→</span>
      </button>
    </section>
  );
}
