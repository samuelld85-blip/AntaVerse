import { describe, expect, it } from "vitest";
import { DUO_ROUNDS, getDuo } from "@/games/ethnoguessr/data/duos";
import { getCountry } from "@/games/ethnoguessr/lib/geo/countries";
import {
  createGame,
  currentDuoId,
  MAX_TOTAL_SCORE,
  nextRound,
  ROUND_COUNT,
  startGuessing,
  submitGuess,
  totalScore,
} from "./engine";

function fixedRandom(sequence: number[]): () => number {
  let index = 0;
  return () => sequence[index++ % sequence.length]!;
}

describe("createGame", () => {
  it("picks ROUND_COUNT distinct duos and starts on the viewing phase", () => {
    const game = createGame(fixedRandom([0.1, 0.4, 0.7, 0.2, 0.9]));
    expect(game.status).toBe("playing");
    expect(game.phase).toBe("viewing");
    expect(game.currentRoundIndex).toBe(0);
    expect(game.duoIds).toHaveLength(ROUND_COUNT);
    expect(new Set(game.duoIds).size).toBe(ROUND_COUNT);
    expect(game.outcomes).toHaveLength(0);
  });
});

describe("full round lifecycle", () => {
  it("moves viewing -> guessing -> result -> next round, scoring an exact guess at 5", () => {
    let game = createGame();
    const duo = getDuo(currentDuoId(game))!;
    const target = getCountry(duo.countryId)!;

    game = startGuessing(game);
    expect(game.phase).toBe("guessing");

    game = submitGuess(game, { lat: target.lat, lon: target.lon, countryId: duo.countryId });
    expect(game.phase).toBe("result");
    expect(game.outcomes).toHaveLength(1);
    expect(game.outcomes[0]!.points).toBe(5);
    expect(game.outcomes[0]!.distanceKm).toBeCloseTo(0, 3);

    game = nextRound(game);
    expect(game.currentRoundIndex).toBe(1);
    expect(game.phase).toBe("viewing");
  });

  it("ignores submitGuess outside the guessing phase", () => {
    const game = createGame();
    const duo = getDuo(currentDuoId(game))!;
    const unchanged = submitGuess(game, { lat: 0, lon: 0 });
    expect(unchanged).toBe(game);
    expect(duo).toBeTruthy();
  });

  it("completes the game after the last round and reports the total score", () => {
    let game = createGame();
    for (let round = 0; round < ROUND_COUNT; round++) {
      const duo = getDuo(currentDuoId(game))!;
      const target = getCountry(duo.countryId)!;
      game = startGuessing(game);
      game = submitGuess(game, { lat: target.lat, lon: target.lon });
      expect(game.outcomes[round]!.points).toBe(5);
      game = nextRound(game);
    }
    expect(game.status).toBe("completed");
    expect(game.completedAt).not.toBeNull();
    expect(totalScore(game)).toBe(MAX_TOTAL_SCORE);
  });
});

describe("DUO_ROUNDS content", () => {
  it("every duo references a country that exists in the geo dataset", () => {
    for (const duo of DUO_ROUNDS) {
      expect(getCountry(duo.countryId), `missing country for duo ${duo.id}`).toBeDefined();
    }
  });
});
