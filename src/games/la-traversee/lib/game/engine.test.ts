import { describe, expect, it } from "vitest";
import { CARD_VALUES } from "../../data/deck";
import { advanceAfterFeedback, createGame, getSelectablePositions, resolveGuess, selectCard } from "./engine";
import type { Card, GameState, Guess } from "./types";

function winningGuess(reference: Card, drawn: Card): Guess { return CARD_VALUES.indexOf(drawn.value) > CARD_VALUES.indexOf(reference.value) ? "higher" : "lower"; }
function firstGame(): GameState { return createGame({ playerNames: ["Alice", "Bob"] }, () => 0.42, 1_000); }
describe("La Traversée engine", () => {
  it("deals a complete board with both visible endpoints and no active card", () => {
    const game = firstGame();
    expect(game.currentPosition).toBeNull();
    expect(game.board.lanes.top).toHaveLength(4);
    expect(game.board.lanes.middle).toHaveLength(3);
    expect(game.board.lanes.bottom).toHaveLength(4);
    expect(game.remainingDeck).toHaveLength(39);
  });

  it("activates the endpoint only after it is tapped", () => {
    let game = firstGame();
    game = selectCard(game, { zone: "start" });
    expect(game.phase).toBe("guessing");
    expect(game.direction).toBe("left-to-right");
    expect(game.currentPosition).toEqual({ zone: "start" });
  });

  it("draws a card, replaces the estimated card and unlocks the next row choices", () => {
    let game = firstGame();
    game = selectCard(game, { zone: "start" });
    const reference = game.board.start;
    const drawn = game.remainingDeck[0]!;
    game = resolveGuess(game, winningGuess(reference, drawn));
    expect(game.lastGuess?.drawnCard).toEqual(drawn);
    expect(game.board.start).toEqual(drawn);
    game = { ...game, phase: "select-card", lastGuess: null };
    expect(getSelectablePositions(game)).toHaveLength(3);
    expect(getSelectablePositions(game).every((position) => position.zone === "lane" && position.index === 0)).toBe(true);
  });

  it("opens O4, centre 3 and bas 4 after a right-side departure", () => {
    let game = firstGame();
    game = selectCard(game, { zone: "end" });
    const reference = game.board.end;
    const drawn = game.remainingDeck[0]!;
    game = resolveGuess(game, winningGuess(reference, drawn));
    game = { ...game, phase: "select-card", lastGuess: null };
    expect(getSelectablePositions(game)).toEqual([
      { zone: "lane", lane: "top", index: 3 },
      { zone: "lane", lane: "middle", index: 2 },
      { zone: "lane", lane: "bottom", index: 3 },
    ]);
  });

  it("moves directly to the next card after the line has been chosen", () => {
    let game = firstGame();
    game = selectCard(game, { zone: "start" });
    game = resolveGuess(game, winningGuess(game.board.start, game.remainingDeck[0]!));
    game = { ...game, phase: "select-card", lastGuess: null };
    game = selectCard(game, { zone: "lane", lane: "middle", index: 0 });
    game = resolveGuess(game, winningGuess(game.board.lanes.middle[0]!, game.remainingDeck[0]!));
    game = advanceAfterFeedback(game);
    expect(game.phase).toBe("guessing");
    expect(game.currentPosition).toEqual({ zone: "lane", lane: "middle", index: 1 });
  });

  it("counts the attempted step as one sip after a failed estimate", () => {
    let game = firstGame();
    game = selectCard(game, { zone: "start" });
    const reference = game.board.start;
    const drawn = game.remainingDeck[0]!;
    const losingGuess = winningGuess(reference, drawn) === "higher" ? "lower" : "higher";
    game = resolveGuess(game, losingGuess);
    expect(game.lastGuess?.outcome).toBe("failure");
    expect(game.lastGuess?.sips).toBe(1);
    expect(game.board.start).toEqual(drawn);
  });

  it("keeps the current board when a player fails and only consumes one draw card", () => {
    let game = firstGame();
    const boardBefore = structuredClone(game.board);
    game = selectCard(game, { zone: "start" });
    const losingGuess = winningGuess(game.board.start, game.remainingDeck[0]!) === "higher" ? "lower" : "higher";
    game = resolveGuess(game, losingGuess);
    game = advanceAfterFeedback(game);
    expect(game.phase).toBe("select-card");
    expect(game.currentPlayerIndex).toBe(1);
    expect(game.remainingDeck).toHaveLength(38);
    expect(game.board.start).not.toEqual(boardBefore.start);
    expect(game.board.end).toEqual(boardBefore.end);
    expect(game.board.lanes).toEqual(boardBefore.lanes);
  });

  it("treats the Ace as the highest card", () => {
    const base = firstGame();
    const game = {
      ...base,
      phase: "guessing" as const,
      direction: "left-to-right" as const,
      currentPosition: { zone: "start" } as const,
      board: { ...base.board, start: { id: "reference-king", suit: "♠" as const, value: "K" as const } },
      remainingDeck: [{ id: "draw-ace", suit: "♥" as const, value: "A" as const }, ...base.remainingDeck.slice(1)],
    };
    const result = resolveGuess(game, "higher");
    expect(result.lastGuess?.outcome).toBe("success");
  });
});
