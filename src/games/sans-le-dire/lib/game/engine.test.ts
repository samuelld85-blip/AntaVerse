import { describe, expect, it } from "vitest";
import { cards } from "@/games/sans-le-dire/data/cards";
import {
  continueGame,
  createGame,
  endRound,
  faultCard,
  foundCard,
  getCurrentCard,
  passCard,
  replayGame,
  startRound,
} from "./engine";

describe("moteur de Sans le dire", () => {
  it("enchaîne A → B → A → B avec scores, passes et cartes uniques", () => {
    let game = createGame({ teamOneName: "A", teamTwoName: "B" }, cards, seededRandom(1), 1_000);
    const seen = new Set<string>();
    for (let round = 0; round < 4; round += 1) {
      expect(game.status).toBe("preparation");
      expect(game.activeTeam).toBe(round % 2);
      game = startRound(game, 2_000 + round * 100_000);
      const id = getCurrentCard(game, cards).id;
      seen.add(id);
      game = foundCard(game, id, 2_001 + round * 100_000);
      const passId = getCurrentCard(game, cards).id;
      seen.add(passId);
      game = passCard(game, passId, 2_002 + round * 100_000);
      const faultId = getCurrentCard(game, cards).id;
      seen.add(faultId);
      game = faultCard(game, faultId, 2_003 + round * 100_000);
      expect(game.roundScore).toBe(0);
      game = endRound(game, 48_000 + round * 100_000);
      game = continueGame(game, 48_001 + round * 100_000);
    }
    expect(seen.size).toBe(12);
    expect(game.teams.map((team) => team.score)).toEqual([0, 0]);
    expect(game.mode).toBe("tiebreak");
    expect(game.activeTeam).toBe(0);
  });
  it("refuse double action, troisième passe et score après zéro", () => {
    let game = startRound(
      createGame({ teamOneName: "A", teamTwoName: "B" }, cards, seededRandom(2), 0),
      1_000,
    );
    const first = getCurrentCard(game, cards).id;
    game = foundCard(game, first, 1_001);
    expect(() => foundCard(game, first, 1_002)).toThrow(/déjà/u);
    game = passCard(game, getCurrentCard(game, cards).id, 1_003);
    game = passCard(game, getCurrentCard(game, cards).id, 1_004);
    expect(() => passCard(game, getCurrentCard(game, cards).id, 1_005)).toThrow(/passe/u);
    expect(() => foundCard(game, getCurrentCard(game, cards).id, 46_000)).toThrow(/écoulé/u);
  });
  it("retire exactement un point pour un mot interdit, même à zéro", () => {
    let game = startRound(
      createGame({ teamOneName: "A", teamTwoName: "B" }, cards, seededRandom(6), 0),
      1_000,
    );
    game = faultCard(game, getCurrentCard(game, cards).id, 1_001);
    expect(game.roundScore).toBe(-1);
    expect(game.teams[0].score).toBe(-1);
  });
  it("recommence le départage en cas d’égalité", () => {
    let game = createGame({ teamOneName: "A", teamTwoName: "B" }, cards, seededRandom(3), 0);
    game = { ...game, status: "roundResult", roundIndex: 3 };
    game = continueGame(game, 1);
    expect(game.mode).toBe("tiebreak");
    game = endRound(startRound(game, 2), 32_002);
    game = continueGame(game, 32_003);
    expect(game.activeTeam).toBe(1);
    game = endRound(startRound(game, 32_004), 62_004);
    game = continueGame(game, 62_005);
    expect(game.status).toBe("preparation");
    expect(game.tiebreakCycle).toBe(2);
    expect(game.activeTeam).toBe(0);
  });
  it("rejoue avec les noms, scores nuls et banque réinitialisée", () => {
    const game = createGame(
      { teamOneName: "Les Éclairs", teamTwoName: "Les Comètes" },
      cards,
      seededRandom(4),
      1,
    );
    const replay = replayGame({ ...game, deckPosition: 20 }, cards, seededRandom(5), 2);
    expect(replay.teams.map((team) => team.name)).toEqual(["Les Éclairs", "Les Comètes"]);
    expect(replay.teams.map((team) => team.score)).toEqual([0, 0]);
    expect(replay.deckPosition).toBe(0);
    expect(replay.deck).not.toEqual(game.deck);
  });
});
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b_79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}
