import { describe, expect, it } from "vitest";
import { cards } from "@/games/sans-le-dire/data/cards";
import {
  MAX_SOLO_PLAYERS,
  MIN_SOLO_PLAYERS,
  SOLO_WORDS_PER_MASTER,
  awardSoloPoint,
  createSoloGame,
  getCurrentSoloCard,
  getSoloRank,
  getSoloRanking,
  replaySoloGame,
  startSoloTurn,
} from "./solo-engine";

describe("moteur individuel de Sans le dire", () => {
  it("fait tourner les maîtres dans l'ordre saisi, chacun une seule fois", () => {
    let game = createSoloGame({ playerNames: ["Alice", "Bob", "Chloé"] }, cards, seededRandom(1), 0);
    expect(game.status).toBe("handoff");
    expect(game.masterIndex).toBe(0);

    game = startSoloTurn(game, 1);
    expect(game.status).toBe("playing");

    // Alice fait deviner 8 mots, tous trouvés par Bob.
    for (let i = 0; i < SOLO_WORDS_PER_MASTER; i += 1) {
      const card = getCurrentSoloCard(game, cards);
      game = awardSoloPoint(game, "player-2", card.id, 2 + i);
    }
    expect(game.status).toBe("handoff");
    expect(game.masterIndex).toBe(1);
    expect(game.wordIndex).toBe(0);

    game = startSoloTurn(game, 100);
    for (let i = 0; i < SOLO_WORDS_PER_MASTER; i += 1) {
      const card = getCurrentSoloCard(game, cards);
      game = awardSoloPoint(game, "player-3", card.id, 101 + i);
    }
    expect(game.status).toBe("handoff");
    expect(game.masterIndex).toBe(2);

    game = startSoloTurn(game, 200);
    for (let i = 0; i < SOLO_WORDS_PER_MASTER; i += 1) {
      const card = getCurrentSoloCard(game, cards);
      game = awardSoloPoint(game, "player-1", card.id, 201 + i);
    }
    expect(game.status).toBe("finished");

    expect(game.players.map((p) => p.score)).toEqual([8, 8, 8]);
  });

  it("distribue exactement 8 mots par maître (5 joueurs → 40 mots)", () => {
    let game = createSoloGame(
      { playerNames: ["Alice", "Bob", "Chloé", "David", "Emma"] },
      cards,
      seededRandom(2),
      0,
    );
    expect(game.deck.length).toBe(40);

    let wordsPlayed = 0;
    for (let master = 0; master < 5; master += 1) {
      game = startSoloTurn(game, master * 1_000);
      for (let i = 0; i < SOLO_WORDS_PER_MASTER; i += 1) {
        const card = getCurrentSoloCard(game, cards);
        const others = game.players.filter((p) => p.id !== game.players[game.masterIndex]!.id);
        game = awardSoloPoint(game, others[0]!.id, card.id, master * 1_000 + i + 1);
        wordsPlayed += 1;
      }
    }
    expect(wordsPlayed).toBe(40);
    expect(game.status).toBe("finished");
  });

  it("refuse qu'un mot déjà résolu soit résolu une seconde fois (protection double tap)", () => {
    let game = startSoloTurn(
      createSoloGame({ playerNames: ["Alice", "Bob", "Chloé"] }, cards, seededRandom(3), 0),
      1,
    );
    const card = getCurrentSoloCard(game, cards);
    game = awardSoloPoint(game, "player-2", card.id, 2);
    expect(() => awardSoloPoint(game, "player-3", card.id, 3)).toThrow(/déjà/u);
  });

  it("refuse que le maître du jeu marque un point pendant son propre tour", () => {
    const game = startSoloTurn(
      createSoloGame({ playerNames: ["Alice", "Bob", "Chloé"] }, cards, seededRandom(4), 0),
      1,
    );
    const card = getCurrentSoloCard(game, cards);
    expect(() => awardSoloPoint(game, "player-1", card.id, 2)).toThrow();
  });

  it("valide le nombre de joueurs (min/max)", () => {
    expect(() =>
      createSoloGame({ playerNames: Array(MIN_SOLO_PLAYERS - 1).fill("Ok") }, cards),
    ).toThrow();
    expect(() =>
      createSoloGame({ playerNames: Array(MAX_SOLO_PLAYERS).fill("Ok") }, cards),
    ).not.toThrow();
    expect(() =>
      createSoloGame({ playerNames: Array(MAX_SOLO_PLAYERS + 1).fill("Ok") }, cards),
    ).toThrow();
  });

  it("classe les joueurs par score décroissant et gère les égalités", () => {
    let game = createSoloGame({ playerNames: ["Alice", "Bob", "Chloé"] }, cards, seededRandom(5), 0);
    game = { ...game, players: [
      { id: "player-1", name: "Alice", score: 3 },
      { id: "player-2", name: "Bob", score: 8 },
      { id: "player-3", name: "Chloé", score: 8 },
    ] };
    const ranking = getSoloRanking(game);
    expect(ranking.map((p) => p.name)).toEqual(["Bob", "Chloé", "Alice"]);
    expect(getSoloRank(ranking, ranking[0]!)).toBe(1);
    expect(getSoloRank(ranking, ranking[1]!)).toBe(1);
    expect(getSoloRank(ranking, ranking[2]!)).toBe(3);
  });

  it("rejoue avec les mêmes noms, scores nuls et banque réinitialisée", () => {
    const game = createSoloGame(
      { playerNames: ["Alice", "Bob", "Chloé"] },
      cards,
      seededRandom(6),
      1,
    );
    const replay = replaySoloGame({ ...game, deckPosition: 5 }, cards, seededRandom(7), 2);
    expect(replay.players.map((p) => p.name)).toEqual(["Alice", "Bob", "Chloé"]);
    expect(replay.players.map((p) => p.score)).toEqual([0, 0, 0]);
    expect(replay.deckPosition).toBe(0);
    expect(replay.status).toBe("handoff");
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
