"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonLink } from "@/games/quoi-de-9/components/ui";
import { getQuestion, getTheme, questions, themes } from "@/games/quoi-de-9/data/questions";
import {
  acknowledgeInstructions,
  activateChangeThemeJoker,
  activateOpponentOverrideJoker,
  advanceAfterResults,
  cancelJokerTheme,
  cancelJokerThemeSelection,
  chooseDifficulty,
  confirmChoice,
  confirmJokerTheme,
  confirmPhonePass,
  continueFromScoreboard,
  continueFromThemeReveal,
  expireTurn,
  finalizeExpiredTurn,
  finalizeTurn,
  getRemainingSeconds,
  imposeRandomTheme,
  recoverTimer,
  replayGame,
  selectJokerTheme,
  skipOpponentThemeJoker,
  startTimer,
  toggleAnswer,
  toggleBomb,
  toggleTurnResultAnswer,
  undoLastAnswer,
} from "@/games/quoi-de-9/lib/game/engine";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "@/games/quoi-de-9/lib/game/persistence";
import type { GameState } from "@/games/quoi-de-9/lib/game/types";
import {
  FinalScreen,
  GameHeader,
  JokerConfirmationScreen,
  QuestionScreen,
  RoundSetupScreen,
  ScoreboardScreen,
  ThemeRevealScreen,
  TurnResultsScreen,
} from "./screens";

import { FR } from "@/games/quoi-de-9/lib/i18n/fr";

type Transition = (game: GameState) => GameState;

