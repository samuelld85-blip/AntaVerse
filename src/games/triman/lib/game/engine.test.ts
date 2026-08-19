import { describe, expect, it } from "vitest";
import {
  createGame,
  getCurrentPlayer,
  getTrimanPlayer,
  MIN_PLAYERS,
  replayGame,
  rollForCurrentPlayer,
} from "./engine";
import { nextPlayerIndex, previousPlayerIndex } from "./players";

const PLAYER_NAMES = ["Samuel", "Emma", "Lucas", "Chloé"];

/** Maps a desired die face (1-6) to the fractional `random()` value that produces it. */
function dieValue(face: number): number {
  return (face - 1 + 0.5) / 6;
}

/** Maps a desired index out of `count` choices to the fractional `random()` value that produces it. */
function indexValue(index: number, count: number): number {
  return (index + 0.5) / count;
}

/** A `random()` stub that returns the given values in order, then throws if exhausted. */
function queueRandom(values: number[]): () => number {
  let cursor = 0;
  return () => {
    const value = values[cursor];
    cursor += 1;
    if (value === undefined) throw new Error("random queue exhausted");
    return value;
  };
}

describe("players — circular indexing", () => {
  it("wraps forward at the last index", () => {
    expect(nextPlayerIndex(3, 4)).toBe(0);
    expect(nextPlayerIndex(0, 4)).toBe(1);
  });

  it("wraps backward at index 0", () => {
    expect(previousPlayerIndex(0, 4)).toBe(3);
    expect(previousPlayerIndex(3, 4)).toBe(2);
  });
});

describe("createGame", () => {
  it("preserves player order and randomly selects the starting player, entering SEARCHING_TRIMAN", () => {
    const random = queueRandom([indexValue(0, 4), 0.5]);
    const game = createGame({ playerNames: PLAYER_NAMES }, random, 1_000);

    expect(game.players.map((player) => player.name)).toEqual(PLAYER_NAMES);
    expect(game.currentPlayerIndex).toBe(0);
    expect(game.phase).toBe("SEARCHING_TRIMAN");
    expect(game.trimanPlayerId).toBeNull();
    expect(game.lastRoll).toBeNull();
  });

  it("can start on any player depending on the random draw", () => {
    const random = queueRandom([indexValue(2, 4), 0.5]);
    const game = createGame({ playerNames: PLAYER_NAMES }, random, 1_000);
    expect(getCurrentPlayer(game).name).toBe("Lucas");
  });

  it("requires at least the minimum number of players", () => {
    expect(() => createGame({ playerNames: ["A", "B"] })).toThrow();
    expect(() => createGame({ playerNames: Array(MIN_PLAYERS).fill("Ok") })).not.toThrow();
  });

  it("rejects empty player names", () => {
    expect(() => createGame({ playerNames: ["Ana", "  ", "Bo"] })).toThrow();
  });
});

describe("SEARCHING_TRIMAN", () => {
  it("advances to the next player without finding a Triman on a non-qualifying roll", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(2), dieValue(4)]), 2_000);

    expect(game.phase).toBe("SEARCHING_TRIMAN");
    expect(game.trimanPlayerId).toBeNull();
    expect(game.currentPlayerIndex).toBe(1);
    expect(game.lastRoll).toMatchObject({ trimanFound: false, effects: [] });
  });

  it("finds the Triman on a roll containing a 3", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(1, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);

    expect(game.phase).toBe("ACTIVE_TRIMAN");
    expect(getTrimanPlayer(game)?.name).toBe("Emma");
    expect(game.lastRoll?.trimanFound).toBe(true);
  });

  it("finds the Triman on 1+2", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(1), dieValue(2)]), 2_000);

    expect(game.phase).toBe("ACTIVE_TRIMAN");
    expect(getTrimanPlayer(game)?.name).toBe("Samuel");
  });

  it("starts active play with the player right after the newly found Triman", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);

    expect(getTrimanPlayer(game)?.name).toBe("Samuel");
    expect(getCurrentPlayer(game).name).toBe("Emma");
  });

  it("never applies the ACTIVE_TRIMAN rule set while searching", () => {
    // 5+2 sums to 7 (a drinking rule during ACTIVE_TRIMAN) but contains no 3.
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(5), dieValue(2)]), 2_000);

    expect(game.phase).toBe("SEARCHING_TRIMAN");
    expect(game.lastRoll?.effects).toEqual([]);
  });
});

