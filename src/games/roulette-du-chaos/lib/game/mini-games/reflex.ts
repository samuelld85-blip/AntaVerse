// Réflexe — two-player reaction test. A false start (tapping before GO) is
// an instant loss; otherwise the faster reaction time wins.

export type ReflexResult = number | "falseStart";

export function resolveReflex(playerA: ReflexResult, playerB: ReflexResult): "a" | "b" | "tie" {
  const aFalseStart = playerA === "falseStart";
  const bFalseStart = playerB === "falseStart";
  if (aFalseStart && bFalseStart) return "tie";
  if (aFalseStart) return "b";
  if (bFalseStart) return "a";
  if (playerA === playerB) return "tie";
  return playerA < playerB ? "a" : "b";
}
