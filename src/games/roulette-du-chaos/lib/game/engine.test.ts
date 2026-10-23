import { describe, expect, it } from "vitest";
import { EVENTS_BY_CATEGORY } from "../../data/events";
import {
  clearActiveRule,
  completeMiniGame,
  completeTurn,
  createGame,
  dismissCursedReveal,
  dismissSecretReveal,
  finishSpin,
  getActivePlayer,
  getDisplayPlayers,
  MAX_PLAYERS,
  MIN_PLAYERS,
  replayGame,
  revealEvent,
  resolveCursedObject,
  resolveSecretChallenge,
  spinWheel,
  submitChoice,
  submitMysteryPick,
  submitNeighbor,
  submitReveal,
  submitSecretAccepted,
  submitTargets,
} from "./engine";
import { CATEGORIES } from "./wheel";
import type { CategoryId, GameState } from "./types";

const PLAYER_NAMES = ["Samuel", "Diane", "Thomas", "Emma"];

/** The exact 0..1 slot that makes `pickWeightedCategory` land on `id`. */
function categorySlot(id: CategoryId): number {
  let offset = 0;
  for (const category of CATEGORIES) {
    if (category.id === id) return (offset + category.weight * 0.5) / 100;
    offset += category.weight;
  }
  throw new Error(`unknown category ${id}`);
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

/** createGame consumes one random() call for the starting player index and a second for the game id. */
function startingIndexZero(): () => number {
  return queueRandom([0, 0.42]);
}

/**
 * Spins straight to a specific event and reveals it, replicating pickEvent's
 * own anti-repeat filtering so the target event stays reachable (and the
 * test stays correct) no matter what already happened this game.
 */
function spinToEvent(
  game: GameState,
  category: CategoryId,
  eventId: string,
  extraRandom: number[] = [],
): GameState {
  const events = EVENTS_BY_CATEGORY[category];
  const avoided = new Set(game.recentEventIds.slice(-2));
  const candidates = events.filter((event) => !avoided.has(event.id));
  const pool = candidates.length > 0 ? candidates : events;
  const index = pool.findIndex((event) => event.id === eventId);
  if (index === -1) {
    throw new Error(
      `${eventId} isn't selectable right now (anti-repeat) — pick a different id for this test`,
    );
  }
  const totalWeight = pool.reduce((sum, event) => sum + (event.weight ?? 1), 0);
  const before = pool.slice(0, index).reduce((sum, event) => sum + (event.weight ?? 1), 0);
  const slot = (before + (pool[index]!.weight ?? 1) / 2) / totalWeight;
  const random = queueRandom([categorySlot(category), slot, ...extraRandom]);
  let next = spinWheel(game, random);
  next = finishSpin(next);
  next = revealEvent(next, random);
  return next;
}

describe("createGame", () => {
  it("creates players in order and starts idle", () => {
    const game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    expect(game.players.map((player) => player.name)).toEqual(PLAYER_NAMES);
    expect(game.phase).toBe("idle");
    expect(game.activeRules).toEqual([]);
    expect(game.resolution).toBeNull();
  });

  it("enforces the player count bounds", () => {
    expect(() => createGame({ playerNames: ["A", "B"] })).toThrow();
    expect(() => createGame({ playerNames: Array(MIN_PLAYERS).fill("Ok") })).not.toThrow();
    expect(() => createGame({ playerNames: Array(MAX_PLAYERS).fill("Ok") })).not.toThrow();
    expect(() => createGame({ playerNames: Array(MAX_PLAYERS + 1).fill("Ok") })).toThrow();
  });

  it("rejects empty names", () => {
    expect(() => createGame({ playerNames: ["Ana", "  ", "Bo"] })).toThrow();
  });
});

describe("a zero-input event resolves immediately and completes the turn exactly once", () => {
  it("SUBIS s1 (Classique) needs no input at all", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const startingPlayer = getActivePlayer(game);

    game = spinToEvent(game, "SUBIS", "s1");
    expect(game.phase).toBe("event");
    expect(game.resolution?.outcome).not.toBeNull();
    expect(game.resolution?.outcome?.lines[0]).toContain(startingPlayer.name);

    game = completeTurn(game);
    expect(game.phase).toBe("idle");
    expect(game.resolution).toBeNull();
    expect(getActivePlayer(game).id).not.toBe(startingPlayer.id);

    // Completing again with no active event is a no-op — never double-advances.
    const again = completeTurn(game);
    expect(again.activePlayerIndex).toBe(game.activePlayerIndex);
  });
});

