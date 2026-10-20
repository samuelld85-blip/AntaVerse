import type { AssistantContext } from "../../../supabase/functions/_shared/sport-ai-contract";

const nextKind = {
  push: "pull",
  pull: "legs",
  legs: "push",
  upper: "lower",
  lower: "upper",
} as const;

/** The context contains only eligible, completed sessions from this user's carnet. */
export function buildPrepareRequest(context: AssistantContext, orientation: string): string {
  const latest = context.recentSessions[0];
  const inferred =
    latest && latest.kind in nextKind ? nextKind[latest.kind as keyof typeof nextKind] : null;
  const basis = latest
    ? `La dernière séance terminée est de type ${latest.kind} (${latest.date}). ${inferred ? `Le prochain type du cycle est ${inferred}.` : "Aucun cycle Push/Pull/Legs ou Upper/Lower ne peut être déduit de ce format."}`
    : "Aucune séance terminée exploitable n'est disponible dans le carnet.";
  const guidance = orientation.trim();
  return [
    "Prépare ma prochaine séance de musculation en prenant comme base l'ensemble de mon historique personnel fourni dans le contexte, surtout la dernière séance terminée.",
    basis,
    inferred
      ? `Propose une séance de type ${inferred}, sauf si mon orientation demande explicitement autre chose.`
      : "Propose un format adapté à mon historique et à mon orientation éventuelle.",
    guidance
      ? `Mon orientation personnelle : ${guidance}`
      : "Je n'ai pas ajouté d'orientation personnelle.",
  ].join("\n");
}