describe("ACTIVE_TRIMAN turn continuation", () => {
  function activeGameWithTriman() {
    // Samuel(0) starts, rolls a 3 on his search turn and becomes Triman.
    // Active play then begins with Emma(1).
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);
    return game;
  }

  it("keeps the same player active when a roll triggers at least one rule", () => {
    let game = activeGameWithTriman();
    expect(getCurrentPlayer(game).name).toBe("Emma");

    // Double 4: always triggers the doubles rule regardless of who the Triman is.
    game = rollForCurrentPlayer(game, queueRandom([dieValue(4), dieValue(4)]), 3_000);

    expect(game.currentPlayerIndex).toBe(1);
    expect(getCurrentPlayer(game).name).toBe("Emma");
    expect(game.lastRoll?.rollAgain).toBe(true);
    expect(game.lastRoll?.effects.length).toBeGreaterThan(0);
    expect(game.phase).toBe("ACTIVE_TRIMAN");
  });

  it("advances to the next player when a roll triggers no rule", () => {
    let game = activeGameWithTriman();
    // 2+4: no rule matches.
    game = rollForCurrentPlayer(game, queueRandom([dieValue(2), dieValue(4)]), 3_000);

    expect(game.lastRoll?.rollAgain).toBe(false);
    expect(game.currentPlayerIndex).toBe(2);
    expect(getCurrentPlayer(game).name).toBe("Lucas");
    expect(game.phase).toBe("ACTIVE_TRIMAN");
    expect(game.trimanPlayerId).not.toBeNull();
  });
});

describe("full Triman lifecycle", () => {
  it("keeps the Triman active through their own entire turn, then starts a new search with the next player", () => {
    // Samuel -> Emma -> Lucas -> Chloé, Samuel becomes Triman.
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);
    expect(getTrimanPlayer(game)?.name).toBe("Samuel");
    expect(getCurrentPlayer(game).name).toBe("Emma");

    // Emma, Lucas and Chloé each roll a no-effect turn; play should simply advance.
    game = rollForCurrentPlayer(game, queueRandom([dieValue(2), dieValue(4)]), 3_000); // Emma -> Lucas
    expect(getCurrentPlayer(game).name).toBe("Lucas");
    expect(game.phase).toBe("ACTIVE_TRIMAN");

    game = rollForCurrentPlayer(game, queueRandom([dieValue(2), dieValue(4)]), 4_000); // Lucas -> Chloé
    expect(getCurrentPlayer(game).name).toBe("Chloé");
    expect(game.phase).toBe("ACTIVE_TRIMAN");

    game = rollForCurrentPlayer(game, queueRandom([dieValue(2), dieValue(4)]), 5_000); // Chloé -> Samuel
    expect(getCurrentPlayer(game).name).toBe("Samuel");
    expect(game.phase).toBe("ACTIVE_TRIMAN");
    expect(game.trimanPlayerId).toBe(getCurrentPlayer(game).id);

    // Samuel is both the current player and the Triman. Rolling a 3 during
    // his own turn must still trigger the Triman effect and keep him rolling.
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(4)]), 6_000);
    expect(game.phase).toBe("ACTIVE_TRIMAN");
    expect(game.trimanPlayerId).not.toBeNull();
    expect(getCurrentPlayer(game).name).toBe("Samuel");
    expect(game.lastRoll?.rollAgain).toBe(true);
    expect(game.lastRoll?.effects.some((effect) => effect.kind === "triman")).toBe(true);

    // Samuel's next roll triggers nothing: his turn — and his Triman cycle — end.
    game = rollForCurrentPlayer(game, queueRandom([dieValue(2), dieValue(4)]), 7_000);
    expect(game.phase).toBe("SEARCHING_TRIMAN");
    expect(game.trimanPlayerId).toBeNull();
    expect(getCurrentPlayer(game).name).toBe("Emma");
  });
});

describe("replayGame", () => {
  it("keeps the same players in the same order and starts a fresh search", () => {
    const first = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    const replay = replayGame(first, queueRandom([indexValue(2, 4), 0.5]), 2_000);

    expect(replay.players.map((player) => player.name)).toEqual(PLAYER_NAMES);
    expect(replay.phase).toBe("SEARCHING_TRIMAN");
    expect(replay.trimanPlayerId).toBeNull();
    expect(getCurrentPlayer(replay).name).toBe("Lucas");
  });
});