describe("target picking", () => {
  it("D11 Passe le pouvoir excludes the active player and requires exactly 1 target", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const active = getActivePlayer(game);
    game = spinToEvent(game, "DISTRIBUE", "d11");

    const pending = game.resolution?.pending;
    expect(pending?.kind).toBe("pickTargets");
    if (pending?.kind !== "pickTargets") throw new Error("expected pickTargets");
    expect(pending.min).toBe(1);
    expect(pending.max).toBe(1);
    expect(pending.excludeIds).toEqual([active.id]);

    const heir = game.players.find((player) => player.id !== active.id)!;
    game = submitTargets(game, [heir.id]);
    const lines = game.resolution?.outcome?.lines ?? [];
    expect(lines[0]).toContain(heir.name);
    // The heir may not hand sips back to the player who empowered them.
    expect(lines[1]).toContain(active.name);
  });

  it("D9 La chaîne names the first link the active player picked", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const active = getActivePlayer(game);
    game = spinToEvent(game, "DISTRIBUE", "d9");

    const first = game.players.find((player) => player.id !== active.id)!;
    game = submitTargets(game, [first.id]);
    expect(game.resolution?.outcome?.lines[0]).toContain(first.name);
    expect(game.resolution?.outcome?.lines[0]).toContain("1 gorgée");
  });

  it("D7 Un pour chacun guides three distinct targets", () => {
    let game = createGame({ playerNames: ["Samuel", "Diane", "Thomas"] }, startingIndexZero());
    game = spinToEvent(game, "DISTRIBUE", "d7");
    expect(game.resolution?.pending?.kind).toBe("pickTargets");
    expect(submitTargets(game, [game.players[0]!.id, game.players[0]!.id])).toBe(game);
    game = submitTargets(
      game,
      game.players.map((player) => player.id),
    );
    expect(game.resolution?.outcome?.lines).toHaveLength(3);
    expect(game.resolution?.outcome?.lines[0]).toContain("Samuel");
  });

  it("D4 guides two other players and names both recipients", () => {
    let game = createGame({ playerNames: ["Samuel", "Diane", "Thomas"] }, startingIndexZero());
    game = spinToEvent(game, "DISTRIBUE", "d4");
    expect(game.resolution?.pending?.kind).toBe("pickTargets");
    expect(submitTargets(game, [game.players[0]!.id, game.players[1]!.id])).toBe(game);
    game = submitTargets(game, [game.players[1]!.id, game.players[2]!.id]);
    expect(game.resolution?.outcome?.lines.join(" ")).toContain("Diane");
    expect(game.resolution?.outcome?.lines.join(" ")).toContain("Thomas");
  });
});

describe("neighbor picking wraps around", () => {
  it("D5 Voisinage resolves left/right relative to the active player, wrapping at the ends", () => {
    const game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero()); // active = index 0 (Samuel)

    let withLeft = spinToEvent(game, "DISTRIBUE", "d5");
    withLeft = submitNeighbor(withLeft, "left");
    // index 0's left neighbor wraps to the last player (Emma).
    expect(withLeft.resolution?.outcome?.lines[0]).toContain("Emma");

    let withRight = spinToEvent(game, "DISTRIBUE", "d5");
    withRight = submitNeighbor(withRight, "right");
    expect(withRight.resolution?.outcome?.lines[0]).toContain("Diane");
  });
});

