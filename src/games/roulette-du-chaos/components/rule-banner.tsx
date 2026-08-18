"use client";

import { useEffect, useState } from "react";
import type { ActiveRule } from "@/games/roulette-du-chaos/lib/game/types";

/** Compact, persistent banner for the current temporary rule (spec §66) — never obscures the wheel. */
export function RuleBanner({ rule, onClear }: { rule: ActiveRule; onClear: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const canReport = rule.expiry === "firstViolation" || rule.expiry === "timer";

  useEffect(() => {
    if (rule.expiry !== "timer" || !rule.timerEndsAt) return;
    const endsAt = new Date(rule.timerEndsAt).getTime();
    const remaining = endsAt - Date.now();
    if (remaining <= 0) {
      onClear();
      return;
    }
    const timer = window.setTimeout(onClear, remaining);
    return () => window.clearTimeout(timer);
  }, [rule.expiry, rule.timerEndsAt, onClear]);

  return (
    <div className="rule-banner">
      <button
        type="button"
        className="rule-banner-toggle"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
      >
        <span className="rule-banner-icon" aria-hidden="true">
          📜
        </span>
        <span className="rule-banner-title">RÈGLE ACTIVE — {rule.title}</span>
      </button>
      {expanded ? (
        <div className="rule-banner-detail">
          <p>{rule.description}</p>
          {canReport ? (
            <button type="button" className="rule-banner-report" onClick={onClear}>
              Infraction constatée
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
