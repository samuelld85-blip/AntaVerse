import { describe, expect, it } from "vitest";
import { buildAssistantContext } from "./context";
import { buildPrepareRequest } from "./prepare-request";
import { completeSet, createEntry, defaultConfig, type Session } from "../model";

const now = new Date("2026-10-20T12:00:00Z");
function session(kind: Session["kind"], date: string, completed = true): Session {
  return {
    id: `${kind}-${date}`,
    kind,
    startedAt: date,
    endedAt: date,
    exercises: [
      completed
        ? completeSet(createEntry(defaultConfig("bench-press")), date)
        : createEntry(defaultConfig("bench-press")),
    ],
  };
}

describe("prepare request", () => {
  it.each([
    ["push", "pull"],
    ["pull", "legs"],
    ["legs", "push"],
    ["upper", "lower"],
    ["lower", "upper"],
  ] as const)("continues %s with %s from the latest completed workout", (last, next) => {
    const context = buildAssistantContext(
      [
        session(last, "2026-10-19T12:00:00Z"),
        session("full", "2026-10-18T12:00:00Z"),
        session("push", "2026-10-21T12:00:00Z"),
        session("legs", "2026-10-20T11:00:00Z", false),
      ],
      null,
      now,
    );
    const request = buildPrepareRequest(context, "  45 minutes, sans machine  ");
    expect(request).toContain(`Le prochain type du cycle est ${next}.`);
    expect(request).toContain(`Propose une séance de type ${next}`);
    expect(request).toContain("Mon orientation personnelle : 45 minutes, sans machine");
    expect(context.summary.sessions).toBe(2);
  });

  it("builds a useful request from empty history or a full-body workout", () => {
    expect(buildPrepareRequest(buildAssistantContext([], null, now), "")).toContain(
      "Aucune séance terminée exploitable",
    );
    const full = buildPrepareRequest(
      buildAssistantContext([session("full", "2026-10-19T12:00:00Z")], null, now),
      "",
    );
    expect(full).toContain("Aucun cycle Push/Pull/Legs ou Upper/Lower");
    expect(full).toContain("Je n'ai pas ajouté d'orientation personnelle.");
  });
});
