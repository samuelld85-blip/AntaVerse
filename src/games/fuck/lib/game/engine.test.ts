import { describe, expect, it } from "vitest";
import { createGame, chooseNewMaster, getMaster, getTarget, resolveRound, startRound } from "./engine";

describe("Fuck engine", () => {
  it("makes the first listed player the master and starts with the next target", () => {
    const game = createGame({ playerNames: ["Alice", "Bob", "Chloé"] }, () => 0.1, 1_700_000_000_000);

    expect(getMaster(game).name).toBe("Alice");
    expect(getTarget(game).name).toBe("Bob");
    expect(game.remainingDeck).toHaveLength(52);
  });

  it("reveals one card and advances the target in entry order after a round", () => {
    const game = createGame({ playerNames: ["Alice", "Bob", "Chloé"] }, () => 0.1);
    const revealed = startRound(game, 1_700_000_000_001);
    const next = resolveRound(revealed, "master-won", 1_700_000_000_002);

    expect(revealed.phase).toBe("judging");
    expect(revealed.currentCard).not.toBeNull();
    expect(revealed.revealedCards).toHaveLength(1);
    expect(next.phase).toBe("ready");
    expect(getTarget(next).name).toBe("Chloé");
    expect(next.masterStreak).toBe(1);
  });

  it("resets the master streak after a failed round and skips the master", () => {
    const game = createGame({ playerNames: ["Alice", "Bob", "Chloé"] });
    const next = resolveRound(startRound(game), "master-failed");

    expect(next.masterStreak).toBe(0);
    expect(getTarget(next).name).toBe("Chloé");
  });

  it("lets the current master choose any other player after three wins", () => {
    const game = createGame({ playerNames: ["Alice", "Bob", "Chloé"] });
    const first = resolveRound(startRound(game), "master-won");
    const second = resolveRound(startRound(first), "master-won");
    const handoff = resolveRound(startRound(second), "master-won");

    expect(handoff.phase).toBe("handoff");
    expect(handoff.masterStreak).toBe(3);

    const next = chooseNewMaster(handoff, "player-3");
    expect(next.phase).toBe("ready");
    expect(getMaster(next).name).toBe("Chloé");
    expect(next.masterStreak).toBe(0);
    expect(getTarget(next).name).toBe("Alice");
  });
});