describe("temporary rules", () => {
  it("ends a shield before its owner's next turn and can consume it early", () => {
    let game = createGame({ playerNames: ["Samuel", "Diane", "Thomas"] }, startingIndexZero());
    game = spinToEvent(game, "CHOISIS", "c11");
    game = submitChoice(game, "bouclier");
    expect(game.activeRules.some((rule) => rule.ruleId === "c11")).toBe(true);
    const instanceId = game.activeRules.find((rule) => rule.ruleId === "c11")!.instanceId;
    expect(clearActiveRule(game, instanceId).activeRules).toEqual([]);
    game = completeTurn(game);
    expect(game.activeRules).toHaveLength(1);
    for (let i = 0; i < 2; i += 1) {
      game = spinToEvent(game, "SUBIS", i === 0 ? "s1" : "s2");
      game = completeTurn(game);
    }
    expect(game.activeRules).toEqual([]);
  });
  it("R1 lasts four table laps and coexists with another rule", () => {
    let game = createGame({ playerNames: ["Samuel", "Diane", "Thomas"] }, startingIndexZero());
    game = spinToEvent(game, "REGLE", "r1");
    expect(game.activeRules.map((rule) => rule.ruleId)).toEqual(["r1"]);
    game = completeTurn(game);
    game = spinToEvent(game, "REGLE", "r2");
    expect(game.activeRules.map((rule) => rule.ruleId)).toEqual(["r1", "r2"]);
    game = completeTurn(game);
    for (let i = 0; i < 11; i += 1) {
      game = spinToEvent(game, "SUBIS", ["s1", "s2", "s3"][i % 3]!);
      game = completeTurn(game);
    }
    expect(game.activeRules.some((rule) => rule.ruleId === "r1")).toBe(false);
  });

  it("keeps at most four rules and refreshes duplicates", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    for (const id of ["r1", "r2", "r3", "r5", "r6", "r7", "r8", "r6"]) {
      game = spinToEvent(game, "REGLE", id, [0.42]);
      game = completeTurn(game);
    }
    expect(game.activeRules).toHaveLength(4);
    expect(game.activeRules.filter((rule) => rule.ruleId === "r6")).toHaveLength(1);
  });

  it("clearActiveRule manually ends a firstViolation/timer rule", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "REGLE", "r5");
    expect(game.activeRules).toHaveLength(1);
    game = clearActiveRule(game);
    expect(game.activeRules).toEqual([]);
  });
});

describe("new chaos effects", () => {
  it("guides Fais-le dire and penalizes the player who says the word", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "DUEL", "dl17", [0.1]);
    const defender = game.players[1]!;
    game = submitTargets(game, [defender.id], queueRandom([0.1]));
    expect(game.resolution?.pending?.kind).toBe("wordDuel");
    game = submitChoice(game, "defenderSaid");
    expect(game.resolution?.outcome?.lines.join(" ")).toContain(defender.name);
    expect(game.resolution?.outcome?.lines.join(" ")).toContain(`${defender.name} boit 2`);
  });

  it("keeps a clandestine mission hidden until the owner reveals success", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "CHOISIS", "sc1", [0.1]);
    expect(game.resolution?.pending?.kind).toBe("secretChallenge");
    expect(game.secretChallenges).toEqual([]);
    game = submitSecretAccepted(game);
    expect(game.resolution?.outcome?.lines.join(" ")).not.toContain(game.secretChallenges[0]?.task);
    expect(game.secretChallenges).toHaveLength(1);
    const mission = game.secretChallenges[0]!;
    game = completeTurn(game);
    game = resolveSecretChallenge(game, mission.instanceId, true);
    expect(game.secretChallenges).toEqual([]);
    expect(game.secretReveal?.task).toBe(mission.task);
    expect(game.secretReveal?.sips).toBe(3);
    expect(spinWheel(game)).toBe(game);
    game = dismissSecretReveal(game);
    expect(game.secretReveal).toBeNull();
  });

  it("lets the table unmask a clandestine mission", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = submitSecretAccepted(spinToEvent(game, "CHOISIS", "sc1", [0.2]));
    const mission = game.secretChallenges[0]!;
    game = completeTurn(game);
    game = resolveSecretChallenge(game, mission.instanceId, false);
    expect(game.secretReveal?.success).toBe(false);
    expect(game.secretReveal?.sips).toBe(1);
  });

  it("asks for the holder of a cursed object after four more spins", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "DESTIN", "co1");
    expect(game.resolution?.pending?.kind).toBe("choice");
    game = submitChoice(game, "verre");
    game = submitTargets(game, [game.players[0]!.id]);
    expect(game.cursedObjects).toHaveLength(1);
    game = completeTurn(game);
    for (const id of ["s1", "s2", "s3", "s4"]) {
      game = completeTurn(spinToEvent(game, "SUBIS", id));
    }
    expect(game.cursedObjects[0]?.dueTurn).toBe(game.turnNumber);
    expect(spinWheel(game)).toBe(game);
    game = resolveCursedObject(game, game.cursedObjects[0]!.instanceId, game.players[2]!.id);
    expect(game.cursedReveal?.holderId).toBe(game.players[2]!.id);
    game = dismissCursedReveal(game);
    expect(game.cursedReveal).toBeNull();
  });

  it("swaps displayed names while preserving real player IDs", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const originalIds = game.players.map((player) => player.id);
    game = spinToEvent(game, "REGLE", "r35");
    game = submitTargets(game, [game.players[0]!.id, game.players[1]!.id]);
    expect(game.activeRules[0]?.identitySwap).toEqual(originalIds.slice(0, 2));
    expect(
      getDisplayPlayers(game)
        .map((player) => player.name)
        .slice(0, 2),
    ).toEqual(["Diane", "Samuel"]);
    expect(game.players.map((player) => player.id)).toEqual(originalIds);
    expect(game.players.map((player) => player.name)).toEqual(PLAYER_NAMES);
  });
});

