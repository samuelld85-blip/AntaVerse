import { findPlayer } from "@/games/roulette-du-chaos/lib/game/resolution-helpers";
import type { GameState, MiniGameOutcome } from "@/games/roulette-du-chaos/lib/game/types";
import { BinaryPrediction } from "./binary-prediction";
import { Estimation } from "./estimation";
import { PlusMinus } from "./plus-minus";
import { Reflex } from "./reflex";
import { Rps } from "./rps";
import { SecretNumber } from "./secret-number";
import { StopTimer } from "./stop-timer";
import { TapBattle } from "./tap-battle";

/** Dispatches the active mini-game session to its dedicated UI (spec §13/§43). */
export function MiniGameRouter({
  game,
  onComplete,
}: {
  game: GameState;
  onComplete: (outcome: MiniGameOutcome) => void;
}) {
  const session = game.miniGame;
  if (!session) return null;

  const playerA = findPlayer(game.players, session.playerAId);
  const playerB = findPlayer(game.players, session.playerBId);
  if (!playerA) return null;

  const props = { playerA, playerB, mode: session.mode, onComplete };

  switch (session.kind) {
    case "reflex":
      return <Reflex {...props} />;
    case "stopTimer":
      return <StopTimer {...props} />;
    case "rps":
      return <Rps {...props} />;
    case "plusMinus":
      return <PlusMinus {...props} />;
    case "secretNumber":
      return <SecretNumber {...props} />;
    case "estimation":
      return <Estimation {...props} />;
    case "tapBattle":
      return <TapBattle {...props} />;
    case "binaryPrediction":
      return <BinaryPrediction {...props} />;
    default:
      return null;
  }
}
