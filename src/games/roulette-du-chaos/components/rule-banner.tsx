"use client";

import { useEffect } from "react";
import type { ActiveRule, Player } from "../lib/game/types";

function RuleRow({
  rule,
  players,
  turnNumber,
  onClear,
}: {
  rule: ActiveRule;
  players: Player[];
  turnNumber: number;
  onClear: (instanceId: string) => void;
}) {
  useEffect(() => {
    if (rule.expiry !== "timer" || !rule.timerEndsAt) return;
    const remaining = new Date(rule.timerEndsAt).getTime() - Date.now();
    if (remaining <= 0) {
      onClear(rule.instanceId);
      return;
    }
    const timer = window.setTimeout(() => onClear(rule.instanceId), remaining);
    return () => window.clearTimeout(timer);
  }, [rule.expiry, rule.timerEndsAt, rule.instanceId, onClear]);

  const ownerName = players.find((player) => player.id === rule.ownerId)?.name ?? "Joueur";
  const spinsLeft = Math.max(0, rule.expiresAtTurn - turnNumber - 1);
  const lapsLeft = Math.ceil(spinsLeft / players.length);

  return (
    <li className="rule-stack-item">
      <div className="rule-stack-item-top">
        <strong>{rule.title}</strong>
        <span>{rule.expiry === "firstViolation" ? "Jusqu'à la 1re faute" : `${lapsLeft} tour${lapsLeft > 1 ? "s" : ""} de table`}</span>
      </div>
      <p>{rule.description}</p>
      <small>Posée par {ownerName}</small>
      {rule.expiry === "firstViolation" || rule.expiry === "timer" ? (
        <button type="button" className="rule-banner-report" onClick={() => onClear(rule.instanceId)}>
          {rule.expiry === "timer" ? "Terminer la règle" : "Infraction constatée"}
        </button>
      ) : null}
    </li>
  );
}

export function RuleStack({
  rules,
  players,
  turnNumber,
  onClear,
}: {
  rules: ActiveRule[];
  players: Player[];
  turnNumber: number;
  onClear: (instanceId: string) => void;
}) {
  if (rules.length === 0) return null;
  return (
    <details className="rule-stack">
      <summary>
        <span aria-hidden="true">📜</span>
        <span>{rules.length} règle{rules.length > 1 ? "s" : ""} active{rules.length > 1 ? "s" : ""}</span>
        <span className="rule-stack-chevron" aria-hidden="true">⌄</span>
      </summary>
      <ol className="rule-stack-list">
        {rules.map((rule) => (
          <RuleRow
            key={rule.instanceId}
            rule={rule}
            players={players}
            turnNumber={turnNumber}
            onClear={onClear}
          />
        ))}
      </ol>
    </details>
  );
}