describe("mini-games never double-advance the turn", () => {
  it("a DUEL event runs through a mini-game and completes the turn exactly once", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const active = getActivePlayer(game);
    game = spinToEvent(game, "DUEL", "dl1"); // reflex

    const opponent = game.players.find((player) => player.id !== active.id)!;
    game = submitTargets(game, [opponent.id]);
    expect(game.phase).toBe("miniGame");
    expect(game.miniGame?.kind).toBe("reflex");
    expect(game.miniGame?.playerAId).toBe(active.id);
    expect(game.miniGame?.playerBId).toBe(opponent.id);

    game = completeMiniGame(game, {
      mode: "duel",
      winnerId: active.id,
      loserId: opponent.id,
      success: null,
      tie: false,
    });
    expect(game.phase).toBe("event");
    expect(game.resolution?.outcome?.lines.join(" ")).toContain(opponent.name);

    const before = game.activePlayerIndex;
    game = completeTurn(game);
    expect(game.activePlayerIndex).toBe((before + 1) % game.players.length);

    // Rapidly tapping "complete" again must not advance a second time.
    const again = completeTurn(game);
    expect(again.activePlayerIndex).toBe(game.activePlayerIndex);
  });

  it("a tied mini-game result asks the event to replay it, not to finish", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const active = getActivePlayer(game);
    game = spinToEvent(game, "DUEL", "dl1");
    const opponent = game.players.find((player) => player.id !== active.id)!;
    game = submitTargets(game, [opponent.id]);

    game = completeMiniGame(game, {
      mode: "duel",
      winnerId: null,
      loserId: null,
      success: null,
      tie: true,
    });
    expect(game.phase).toBe("miniGame");
    expect(game.resolution?.outcome).toBeNull();
  });
});

describe("J5 Royal Duel", () => {
  it("picks an opponent, runs the duel, then names the winner as the distributor", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const active = getActivePlayer(game);
    game = spinToEvent(game, "JACKPOT", "j5");

    const opponent = game.players.find((player) => player.id !== active.id)!;
    game = submitTargets(game, [opponent.id]);
    expect(game.phase).toBe("miniGame");

    game = completeMiniGame(game, {
      mode: "duel",
      winnerId: opponent.id,
      loserId: active.id,
      success: null,
      tie: false,
    });
    expect(game.phase).toBe("event");
    expect(game.resolution?.pending).toBeNull();
    expect(game.resolution?.outcome?.headline).toBe("Royal Duel");
    expect(game.resolution?.outcome?.lines[0]).toContain(opponent.name);
  });
});

describe("J8 Roi de la roulette", () => {
  it("pays 9 sips when the challenger wins the Duel Royal and 4 when they lose", () => {
    const base = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    const active = getActivePlayer(base);
    const opponent = base.players.find((player) => player.id !== active.id)!;

    function playDuel(winnerId: string): GameState {
      let game = spinToEvent(base, "JACKPOT", "j8");
      game = submitChoice(game, "duel");
      game = submitTargets(game, [opponent.id]);
      expect(game.phase).toBe("miniGame");
      return completeMiniGame(game, {
        mode: "duel",
        winnerId,
        loserId: winnerId === active.id ? opponent.id : active.id,
        success: null,
        tie: false,
      });
    }

    const won = playDuel(active.id);
    expect(won.resolution?.outcome?.lines[0]).toContain("9 gorgées");

    const lost = playDuel(opponent.id);
    expect(lost.resolution?.outcome?.lines[0]).toContain(active.name);
    expect(lost.resolution?.outcome?.lines[0]).toContain("4 gorgées");
  });
});

