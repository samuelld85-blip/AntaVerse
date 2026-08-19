"use client";

import { useEffect } from "react";
import type { ActiveRule } from "@/games/roulette-du-chaos/lib/game/types";

/** Persistent banner for the current temporary rule — always fully expanded. */
export function RuleBanner({
  rule,
  ownerName,
  onClear,
}: {
  rule: ActiveRule;
  ownerName: string;
  onClear: () => void;
}) {
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
      <div className="rule-banner-header">
        <span className="rule-banner-icon" aria-hidden="true">
          📜
        </span>
        <span className="rule-banner-title">
          {ownerName} — {rule.title}
        </span>
      </div>
      <div className="rule-banner-detail">
        <p>{rule.description}</p>
        {canReport ? (
          <button type="button" className="rule-banner-report" onClick={onClear}>
            Infraction constatée
          </button>
        ) : null}
      </div>
    </div>
  );
}
