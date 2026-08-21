import { describe, expect, it } from "vitest";
import { resolveReflex } from "./reflex";
import { resolveStopTimerDuel, resolveStopTimerSolo, STOP_TIMER_TARGET_MS } from "./stop-timer";
import { drawPlusMinusValue, resolvePlusMinus } from "./plus-minus";
import { drawSecretTarget, resolveSecretNumber } from "./secret-number";
import { resolveEstimation } from "./estimation";
import { resolveTapBattle } from "./tap-battle";
import { drawBinaryResult, resolveBinaryPrediction } from "./binary-prediction";

describe("stop timer", () => {
  it("declares the closest-to-target elapsed time the winner", () => {
    expect(resolveStopTimerDuel(4_900, 5_200)).toBe("a");
    expect(resolveStopTimerDuel(5_300, 5_050)).toBe("b");
  });

  it("ties when both are equally close", () => {
    expect(resolveStopTimerDuel(4_800, 5_200)).toBe("tie");
  });

  it("solo mode succeeds only within tolerance", () => {
    expect(resolveStopTimerSolo(STOP_TIMER_TARGET_MS)).toBe(true);
    expect(resolveStopTimerSolo(4_750)).toBe(true);
    expect(resolveStopTimerSolo(4_600)).toBe(false);
    expect(resolveStopTimerSolo(5_400)).toBe(false);
  });
});

describe("reflex", () => {
  it("a false start is an instant loss", () => {
    expect(resolveReflex("falseStart", 300)).toBe("b");
    expect(resolveReflex(300, "falseStart")).toBe("a");
  });

  it("both false-starting is a tie", () => {
    expect(resolveReflex("falseStart", "falseStart")).toBe("tie");
  });

  it("the faster reaction wins", () => {
    expect(resolveReflex(220, 400)).toBe("a");
    expect(resolveReflex(400, 220)).toBe("b");
  });
});

describe("plus ou moins", () => {
  it("redraws deterministically when the draw would equal the start value", () => {
    // slotValue chosen so the naive draw lands exactly on `start`.
    const drawn = drawPlusMinusValue(7, (7 - 1) / 13, 1, 13);
    expect(drawn).not.toBe(7);
  });

  it("both players guessing the same and being right means nobody loses", () => {
    expect(resolvePlusMinus(5, 9, "plus", "plus")).toBe("bothCorrect");
  });

  it("both players guessing the same and being wrong means both lose", () => {
    expect(resolvePlusMinus(5, 2, "plus", "plus")).toBe("bothWrong");
  });

  it("opposite guesses: whoever is right wins", () => {
    expect(resolvePlusMinus(5, 9, "plus", "moins")).toBe("aWins");
    expect(resolvePlusMinus(5, 2, "plus", "moins")).toBe("bWins");
  });

  it("direction is determined by comparing drawn value to start", () => {
    // drawn > start → "plus" is correct
    expect(resolvePlusMinus(5, 6, "plus", "moins")).toBe("aWins");
    expect(resolvePlusMinus(5, 13, "plus", "moins")).toBe("aWins");
    // drawn < start → "moins" is correct
    expect(resolvePlusMinus(5, 4, "moins", "plus")).toBe("aWins");
    expect(resolvePlusMinus(5, 1, "moins", "plus")).toBe("aWins");
  });
});

describe("secret number", () => {
  it("draws within the given range", () => {
    for (let slot = 0; slot < 1; slot += 0.1) {
      const value = drawSecretTarget(slot, 1, 10);
      expect(value).toBeGreaterThanOrEqual(1);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it("closest guess wins, exact ties tie", () => {
    expect(resolveSecretNumber(7, 6, 9)).toBe("a");
    expect(resolveSecretNumber(7, 5, 9)).toBe("tie");
  });
});

describe("estimation", () => {
  it("closest guess to the real answer wins", () => {
    expect(resolveEstimation(88, 85, 60)).toBe("a");
    expect(resolveEstimation(88, 88, 90)).toBe("a");
    expect(resolveEstimation(100, 40, 95)).toBe("b");
  });

  it("ties when both guesses are equidistant from the real answer", () => {
    expect(resolveEstimation(50, 45, 55)).toBe("tie");
    expect(resolveEstimation(100, 80, 120)).toBe("tie");
  });
});

describe("tap battle", () => {
  it("highest count wins, equal counts tie", () => {
    expect(resolveTapBattle(30, 22)).toBe("a");
    expect(resolveTapBattle(10, 10)).toBe("tie");
  });
});

describe("binary prediction", () => {
  it("draws rouge below 0.5 and noir at or above it", () => {
    expect(drawBinaryResult(0.1)).toBe("rouge");
    expect(drawBinaryResult(0.9)).toBe("noir");
  });

  it("returns correct when the guess matches the drawn result", () => {
    expect(resolveBinaryPrediction("rouge", "rouge")).toBe("correct");
    expect(resolveBinaryPrediction("noir", "noir")).toBe("correct");
  });

  it("returns wrong when the guess does not match", () => {
    expect(resolveBinaryPrediction("rouge", "noir")).toBe("wrong");
    expect(resolveBinaryPrediction("noir", "rouge")).toBe("wrong");
  });
});
