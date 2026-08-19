"use client";

import { useState } from "react";
import { Brand } from "@/games/quoi-de-9/components/brand";
import { BackButton } from "@/games/quoi-de-9/components/back-button";
import { Button, ProgressDots } from "@/games/quoi-de-9/components/ui";
import { getTheme, questions } from "@/games/quoi-de-9/data/questions";
import {
  DIFFICULTY_LEVELS,
  GAME_CONFIG,
  type DifficultyLevel,
} from "@/games/quoi-de-9/lib/game/config";
import {
  getDifficultyAvailability,
  getWinner,
  isBombTurn,
} from "@/games/quoi-de-9/lib/game/engine";
import {
  calculateTurnScore,
  formatScore,
  formatSignedScore,
} from "@/games/quoi-de-9/lib/game/scoring";
import { calculateFunSips, formatSignedSips, formatSips } from "@/games/quoi-de-9/lib/game/fun-rewards";
import type { GameState, Question, Team, Theme } from "@/games/quoi-de-9/lib/game/types";

export function GameHeader({ game, onAbandon }: { game: GameState; onAbandon: () => void }) {
  const active = game.teams[game.currentTeamIndex];
  const master = game.teams[game.currentTeamIndex === 0 ? 1 : 0];
  const phase = getGamePhase(game, active.name, master.name);
  const showHud = game.status !== "completed";
  const showBack =
    game.status !== "question_active" &&
    game.status !== "turn_expired" &&
    game.status !== "answer_correction" &&
    game.status !== "turn_results" &&
    game.status !== "scoreboard" &&
    game.status !== "completed";
  const compact =
    game.status === "question_ready" ||
    game.status === "question_active" ||
    game.status === "turn_expired" ||
    game.status === "answer_correction" ||
    game.status === "turn_results";
  const resultsOnly = game.status === "turn_results";

  return (
    <header
      className={`z-20 -mx-2 bg-[linear-gradient(to_bottom,var(--page)_88%,transparent)] px-2 pt-1 ${compact ? "mb-2 pb-1" : "mb-4 pb-3"}`}
    >
      <div className={`${compact ? "hidden" : "mb-3 flex"} items-center justify-between gap-4`}>
        <Brand compact />
        <button
          type="button"
          onClick={onAbandon}
          className="min-h-11 rounded-full px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white/55"
        >
          Quitter
        </button>
      </div>
      {showHud ? (
        <div
          className={`glass-panel rounded-2xl ${compact ? "p-2" : "p-3"}`}
          aria-label="État de la partie"
        >
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <HudTeam team={game.teams[0]} active={game.currentTeamIndex === 0} />
            <div className="text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/52">
                Tour {game.currentTurn}/{game.roundsPerTeam * 2}
              </p>
              <p className="display-face mt-0.5 text-xl text-white/65">M{game.currentRound}</p>
            </div>
            <HudTeam team={game.teams[1]} active={game.currentTeamIndex === 1} align="right" />
          </div>
          {!resultsOnly ? (
            <>
              <div className={compact ? "my-1.5" : "my-2.5"}>
                <ProgressDots current={game.history.length} total={game.roundsPerTeam * 2} />
              </div>
              <div
                className={`flex items-center gap-2 border-t border-white/8 ${compact ? "pt-1.5" : "pt-2"}`}
              >
                <span className="shrink-0 rounded-full bg-[var(--lime)]/12 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--accent-text)]">
                  {phase.label}
                </span>
                <p className="truncate text-[11px] font-bold text-white/65" aria-live="polite">
                  {phase.action}
                </p>
                {showBack ? <BackButton compact /> : null}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function HudTeam({
  team,
  active,
  align = "left",
}: {
  team: Team;
  active: boolean;
  align?: "left" | "right";
}) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : ""}`}>
      <p className={`truncate text-[10px] font-bold ${active ? "text-white" : "text-white/58"}`}>
        <span
          className="mr-1.5 inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: team.color }}
        />
        {team.name}
      </p>
      <p className="display-face mt-1 text-2xl leading-none">{formatScore(team.score)}</p>
    </div>
  );
}

function getGamePhase(game: GameState, activeName: string, masterName: string) {
  switch (game.status) {
    case "pass_phone":
      return { label: "Passage", action: `Téléphone à ${masterName}` };
    case "joker_opportunity":
      return {
        label: "Joker",
        action:
          game.jokerOpportunityStage === "opponent"
            ? `${masterName} décide`
            : `${activeName} choisit`,
      };
    case "joker_theme_selection":
    case "joker_confirmation":
      return { label: "Thème", action: "Choisissez un thème" };
    case "theme_reveal":
    case "difficulty_selection":
    case "choice_confirmation":
      return { label: "Niveau", action: `${activeName} choisit la difficulté` };
    case "question_preparation":
      return { label: "Secret", action: `${activeName} ne regarde plus l’écran` };
    case "question_ready":
      return { label: "Prêts ?", action: `${masterName} lit, puis lance le chrono` };
    case "question_active":
      return { label: "En jeu", action: `${masterName} valide les réponses` };
    case "turn_expired":
      return { label: "Terminé", action: "Affichez le bilan du tour" };
    case "answer_correction":
      return { label: "Correction", action: "Modifiez puis actualisez le bilan" };
    case "turn_results":
      return { label: "Bilan", action: "Consultez le score, puis continuez" };
    case "scoreboard":
      return { label: "Scores", action: "Passez au tour suivant" };
    default:
      return { label: "Partie", action: `${activeName} répond` };
  }
}

export function RoundSetupScreen({
  game,
  theme,
  onPhoneReady,
  onOpponentJoker,
  onThemeChoice,
  onRandomTheme,
  onSelect,
  onDifficulty,
}: {
  game: GameState;
  theme: Theme | null;
  onPhoneReady: () => void;
  onOpponentJoker: () => void;
  onThemeChoice: () => void;
  onRandomTheme: () => void;
  onSelect: (themeId: string) => void;
  onDifficulty: (difficulty: DifficultyLevel) => void;
}) {
  const active = game.teams[game.currentTeamIndex];
  const master = game.teams[game.currentTeamIndex === 0 ? 1 : 0];
  const waitingForPhone = game.status === "instructions" || game.status === "pass_phone";
  const choosingMethod = game.status === "joker_opportunity";
  const choosingTheme = game.status === "joker_theme_selection";
  const choosingDifficulty = game.status === "difficulty_selection" && theme;
  const proposedThemes = (game.turnThemeSelection?.proposedThemeIds ?? [])
    .map((id) => getTheme(id))
    .filter((item): item is Theme => Boolean(item));
  const availability = theme
    ? getDifficultyAvailability(questions, theme.id, game.usedQuestionIds)
    : null;

  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center">
      <div className="text-center">
        <h1 className="balance text-[clamp(2rem,7vw,3rem)] font-black leading-[1.02] tracking-[-0.025em]">
          {active.name} répond
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/58">
          {waitingForPhone ? "Passez le téléphone à " : null}
          <strong style={{ color: master.color }}>{master.name}</strong>
          {!waitingForPhone ? " garde le téléphone" : null}
        </p>
      </div>
      <div className="glass-panel mt-4 rounded-3xl p-3">
        <div className="mb-2.5 px-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/62">
            {waitingForPhone ? "Passage du téléphone" : "Thème du tour"}
          </p>
        </div>

        {waitingForPhone ? (
          <div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.045] p-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.07] text-xl text-[var(--accent-text)]"
                aria-hidden="true"
              >
                ▯
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-base font-black leading-snug">{master.name}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/55">
                  Choisit le thème, puis valide les réponses
                </p>
              </div>
            </div>
            <Button className="mt-2.5 min-h-11 py-2" onClick={onPhoneReady}>
              J’ai le téléphone
            </Button>
          </div>
        ) : null}

        {choosingMethod ? (
          <div className="grid gap-3">
            <button
              type="button"
              onClick={onRandomTheme}
              className="flex min-h-16 items-center gap-3 rounded-2xl border border-[var(--lime)]/35 bg-[var(--lime)]/[.1] px-4 py-3 text-left transition active:scale-[.98]"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--lime)] text-xl font-black text-[var(--accent-ink)]"
                aria-hidden="true"
              >
                ↻
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">Thème au hasard</span>
                <span className="mt-0.5 block text-[10px] font-medium text-white/58">
                  Choix standard · aucun joker utilisé
                </span>
              </span>
              <span className="text-lg text-[var(--accent-text)]" aria-hidden="true">
                →
              </span>
            </button>

            <div>
              <div className="mb-2 px-1">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/62">
                  Jokers
                </p>
              </div>
              <div className="grid gap-2">
                <JokerChoice
                  icon="✦"
                  teamName={active.name}
                  teamColor={active.color}
                  label="Choisir notre thème"
                  available={game.teamJokers[active.id]?.themeChoiceAvailable ?? false}
                  onClick={onThemeChoice}
                />
                <JokerChoice
                  icon="◉"
                  teamName={master.name}
                  teamColor={master.color}
                  label="Choisir le thème adverse"
                  available={game.teamJokers[master.id]?.opponentThemeAvailable ?? false}
                  onClick={onOpponentJoker}
                />
              </div>
            </div>
          </div>
        ) : null}

        {choosingTheme ? (
          <div className="grid grid-cols-3 gap-2">
            {proposedThemes.map((item) => (
              <SetupChoice
                key={item.id}
                icon={item.icon}
                label={item.name}
                meta=""
                primaryChoice
                onClick={() => onSelect(item.id)}
              />
            ))}
          </div>
        ) : null}

        {choosingDifficulty && availability ? (
          <div>
            <div className="mb-3 flex items-center gap-2 rounded-xl bg-white/[.045] px-3 py-2">
              <span className="text-xl" aria-hidden="true">
                {theme.icon}
              </span>
              <p className="min-w-0 truncate text-sm font-black">{theme.name}</p>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
                Thème tiré
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DIFFICULTY_LEVELS.map((difficulty) => {
                const config = GAME_CONFIG.difficulties[difficulty];
                let meta: string;
                if (game.mode === "fun") {
                  if (difficulty === 1) {
                    meta = "3 / 5 / 9 réponses";
                  } else if (difficulty === 2) {
                    meta = "1 gorgée / 2 réponses";
                  } else {
                    meta = "1 gorgée / réponse";
                  }
                } else {
                  const pointsPerAnswer = calculateTurnScore(1, difficulty);
                  const maximumPoints = calculateTurnScore(GAME_CONFIG.answerCount, difficulty);
                  meta = `${formatScore(pointsPerAnswer)} pts/réponse · ${formatScore(maximumPoints)} max`;
                }
                return (
                  <SetupChoice
                    key={difficulty}
                    icon=""
                    label={config.label}
                    meta={meta}
                    prominentLabel
                    disabled={availability[difficulty] < 1}
                    onClick={() => onDifficulty(difficulty)}
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
      {!waitingForPhone ? (
        <p className="mt-3 text-center text-[11px] text-white/55">
          Ensuite, {master.name} affiche les réponses à l’abri des regards.
        </p>
      ) : null}
    </section>
  );
}

function JokerChoice({
  icon,
  teamName,
  teamColor,
  label,
  available,
  onClick,
}: {
  icon: string;
  teamName: string;
  teamColor: string;
  label: string;
  available: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={!available}
      onClick={onClick}
      className="flex min-h-16 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-left transition active:scale-[.98] disabled:opacity-35"
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[.06] text-lg text-[var(--accent-text)]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white/58">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: teamColor }}
          />
          <span className="truncate">{teamName}</span>
        </span>
        <span className="mt-1 block truncate text-sm font-black">{label}</span>
        {!available ? (
          <span className="mt-0.5 block truncate text-[9px] text-white/50">Joker déjà utilisé</span>
        ) : null}
      </span>
      <span className="pr-1 text-sm text-white/38" aria-hidden="true">
        {available ? "→" : "×"}
      </span>
    </button>
  );
}

function SetupChoice({
  icon,
  label,
  meta,
  primaryChoice = false,
  prominentLabel = false,
  disabled = false,
  onClick,
}: {
  icon: string;
  label: string;
  meta: string;
  primaryChoice?: boolean;
  prominentLabel?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[.045] text-center transition active:scale-[.97] disabled:opacity-35 ${primaryChoice ? "min-h-28 px-3 py-4" : "min-h-24 px-2 py-3"}`}
    >
      {primaryChoice ? (
        <>
          <span className="text-2xl text-[var(--accent-text)]" aria-hidden="true">
            {icon}
          </span>
          <span className="mt-3 text-[clamp(.95rem,3.5vw,1.2rem)] font-black leading-[1.1]">
            {label}
          </span>
        </>
      ) : prominentLabel ? (
        <>
          <span className="text-lg font-black leading-tight">{label}</span>
          <span className="mt-2 text-[10px] font-bold leading-tight text-[var(--accent-text)]">
            {meta}
          </span>
        </>
      ) : (
        <>
          <span className="text-xl font-black text-[var(--accent-text)]" aria-hidden="true">
            {icon}
          </span>
          <span className="mt-2 text-xs font-bold leading-tight">{label}</span>
          <span className="mt-1 text-[9px] leading-tight text-white/55">{meta}</span>
        </>
      )}
    </button>
  );
}

export function JokerConfirmationScreen({
  game,
  onCancel,
  onConfirm,
}: {
  game: GameState;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const selection = game.turnThemeSelection!;
  const theme = getTheme(selection.selectedThemeId);
  const isOpponent = selection.selectionMode === "opponent_imposed";
  return (
    <section className="flex flex-1 flex-col justify-center text-center">
      <p className="text-xs font-black uppercase tracking-[.18em] text-[var(--coral)]">
        Joker à confirmer
      </p>
      <h1 className="display-face mt-3 text-6xl">{theme?.name}</h1>
      <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/55">
        {isOpponent
          ? "Ce thème sera imposé à l’équipe adverse."
          : "Ce thème sera choisi pour votre tour."}{" "}
        Il ne pourra être utilisé qu’une seule fois pendant cette partie.
      </p>
      <div className="mt-8 grid gap-3">
        <Button onClick={onConfirm}>Confirmer le joker</Button>
        <Button variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </section>
  );
}

export function ThemeRevealScreen({
  game,
  theme,
  onContinue,
}: {
  game: GameState;
  theme: Theme;
  onContinue: () => void;
}) {
  const method = game.turnThemeSelection?.selectionMode;
  const label =
    method === "opponent_imposed"
      ? "Imposé par l’adversaire"
      : method === "active_team_choice"
        ? "Choisi avec un joker"
        : "Thème imposé au hasard";
  return (
    <section className="flex flex-1 flex-col justify-center text-center">
      <span className="text-6xl text-[var(--accent-text)]">{theme.icon}</span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-white/58">{label}</p>
      <h1 className="display-face mt-3 text-6xl leading-[.86]">{theme.name}</h1>
      <p className="mx-auto mt-5 max-w-sm text-sm text-white/65">
        L’équipe qui répond choisit maintenant le niveau de difficulté.
      </p>
      <Button className="mt-8" onClick={onContinue}>
        Choisir la difficulté
      </Button>
    </section>
  );
}

export function ChoiceConfirmationScreen({
  theme,
  difficultyLevel,
  onCancel,
  onConfirm,
}: {
  theme: Theme;
  difficultyLevel: DifficultyLevel;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const config = GAME_CONFIG.difficulties[difficultyLevel];
  const pointsPerAnswer = calculateTurnScore(1, difficultyLevel);
  const maximumPoints = calculateTurnScore(GAME_CONFIG.answerCount, difficultyLevel);
  return (
    <section className="flex flex-1 flex-col justify-center text-center">
      <span className="text-5xl text-[var(--accent-text)]" aria-hidden="true">
        {theme.icon}
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/58">
        Choix définitif
      </p>
      <h1 className="display-face balance mt-3 text-6xl leading-[.86]">
        {theme.name}.<br />
        {config.label}.
      </h1>
      <p className="balance mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/65">
        Chaque bonne réponse rapporte {formatScore(pointsPerAnswer)} points, jusqu’à{" "}
        {formatScore(maximumPoints)} points. Après confirmation, impossible de changer le thème, la
        difficulté ou la question.
      </p>
      <div className="mt-8 grid gap-3">
        <Button onClick={onConfirm}>Confirmer et tirer la question</Button>
        <Button variant="ghost" onClick={onCancel}>
          Changer la difficulté
        </Button>
      </div>
    </section>
  );
}

export function PreparationScreen({
  game,
  onContinue,
}: {
  game: GameState;
  onContinue: () => void;
}) {
  const master = game.teams[game.currentTeamIndex === 0 ? 1 : 0];
  return (
    <section className="flex flex-1 flex-col justify-center text-center">
      <div
        className="mx-auto grid h-24 w-24 place-items-center rounded-full border border-white/15 bg-white/[.05] text-4xl"
        aria-hidden="true"
      >
        ◉
      </div>
      <p className="mt-7 text-xs font-black uppercase tracking-[0.18em] text-[var(--coral)]">
        Écran secret
      </p>
      <h1 className="display-face balance mt-3 text-6xl leading-[.86]">{master.name} seulement.</h1>
      <p className="balance mx-auto mt-5 max-w-sm text-sm leading-relaxed text-white/65">
        Les neuf réponses vont apparaître. L’équipe qui répond ne doit plus regarder l’écran.
      </p>
      <Button className="mt-8" onClick={onContinue}>
        Je suis prêt · afficher la question
      </Button>
    </section>
  );
}

export function QuestionScreen({
  game,
  question,
  theme,
  remainingSeconds,
  onStart,
  onAnswer,
  onBomb,
  onUndo,
  onEnd,
  onResults,
}: {
  game: GameState;
  question: Question;
  theme: Theme;
  remainingSeconds: number;
  onStart: () => void;
  onAnswer: (answerId: string) => void;
  onBomb: () => void;
  onUndo: () => void;
  onEnd: () => void;
  onResults: () => void;
}) {
  const active = game.teams[game.currentTeamIndex];
  const master = game.teams[game.currentTeamIndex === 0 ? 1 : 0];
  const isReady = game.status === "question_ready";
  const isActive = game.status === "question_active";
  const expired = game.status === "turn_expired";
  const isCorrection = game.status === "answer_correction";
  const urgent = !isCorrection && remainingSeconds <= GAME_CONFIG.warningSeconds;
  const critical = !isCorrection && remainingSeconds <= GAME_CONFIG.criticalSeconds;
  const progress = (remainingSeconds / game.turnDurationSeconds) * 100;
  const bombActive = isBombTurn(game);
  const [isBombExplanationOpen, setIsBombExplanationOpen] = useState(false);

  return (
    <section className="flex min-h-0 flex-1 flex-col pb-1">
      <div
        className={`glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl ${critical ? "border-[var(--coral)]/60" : ""}`}
      >
        <div className="p-3 pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/58">
                {theme.name} · {question.difficultyLabel}
              </p>
              <p className="mt-1 text-xs font-bold" style={{ color: active.color }}>
                {active.name} répond
              </p>
            </div>
            <div
              className={`text-right ${critical ? "text-[var(--coral)]" : urgent ? "text-amber-300" : "text-white"}`}
            >
              <span className="display-face block text-4xl leading-none tabular-nums">
                {isCorrection ? "—" : formatTime(remainingSeconds)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-white/55">
                {isReady ? "prêt" : isCorrection ? "correction" : expired ? "terminé" : "restantes"}
              </span>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ${critical ? "bg-[var(--coral)]" : urgent ? "bg-amber-300" : "bg-[var(--lime)]"}`}
              style={{ width: `${Math.max(0, progress)}%` }}
            />
          </div>
          <h1 className="balance mt-3 text-[clamp(1.15rem,5.5vw,1.7rem)] font-black leading-[1.08]">
            {question.question}
          </h1>
          <p className="mt-1.5 text-[10px] text-white/58">{master.name} lit à voix haute.</p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 border-t border-white/10 bg-black/10 p-2">
          <div className="answer-grid grid min-h-0 flex-1 grid-cols-3 grid-rows-3 gap-1.5">
            {question.answers.map((answer) => {
              const found = game.revealedAnswerIds.includes(answer.id);
              return (
                <button
                  key={answer.id}
                  type="button"
                  disabled={!isActive && !isCorrection}
                  onClick={() => onAnswer(answer.id)}
                  className={`answer-choice min-h-0 rounded-xl border px-1.5 py-1.5 text-[clamp(.62rem,2.8vw,.8rem)] font-black leading-[1.05] transition active:scale-[.96] ${found ? "border-[var(--lime)]/50 bg-[var(--lime)] text-[var(--accent-ink)]" : "border-white/10 bg-white/[.055] text-white disabled:opacity-72"}`}
                  aria-pressed={found}
                >
                  <span>{answer.display}</span>
                  {found ? (
                    <span className="ml-1" aria-hidden="true">
                      ✓
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          {bombActive ? (
            <div className="w-full">
              <div
                style={{ backgroundColor: "#000", color: "#fff" }}
                className={`flex min-h-12 w-full items-stretch overflow-hidden rounded-xl border transition ${game.bombTriggered ? "border-[var(--coral)]" : "border-white/35"}`}
              >
                <button
                  type="button"
                  disabled={!isActive && !isCorrection}
                  onClick={onBomb}
                  aria-pressed={game.bombTriggered}
                  aria-label={`Bombe : ${question.bomb.display}${game.bombTriggered ? " — déclenchée" : ""}`}
                  className="flex min-w-0 flex-1 items-center justify-start gap-3 px-4 py-2 text-left text-sm font-black text-white transition active:scale-[.98] disabled:opacity-72"
                  style={{ color: "#fff" }}
                >
                  <span className="text-base" aria-hidden="true">
                    💣
                  </span>
                  <span className="min-w-0">{question.bomb.display}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBombExplanationOpen((open) => !open)}
                  aria-expanded={isBombExplanationOpen}
                  aria-controls="bomb-explanation"
                  aria-label="Pourquoi cette bombe ?"
                  className="m-1 grid min-h-10 min-w-10 place-items-center rounded-lg border border-white/45 text-base font-black text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95"
                  style={{ color: "#fff" }}
                >
                  ?
                </button>
              </div>
              {isBombExplanationOpen ? (
                <p
                  id="bomb-explanation"
                  role="status"
                  className="mt-1.5 rounded-lg border border-white/20 bg-black px-3 py-2 text-xs font-semibold leading-snug text-white"
                  style={{ color: "#fff" }}
                >
                  {question.bomb.explanation}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-4 px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
            Réponses
          </p>
          <p className="display-face text-3xl">
            {game.revealedAnswerIds.length}
            <span className="text-white/45">/9</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
            Score provisoire
          </p>
          <p
            key={game.turnScore}
            className="score-pop display-face text-3xl text-[var(--accent-text)]"
          >
            {formatSignedScore(game.turnScore)}
          </p>
        </div>
      </div>

      {isReady ? (
        <div className="mt-2 rounded-2xl border border-[var(--lime)]/20 bg-[var(--lime)]/[.06] p-2">
          <Button className="min-h-11 py-2" onClick={onStart}>
            Démarrer le chrono
          </Button>
        </div>
      ) : null}
      {isActive ? (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="min-h-11 py-2"
            onClick={onUndo}
            disabled={game.revealedAnswerIds.length === 0}
          >
            Annuler la dernière
          </Button>
          <Button
            variant="ghost"
            className="min-h-11 w-full px-4 py-2"
            onClick={onEnd}
            aria-label="Terminer exceptionnellement le tour"
          >
            Fin
          </Button>
        </div>
      ) : null}
      {isCorrection ? (
        <div className="mt-2 rounded-2xl border border-[var(--lime)]/25 bg-[var(--lime)]/[.07] p-2">
          <p className="mb-2 text-center text-[11px] font-bold text-white/65">
            Touchez les réponses à ajouter ou retirer. Le score sera recalculé.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="min-h-11 py-2"
              onClick={onUndo}
              disabled={game.revealedAnswerIds.length === 0}
            >
              Annuler la dernière
            </Button>
            <Button className="min-h-11 py-2" onClick={onResults}>
              Mettre à jour
            </Button>
          </div>
        </div>
      ) : null}
      {expired ? (
        <div className="mt-2 rounded-2xl border border-[var(--coral)]/25 bg-[var(--coral)]/[.07] p-2 text-center">
          <p className="mb-2 text-xs font-black text-[var(--coral)]">
            Temps écoulé · validations verrouillées
          </p>
          <Button className="min-h-11 py-2" onClick={onResults}>
            Voir les résultats
          </Button>
        </div>
      ) : null}
    </section>
  );
}

export function TurnResultsScreen({
  game,
  onCorrect,
  onContinue,
}: {
  game: GameState;
  onCorrect: () => void;
  onContinue: () => void;
}) {
  const result = game.history.at(-1);
  if (!result) return null;

  const isFunMode = game.mode === "fun";
  const reward = isFunMode
    ? calculateFunSips(result.foundAnswers.length, result.difficultyLevel, result.bombTriggered)
    : result.pointsEarned;

  return (
    <section className="flex min-h-0 flex-1 flex-col pb-1">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-text)]">
          Tour terminé
        </p>
        <p className="score-pop display-face mt-2 text-5xl leading-none text-[var(--accent-text)]">
          {isFunMode ? (
            <>
              {reward}{" "}
              <span className="font-sans text-[11px] uppercase tracking-wider">
                gorgée{reward !== 1 ? "s" : ""}
              </span>
            </>
          ) : (
            <>
              {formatSignedScore(reward)}{" "}
              <span className="font-sans text-[11px] uppercase tracking-wider">points</span>
            </>
          )}
        </p>
        <p className="mt-2 text-[11px] text-white/58">
          {result.themeLabel} · Niveau {result.difficultyLevel} — {result.difficultyLabel}
        </p>
        <h1 className="balance mx-auto mt-1.5 max-w-xl text-[clamp(1rem,3.8vw,1.3rem)] font-black leading-tight">
          {result.questionText}
        </h1>
      </div>
      <ResultAnswerGrid found={result.foundAnswers} missed={result.missedAnswers} />
      <div className="mt-3 grid grid-cols-[.7fr_1.3fr] gap-2">
        <Button variant="secondary" className="min-h-11 px-2 py-2" onClick={onCorrect}>
          Corriger
        </Button>
        <Button className="min-h-11 px-2 py-2" onClick={onContinue}>
          {game.history.length >= game.roundsPerTeam * 2 ? "Résultat final" : "Tour suivant"}
        </Button>
      </div>
    </section>
  );
}

function ResultAnswerGrid({
  found,
  missed,
}: {
  found: Array<{ id: string; display: string }>;
  missed: Array<{ id: string; display: string }>;
}) {
  const answers = [
    ...found.map((answer) => ({ ...answer, found: true })),
    ...missed.map((answer) => ({ ...answer, found: false })),
  ];
  return (
    <section className="mt-3">
      <div className="mb-2 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.1em]">
        <h2 className="text-white/62">Réponses</h2>
        <p className="text-[var(--accent-text)]">{found.length}/9 trouvées</p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {answers.map((answer) => (
          <div
            key={answer.id}
            className={`flex min-h-12 items-center justify-center rounded-xl border px-2 py-1.5 text-center text-[clamp(.76rem,2.8vw,.92rem)] font-semibold leading-[1.15] ${answer.found ? "border-[var(--lime)]/30 bg-[var(--lime)]/[.1] text-white" : "border-white/10 bg-white/[.03] text-white/62"}`}
          >
            <span>
              {answer.display}
              {answer.found ? (
                <span className="ml-1 text-[var(--accent-text)]" aria-label="obtenue">
                  ✓
                </span>
              ) : (
                <span className="sr-only"> — manquée</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ScoreboardScreen({
  game,
  onContinue,
}: {
  game: GameState;
  onContinue: () => void;
}) {
  const leader =
    game.teams[0].score === game.teams[1].score
      ? null
      : game.teams[0].score > game.teams[1].score
        ? game.teams[0]
        : game.teams[1];
  return (
    <section className="flex flex-1 flex-col justify-center">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-text)]">
          Manche {game.currentRound - 1} terminée
        </p>
        <h1 className="display-face mt-3 text-6xl">Point scores.</h1>
        <p className="mt-3 text-sm text-white/62">
          {leader ? `${leader.name} mène la partie.` : "Égalité parfaite pour le moment."}
        </p>
      </div>
      <div className="mt-8 grid gap-3">
        {game.teams.map((team) => {
          const teamTurns = game.history.filter((turn) => turn.answeringTeamId === team.id);
          return (
            <div key={team.id} className="glass-panel rounded-3xl p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <span
                    className="mb-3 block h-3 w-12 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <h2 className="text-lg font-black">{team.name}</h2>
                  <p className="mt-1 text-xs text-white/58">
                    {teamTurns.reduce((sum, turn) => sum + turn.foundAnswerIds.length, 0)} réponses
                    trouvées
                  </p>
                </div>
                <p className="display-face text-5xl">{formatScore(team.score)}</p>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-center text-xs text-white/55">
        Il reste {game.roundsPerTeam * 2 - game.history.length} tours.
      </p>
      <Button className="mt-6" onClick={onContinue}>
        Continuer
      </Button>
    </section>
  );
}

export function FinalScreen({
  game,
  onReplay,
  onNew,
}: {
  game: GameState;
  onReplay: () => void;
  onNew: () => void;
}) {
  const result = getWinner(game);
  const winnerName = result.winner?.name;
  return (
    <section className="pb-5 text-center">
      <div className="celebrate mx-auto text-6xl" aria-hidden="true">
        ✦
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-text)]">
        Partie terminée
      </p>
      <h1 className="display-face balance mt-3 text-7xl leading-[.82]">
        {result.kind === "draw" ? "Match nul." : `${winnerName} gagne !`}
      </h1>
      <p className="mt-4 text-sm text-white/62">
        {result.kind === "draw"
          ? "Impossible de vous départager."
          : `${formatScore(result.difference)} points d’écart.`}
      </p>
      <div className="mt-8 grid grid-cols-2 gap-3">
        {game.teams.map((team) => {
          const turns = game.history.filter((turn) => turn.answeringTeamId === team.id);
          const answers = turns.reduce((sum, turn) => sum + turn.foundAnswerIds.length, 0);
          return (
            <div key={team.id} className="glass-panel rounded-3xl p-4 text-left">
              <span
                className="block h-2 w-10 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <h2 className="mt-4 truncate font-black">{team.name}</h2>
              <p className="display-face mt-2 text-4xl">{formatScore(team.score)}</p>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-white/55">
                {answers} bonnes réponses
              </p>
              <div className="mt-4 flex gap-1.5">
                {DIFFICULTY_LEVELS.map((difficultyLevel) => (
                  <span
                    key={difficultyLevel}
                    className="rounded-lg bg-white/[.06] px-2 py-1 text-[9px] font-semibold text-white/60"
                  >
                    {GAME_CONFIG.difficulties[difficultyLevel].label.slice(0, 1)}{" "}
                    {turns.filter((turn) => turn.difficultyLevel === difficultyLevel).length}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-7 text-left">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-white/58">
          Historique des manches
        </h2>
        <div className="grid gap-3">
          {game.history.map((turn) => {
            const team = game.teams.find((candidate) => candidate.id === turn.answeringTeamId);
            return (
              <article key={turn.id} className="rounded-2xl bg-white/[.04] p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-black" style={{ color: team?.color }}>
                    M{turn.roundNumber} · {team?.name}
                  </span>
                  <span className="font-black text-[var(--accent-text)]">
                    {formatSignedScore(turn.pointsEarned)}
                  </span>
                </div>
                <p className="mt-2 leading-relaxed text-white/62">{turn.questionText}</p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-white/52">
                  {turn.themeLabel} · Niveau {turn.difficultyLevel} — {turn.difficultyLabel} ·{" "}
                  {turn.foundAnswerIds.length}/9
                </p>
                <p className="mt-1 text-[10px] text-white/55">
                  {turn.themeSelection.selectionMode === "opponent_imposed"
                    ? "Joker Thème adverse"
                    : turn.themeSelection.selectionMode === "active_team_choice"
                      ? "Joker Choix du thème"
                      : "Thème imposé au hasard"}
                </p>
              </article>
            );
          })}
        </div>
      </div>
      <div className="mt-7 grid gap-3">
        <Button onClick={onReplay}>Rejouer avec les mêmes équipes</Button>
        <Button variant="secondary" onClick={onNew}>
          Nouvelle partie
        </Button>
      </div>
    </section>
  );
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}
