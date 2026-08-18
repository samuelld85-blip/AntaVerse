import { describe, expect, it } from "vitest";
import { createGameSchema } from "./schemas";

function setupInput(teamAName: string, teamBName = "Les Comètes") {
  return {
    teamAName,
    teamBName,
    teamAColor: "#d94a72",
    teamBColor: "#22c7f2",
    startingTeamIndex: 0,
    roundsPerTeam: 5,
    turnDurationSeconds: 90,
  };
}

describe("createGameSchema team names", () => {
  it.each(["L'équipe d'Anaïs", "L’équipe d’Anaïs", "Lʼéquipe dʼAnaïs"])(
    "accepts mobile apostrophes in %s",
    (teamName) => {
      expect(createGameSchema.safeParse(setupInput(teamName)).success).toBe(true);
    },
  );

  it("treats apostrophe variants as the same team name", () => {
    const result = createGameSchema.safeParse(setupInput("L'équipe", "L’équipe"));
    expect(result.success).toBe(false);
  });

  it("still rejects HTML-like input", () => {
    expect(createGameSchema.safeParse(setupInput("<script>")).success).toBe(false);
  });
});