export function GameClient() {
  const router = useRouter();
  const [game, setGame] = useState<GameState | null>(null);
  const gameRef = useRef<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timestamp, setTimestamp] = useState(0);

  useEffect(() => {
    let active = true;
    void loadCurrentGame()
      .then(async (stored) => {
        if (!active) return;
        if (stored) {
          const storedQuestion = getQuestion(stored.currentQuestionId);
          const storedTheme = getTheme(stored.selectedThemeId);
          const recovered =
            storedQuestion && storedTheme
              ? finalizeExpiredTurn(stored, storedQuestion, storedTheme.name)
              : recoverTimer(stored);
          gameRef.current = recovered;
          setGame(recovered);
          if (recovered !== stored) await saveCurrentGame(recovered);
        }
      })
      .catch(() => setError(FR.errors.load))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const commit = useCallback(async (next: GameState) => {
    gameRef.current = next;
    setGame(next);
    try {
      await saveCurrentGame(next);
      setError(null);
    } catch {
      setError(FR.errors.save);
    }
  }, []);

  const transition = useCallback(
    (change: Transition) => {
      const currentGame = gameRef.current;
      if (!currentGame) return;
      try {
        void commit(change(currentGame));
      } catch (transitionError) {
        setError(transitionError instanceof Error ? transitionError.message : "Action impossible");
      }
    },
    [commit],
  );

  useEffect(() => {
    if (game?.status !== "question_active") return;
    const tick = () => {
      const currentTimestamp = Date.now();
      setTimestamp(currentTimestamp);
      if (game.timerEndsAt && currentTimestamp >= Date.parse(game.timerEndsAt)) {
        const question = getQuestion(game.currentQuestionId);
        const theme = getTheme(game.selectedThemeId);
        const recovered =
          question && theme
            ? finalizeExpiredTurn(game, question, theme.name, currentTimestamp)
            : recoverTimer(game, currentTimestamp);
        if (recovered !== game) {
          if (navigator.vibrate) navigator.vibrate([80, 50, 120]);
          gameRef.current = recovered;
          setGame(recovered);
          void saveCurrentGame(recovered).catch(() => setError(FR.errors.save));
        }
      }
    };
    tick();
    const interval = window.setInterval(tick, 250);
    return () => window.clearInterval(interval);
  }, [game]);

  // Dès qu'on entre en joker_opportunity, tirer le thème automatiquement.
  // Le guard interne empêche un double-déclenchement (ex: StrictMode).
  useEffect(() => {
    if (game?.status !== "joker_opportunity") return;
    transition((current) => {
      if (current.status !== "joker_opportunity") return current;
      const ready =
        current.jokerOpportunityStage === "opponent"
          ? skipOpponentThemeJoker(current)
          : current;
      return imposeRandomTheme(ready, themes, questions);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.status]);

  // Migration : une partie sauvegardée en choice_confirmation est auto-confirmée.
  useEffect(() => {
    if (game?.status !== "choice_confirmation") return;
    transition((current) => {
      if (current.status !== "choice_confirmation") return current;
      return confirmChoice(current, questions);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game?.status]);

  const remainingSeconds = game
    ? Math.min(game.turnDurationSeconds, getRemainingSeconds(game, timestamp))
    : 0;

  async function abandonGame() {
    await clearCurrentGame();
    router.push("/quoi-de-9");
  }

  if (loading) {
    return (
      <main className="safe-shell grid min-h-[100dvh] place-items-center">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-pulse rounded-xl bg-[var(--lime)]" />
          <p className="mt-4 text-sm font-semibold text-white/60">Récupération de la partie…</p>
        </div>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="safe-shell mx-auto flex min-h-[100dvh] w-full max-w-[520px] flex-col justify-center text-center">
        <span className="text-5xl" aria-hidden="true">
          ○
        </span>
        <h1 className="display-face mt-5 text-5xl">Aucune partie en cours</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/62">
          Créez une partie pour commencer à jouer sur cet appareil.
        </p>
        <ButtonLink href="/quoi-de-9/creer" className="mt-8">
          Nouvelle partie
        </ButtonLink>
      </main>
    );
  }

  const currentQuestion = getQuestion(game.currentQuestionId);
  const currentTheme = getTheme(game.selectedThemeId);

  return (
    <main className="safe-shell mx-auto flex h-[100dvh] w-full max-w-[560px] flex-col overflow-hidden">
      <GameHeader game={game} onAbandon={() => void abandonGame()} />
      {error ? (
        <div
          role="alert"
          className="mb-4 rounded-2xl border border-[var(--coral)]/25 bg-[var(--coral)]/10 p-3 text-sm text-[var(--coral)]"
        >
          {error}
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Passage du téléphone + sélection de thème joker */}
        {game.status === "instructions" ||
        game.status === "pass_phone" ||
        game.status === "joker_theme_selection" ? (
          <RoundSetupScreen
            game={game}
            onPhoneReady={() =>
              transition((current) =>
                confirmPhonePass(
                  current.status === "instructions" ? acknowledgeInstructions(current) : current,
                ),
              )
            }
            onSelect={(themeId) =>
              transition((current) => confirmJokerTheme(selectJokerTheme(current, themeId)))
            }
            onCancelJokerSelection={() => transition(cancelJokerThemeSelection)}
          />
        ) : null}
        {/* Confirmation du thème joker */}
        {game.status === "joker_confirmation" && game.turnThemeSelection?.selectedThemeId ? (
          <JokerConfirmationScreen
            game={game}
            onCancel={() => transition(cancelJokerTheme)}
            onConfirm={() => transition(confirmJokerTheme)}
          />
        ) : null}
        {/* Écran combiné : thème + Classique/Challenge + jokers */}
        {(game.status === "theme_reveal" || game.status === "difficulty_selection") &&
        currentTheme ? (
          <ThemeRevealScreen
            game={game}
            theme={currentTheme}
            onDifficulty={(difficulty) =>
              transition((current) => {
                if (current.status === "theme_reveal") {
                  return confirmChoice(
                    chooseDifficulty(continueFromThemeReveal(current, questions), difficulty, questions),
                    questions,
                  );
                }
                // difficulty_selection : jeux sauvegardés avec l'ancien flow
                return confirmChoice(chooseDifficulty(current, difficulty, questions), questions);
              })
            }
            onChangeTheme={
              game.status === "theme_reveal"
                ? () =>
                    transition((current) => activateChangeThemeJoker(current, themes, questions))
                : undefined
            }
            onOpponentOverride={
              game.status === "theme_reveal"
                ? () =>
                    transition((current) =>
                      activateOpponentOverrideJoker(current, themes, questions),
                    )
                : undefined
            }
          />
        ) : null}
        {(game.status === "question_ready" ||
          game.status === "question_active" ||
          game.status === "turn_expired") &&
        currentQuestion &&
        currentTheme ? (
          <QuestionScreen
            key={currentQuestion.id}
            game={game}
            question={currentQuestion}
            theme={currentTheme}
            remainingSeconds={remainingSeconds}
            onStart={() => transition((current) => startTimer(current))}
            onAnswer={(answerId) => {
              transition((current) => toggleAnswer(current, answerId, currentQuestion));
              if (navigator.vibrate) navigator.vibrate(18);
            }}
            onBomb={() => {
              transition((current) => toggleBomb(current, currentQuestion));
              if (navigator.vibrate) navigator.vibrate([28, 42, 28]);
            }}
            onUndo={() => transition((current) => undoLastAnswer(current, currentQuestion))}
            onEnd={() =>
              transition((current) =>
                finalizeTurn(
                  expireTurn(current, Date.now(), true),
                  currentQuestion,
                  currentTheme.name,
                ),
              )
            }
            onResults={() =>
              transition((current) => finalizeTurn(current, currentQuestion, currentTheme.name))
            }
          />
        ) : null}
        {game.status === "turn_results" ? (
          <TurnResultsScreen
            game={game}
            onToggleAnswer={(answerId) =>
              transition((current) => toggleTurnResultAnswer(current, answerId))
            }
            onContinue={() =>
              transition((current) => {
                const next = advanceAfterResults(current);
                return next.status === "scoreboard" ? continueFromScoreboard(next) : next;
              })
            }
          />
        ) : null}
        {game.status === "scoreboard" ? (
          <ScoreboardScreen game={game} onContinue={() => transition(continueFromScoreboard)} />
        ) : null}
        {game.status === "completed" ? (
          <FinalScreen
            game={game}
            onReplay={() => transition(replayGame)}
            onNew={async () => {
              await clearCurrentGame();
              router.push("/quoi-de-9/creer");
            }}
          />
        ) : null}
      </div>
    </main>
  );
}