describe("roll integrity — stored dice matches evaluated dice", () => {
  it("4+4 double: displayed dice match the evaluated double rule", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    // Find the Triman first
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);
    expect(game.phase).toBe("ACTIVE_TRIMAN");

    // Now roll a 4+4 in ACTIVE phase
    game = rollForCurrentPlayer(game, queueRandom([dieValue(4), dieValue(4)]), 3_000);

    // Verify: lastRoll.dice must be exactly [4, 4]
    expect(game.lastRoll).toBeDefined();
    expect(game.lastRoll!.dice).toEqual({ a: 4, b: 4 });

    // Verify: the effects must include ONLY the double rule for 4
    const doubleEffect = game.lastRoll!.effects.find((e) => e.kind === "double");
    expect(doubleEffect).toBeDefined();
    expect(doubleEffect!.headline).toBe("Double 4");
    expect(game.lastRoll!.effects).toHaveLength(1);
  });

  it("1+2 Triman: displayed dice match the evaluated Triman rule", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    // Start in ACTIVE_TRIMAN by finding a Triman first
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);
    expect(game.phase).toBe("ACTIVE_TRIMAN");

    // Roll 1+2 (sum=3, which triggers Triman)
    game = rollForCurrentPlayer(game, queueRandom([dieValue(1), dieValue(2)]), 3_000);

    expect(game.lastRoll).toBeDefined();
    expect(game.lastRoll!.dice).toEqual({ a: 1, b: 2 });

    const trimanEffect = game.lastRoll!.effects.find((e) => e.kind === "triman");
    expect(trimanEffect).toBeDefined();
    expect(game.lastRoll!.effects).toHaveLength(1);
  });

  it("6+4 must NOT show 2 doigts in effects", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    // Find Triman
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);

    // Roll 6+4
    game = rollForCurrentPlayer(game, queueRandom([dieValue(6), dieValue(4)]), 3_000);

    expect(game.lastRoll).toBeDefined();
    expect(game.lastRoll!.dice).toEqual({ a: 6, b: 4 });

    const twoFingersEffect = game.lastRoll!.effects.find((e) => e.kind === "reflex-finger-2");
    expect(twoFingersEffect).toBeUndefined();
  });

  it("3+6 must show BOTH Triman AND Poing effects", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    // Find Triman (Samuel finds it on 3+5)
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);
    expect(game.trimanPlayerId).toBe("player-0"); // Samuel is Triman
    expect(game.phase).toBe("ACTIVE_TRIMAN");

    // Emma (current player) rolls 3+6
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(6)]), 3_000);

    expect(game.lastRoll).toBeDefined();
    expect(game.lastRoll!.dice).toEqual({ a: 3, b: 6 });

    // Must have both Triman and Poing effects
    const trimanEffect = game.lastRoll!.effects.find((e) => e.kind === "triman");
    const fistEffect = game.lastRoll!.effects.find((e) => e.kind === "reflex-fist");

    expect(trimanEffect).toBeDefined();
    expect(fistEffect).toBeDefined();
    expect(fistEffect!.headline).toBe("Poing !");
    expect(game.lastRoll!.effects).toHaveLength(2);
  });

  it("[4, 3] must show BOTH Triman AND sum-seven effects", () => {
    let game = createGame(
      { playerNames: PLAYER_NAMES },
      queueRandom([indexValue(0, 4), 0.5]),
      1_000,
    );
    // Find Triman first (Samuel finds it)
    game = rollForCurrentPlayer(game, queueRandom([dieValue(3), dieValue(5)]), 2_000);
    expect(game.phase).toBe("ACTIVE_TRIMAN");

    // Now Emma (index 1, current player) rolls [4, 3]
    game = rollForCurrentPlayer(game, queueRandom([dieValue(4), dieValue(3)]), 3_000);

    expect(game.lastRoll).toBeDefined();
    expect(game.lastRoll!.dice).toEqual({ a: 4, b: 3 });

    // Must have both Triman and sum-seven effects
    const trimanEffect = game.lastRoll!.effects.find((e) => e.kind === "triman");
    const sevenEffect = game.lastRoll!.effects.find((e) => e.kind === "sum-seven");

    expect(trimanEffect).toBeDefined();
    expect(trimanEffect!.headline).toBe("Triman");
    expect(sevenEffect).toBeDefined();
    expect(sevenEffect!.headline).toBe("7 : Le joueur précédent boit");
    expect(game.lastRoll!.effects).toHaveLength(2);
  });
});