describe("event catalogue", () => {
  it("keeps Nombre maudit hidden until the group reveals the card", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "TOUS", "t7", [0.42]);

    expect(game.resolution?.pending?.kind).toBe("reveal");
    expect(game.resolution?.outcome).toBeNull();

    game = submitReveal(game);
    expect(game.resolution?.pending).toBeNull();
    expect(game.resolution?.outcome?.lines[0]).toBe("Nombre maudit : 3");
  });

  it("keeps eight categories and unique event ids", () => {
    const categories = Object.keys(EVENTS_BY_CATEGORY) as CategoryId[];
    expect(categories).toHaveLength(8);

    const ids = new Set<string>();
    for (const category of categories) {
      const events = EVENTS_BY_CATEGORY[category];
      expect(events.length).toBeGreaterThanOrEqual(12);
      for (const event of events) {
        expect(event.category).toBe(category);
        expect(event.title.length).toBeGreaterThan(0);
        expect(event.prompt.length).toBeGreaterThan(0);
        expect(ids.has(event.id)).toBe(false);
        ids.add(event.id);
      }
    }
    expect(ids.size).toBeGreaterThan(96);
  });

  it("resolves every event to an outcome from a plain first spin, whatever it asks for", () => {
    // Guards against an event that can never reach `done` — every rule must be
    // reachable and finishable with only the engine's existing primitives.
    for (const category of Object.keys(EVENTS_BY_CATEGORY) as CategoryId[]) {
      for (const event of EVENTS_BY_CATEGORY[category]) {
        let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
        // Generous random supply: some events draw a slot per player.
        game = spinToEvent(game, category, event.id, Array<number>(40).fill(0.42));

        for (let step = 0; step < 6 && !game.resolution?.outcome; step += 1) {
          if (game.phase === "miniGame") {
            const session = game.miniGame!;
            game = completeMiniGame(game, {
              mode: session.mode,
              winnerId: session.playerAId,
              loserId: session.playerBId ?? session.playerAId,
              success: true,
              tie: false,
            });
            continue;
          }
          const pending = game.resolution?.pending;
          if (!pending) break;
          if (pending.kind === "pickTargets") {
            const pool = game.players.filter((player) => !pending.excludeIds.includes(player.id));
            game = submitTargets(
              game,
              pool.slice(0, pending.min).map((player) => player.id),
            );
          } else if (pending.kind === "pickNeighbor") {
            game = submitNeighbor(game, "left");
          } else if (pending.kind === "choice") {
            game = submitChoice(game, pending.options[0]!.key);
          } else if (pending.kind === "mysteryPick") {
            game = submitMysteryPick(game, 0);
          } else if (pending.kind === "reveal") {
            game = submitReveal(game);
          } else if (pending.kind === "secretChallenge") {
            game = submitSecretAccepted(game);
          } else if (pending.kind === "wordDuel") {
            game = submitChoice(game, "held");
          }
        }

        expect(game.resolution?.outcome, `${event.id} never resolved`).toBeTruthy();
        expect(game.resolution?.outcome?.lines.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("choices", () => {
  it("SUBIS s5 Sauve-toi: taking the sips ends the event without a mini-game", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "SUBIS", "s5");
    expect(game.resolution?.pending?.kind).toBe("choice");
    game = submitChoice(game, "prendre");
    expect(game.phase).toBe("event");
    expect(game.resolution?.outcome).not.toBeNull();
    expect(game.miniGame).toBeNull();
  });
});

describe("replayGame", () => {
  it("resets to a clean idle state, keeping the same player names", () => {
    let game = createGame({ playerNames: PLAYER_NAMES }, startingIndexZero());
    game = spinToEvent(game, "REGLE", "r1");
    expect(game.activeRules).toHaveLength(1);

    const restarted = replayGame(game, startingIndexZero());
    expect(restarted.players.map((player) => player.name)).toEqual(PLAYER_NAMES);
    expect(restarted.phase).toBe("idle");
    expect(restarted.activeRules).toEqual([]);
    expect(restarted.resolution).toBeNull();
    expect(restarted.miniGame).toBeNull();
    expect(restarted.recentEventIds).toEqual([]);
  });
});
