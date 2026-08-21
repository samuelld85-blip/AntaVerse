"use client";

import { useMemo, useState } from "react";
import { Brand } from "@/games/quoi-de-9/components/brand";
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
  const showHud = game.status !== "completed";
  // Question en cours (avant et pendant le chrono) : aucun header, tout l'espace
  // est laissé à la question et aux 9 réponses.
  const liveQuestion = game.status === "question_ready" || game.status === "question_active";
  // Fin de tour : on masque la ligne marque + Quitter pour gagner de la hauteur.
  const compact = game.status === "turn_expired" || game.status === "turn_results";
  const totalTurns = game.roundsPerTeam * game.teams.length;

  if (liveQuestion) return null;

  return (
    <header
      className={`z-20 -mx-2 bg-[linear-gradient(to_bottom,var(--page)_88%,transparent)] px-2 pt-1 ${compact ? "mb-2 pb-1" : "mb-4 pb-3"}`}
    >
      <div className={`${compact ? "hidden" : "mb-3 flex"} items-center justify-between gap-4`}>
        <Brand compact />
        <button
          type="button"
          onClick={onAbandon}
          className="min-h-11 rounded-full px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary"
        >
          Quitter
        </button>
      </div>
      {showHud ? (
        <div className="glass-panel rounded-2xl p-2" aria-label="État de la partie">
          <div
            className={`grid items-center gap-2 ${game.teams.length === 2 ? "grid-cols-[1fr_auto_1fr]" : "grid-cols-[1fr_auto_1fr_auto_1fr]"}`}
          >
            {game.teams[0] && <HudTeam team={game.teams[0]} active={game.currentTeamIndex === 0} />}
            {game.teams.length === 3 && game.teams[2] && (
              <HudTeam team={game.teams[2]} active={game.currentTeamIndex === 2} align="center" />
            )}
            <p className="text-center text-[9px] font-bold uppercase tracking-[0.12em] text-white/52">
              Tour {game.currentTurn}/{totalTurns}
            </p>
            {game.teams[1] && <HudTeam team={game.teams[1]} active={game.currentTeamIndex === 1} align="right" />}
          </div>
          <div className="mt-1.5">
            <ProgressDots current={game.history.length} total={totalTurns} />
          </div>
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
  align?: "left" | "right" | "center";
}) {
  return (
    <div className={`min-w-0 ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
      <p className={`truncate text-[10px] font-bold ${active ? "text-white" : "text-tertiary"}`}>
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

export function RoundSetupScreen({
  game,
  onPhoneReady,
  onSelect,
  onCancelJokerSelection,
}: {
  game: GameState;
  onPhoneReady: () => void;
  onSelect: (themeId: string) => void;
  onCancelJokerSelection: () => void;
}) {
  const active = game.teams[game.currentTeamIndex];
  if (!active) throw new Error("Équipe active introuvable");
  const nextTeamIndex = (game.currentTeamIndex + 1) % game.teams.length;
  const master = game.teams[nextTeamIndex];
  if (!master) throw new Error("Équipe suivante introuvable");
  const waitingForPhone = game.status === "instructions" || game.status === "pass_phone";
  const choosingTheme = game.status === "joker_theme_selection";
  const proposedThemes = (game.turnThemeSelection?.proposedThemeIds ?? [])
    .map((id) => getTheme(id))
    .filter((item): item is Theme => Boolean(item));
  const jokerMode = game.turnThemeSelection?.selectionMode;
  const jokerLabel =
    jokerMode === "opponent_imposed" ? "Choisissez le thème à imposer" : "Choisissez votre thème";

  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center">
      <div className="text-center">
        <h1 className="balance text-[clamp(2rem,7vw,3rem)] font-black leading-[1.02] tracking-[-0.025em]">
          {active.name} répond
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-tertiary">
          {waitingForPhone ? "Passez le téléphone à " : null}
          <strong style={{ color: master.color }}>{master.name}</strong>
          {!waitingForPhone ? " garde le téléphone" : null}
        </p>
      </div>
      <div className="glass-panel mt-4 rounded-3xl p-3">
        {waitingForPhone ? (
          <>
            <div className="mb-2.5 px-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/62">
                Passage du téléphone
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[color:var(--surface-subtle)] p-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/[.07] text-xl text-[var(--accent-text)]"
                aria-hidden="true"
              >
                ▯
              </span>
              <div className="min-w-0 text-left">
                <p className="truncate text-base font-black leading-snug">{master.name}</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-tertiary">
                  Affiche les réponses, valide les bonnes
                </p>
              </div>
            </div>
            <Button className="mt-2.5 min-h-11 py-2" onClick={onPhoneReady}>
              J’ai le téléphone
            </Button>
          </>
        ) : null}

        {choosingTheme ? (
          <>
            <div className="mb-2.5 px-0.5">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/62">
                {jokerLabel}
              </p>
            </div>
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
            <button
              type="button"
              onClick={onCancelJokerSelection}
              className="mt-3 w-full rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-tertiary transition active:opacity-70"
            >
              Annuler le joker
            </button>
          </>
        ) : null}
      </div>
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
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[color:var(--surface-subtle)] text-lg text-[var(--accent-text)]"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-tertiary">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: teamColor }}
          />
          <span className="truncate">{teamName}</span>
        </span>
        <span className="mt-1 block truncate text-sm font-semibold">{label}</span>
        {!available ? (
          <span className="mt-0.5 block truncate text-[9px] text-tertiary">Joker déjà utilisé</span>
        ) : null}
      </span>
      <span className="pr-1 text-sm text-quaternary" aria-hidden="true">
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
      className={`flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-[color:var(--surface-subtle)] text-center transition active:scale-[.97] disabled:opacity-35 ${primaryChoice ? "min-h-28 px-3 py-4" : "min-h-24 px-2 py-3"}`}
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
          <span className="mt-1 text-[9px] leading-tight text-tertiary">{meta}</span>
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
      <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-tertiary">
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
  onDifficulty,
  onChangeTheme,
  onOpponentOverride,
}: {
  game: GameState;
  theme: Theme;
  onDifficulty: (difficulty: DifficultyLevel) => void;
  onChangeTheme: (() => void) | undefined;
  onOpponentOverride: (() => void) | undefined;
}) {
  const active = game.teams[game.currentTeamIndex];
  if (!active) throw new Error("Équipe active introuvable");
  const nextTeamIndex = (game.currentTeamIndex + 1) % game.teams.length;
  const master = game.teams[nextTeamIndex];
  if (!master) throw new Error("Équipe suivante introuvable");
  const availability = getDifficultyAvailability(questions, theme.id, game.usedQuestionIds);
  const method = game.turnThemeSelection?.selectionMode;
  const showJokers = onChangeTheme !== undefined || onOpponentOverride !== undefined;
  const activeJokerAvailable = game.teamJokers[active.id]?.themeChoiceAvailable ?? false;
  const opponentJokerAvailable = game.teamJokers[master.id]?.opponentThemeAvailable ?? false;
  const hasAnyJoker = activeJokerAvailable || opponentJokerAvailable;

  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center">
      <div className="text-center">
        <h1 className="balance text-[clamp(2rem,7vw,3rem)] font-black leading-[1.02] tracking-[-0.025em]">
          {active.name} répond
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-tertiary">
          <strong style={{ color: master.color }}>{master.name}</strong> garde le téléphone
        </p>
      </div>

      <div className="glass-panel mt-4 rounded-3xl p-3">
        {/* Thème */}
        <div className="mb-3 px-0.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/62">
            Thème du tour
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[color:var(--surface-subtle)] px-3 py-2.5">
          <span className="text-2xl" aria-hidden="true">
            {theme.icon}
          </span>
          <p className="min-w-0 flex-1 truncate text-base font-semibold">{theme.name}</p>
          {method === "opponent_imposed" ? (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--coral)]">
              Imposé
            </span>
          ) : method === "active_team_choice" ? (
            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-[var(--lime)]">
              Joker
            </span>
          ) : null}
        </div>

        {/* Classique / Challenge */}
        <div className="mt-4">
          <div className="mb-2.5 px-0.5">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/62">
              Choisissez votre mode
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DIFFICULTY_LEVELS.map((difficulty) => {
              const config = GAME_CONFIG.difficulties[difficulty];
              const meta =
                game.mode === "fun"
                  ? difficulty === 1
                    ? "Jusqu’à 3 gorgées"
                    : "Jusqu’à 5 gorgées"
                  : `${formatScore(calculateTurnScore(1, difficulty))} pts/réponse`;
              const isClassique = difficulty === 1;
              const accent = isClassique ? "#38bdf8" : "#c084fc";
              const icon = isClassique ? "⭐" : "⚡";
              return (
                <button
                  key={difficulty}
                  type="button"
                  disabled={availability[difficulty] < 1}
                  onClick={() => onDifficulty(difficulty)}
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
                    boxShadow: `0 0 16px color-mix(in srgb, ${accent} 14%, transparent)`,
                  }}
                  className="flex min-h-24 flex-col items-center justify-center rounded-2xl border bg-[color:var(--surface-subtle)] px-2 py-3 transition active:scale-[.97] disabled:opacity-35"
                >
                  <div className="relative">
                    <span
                      style={{ color: accent }}
                      className="absolute right-full top-1/2 -translate-y-1/2 pr-2 text-base opacity-80"
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                    <span className="block text-base font-black leading-tight">{config.label}</span>
                  </div>
                  <span
                    style={{ color: accent }}
                    className="mt-1.5 text-[10px] font-bold leading-tight"
                  >
                    {meta}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Jokers — uniquement si disponibles et activables depuis theme_reveal */}
        {showJokers && hasAnyJoker ? (
          <div className="mt-4">
            <div className="mb-2 px-0.5">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/62">
                Jokers
              </p>
            </div>
            <div className="grid gap-2">
              {onChangeTheme ? (
                <JokerChoice
                  icon="✦"
                  teamName={active.name}
                  teamColor={active.color}
                  label="Changer le thème"
                  available={activeJokerAvailable}
                  onClick={onChangeTheme}
                />
              ) : null}
              {onOpponentOverride ? (
                <JokerChoice
                  icon="◉"
                  teamName={master.name}
                  teamColor={master.color}
                  label="Imposer un thème"
                  available={opponentJokerAvailable}
                  onClick={onOpponentOverride}
                />
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      <p className="mt-3 text-center text-[11px] text-tertiary">
        {master.name} affiche les réponses à l’abri des regards.
      </p>
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
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-tertiary">
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
  const isReady = game.status === "question_ready";
  const isActive = game.status === "question_active";
  const expired = game.status === "turn_expired";
  const urgent = remainingSeconds <= GAME_CONFIG.warningSeconds;
  const critical = remainingSeconds <= GAME_CONFIG.criticalSeconds;
  const progress = (remainingSeconds / game.turnDurationSeconds) * 100;
  const bombActive = isBombTurn(game);
  const [isBombExplanationOpen, setIsBombExplanationOpen] = useState(false);

  return (
    <section className="flex min-h-0 flex-1 flex-col pb-1">
      <div
        className={`glass-panel flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl ${critical ? "border-[var(--coral)]/60" : ""}`}
      >
        <div className="p-3 pb-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-tertiary">
              {theme.name} · {question.difficultyLabel}
            </p>
            <div
              className={`text-right ${critical ? "text-[var(--coral)]" : urgent ? "text-amber-300" : "text-white"}`}
            >
              <span className="display-face block text-4xl leading-none tabular-nums">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-tertiary">
                {isReady ? "prêt" : expired ? "terminé" : "restantes"}
              </span>
            </div>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-[width] duration-200 ${critical ? "bg-[var(--coral)]" : urgent ? "bg-amber-300" : "bg-[var(--lime)]"}`}
              style={{ width: `${Math.max(0, progress)}%` }}
            />
          </div>
          <h1 className="balance mt-4 text-[clamp(1.15rem,5.5vw,1.7rem)] font-black leading-[1.08]">
            {question.question}
          </h1>
        </div>

        {/* Zone flexible : absorbe l'espace restant et centre la grille au lieu
            de laisser un vide sous les cartes ou d'étirer les cartes elles-mêmes. */}
        <div className="flex min-h-0 flex-1 flex-col justify-center gap-1.5 border-t border-white/10 bg-black/10 p-2">
          <div
            className="answer-grid grid grid-cols-3 gap-1.5"
            style={{ gridAutoRows: "minmax(3.6rem, auto)" }}
          >
            {question.answers.map((answer) => {
              const found = game.revealedAnswerIds.includes(answer.id);
              return (
                <button
                  key={answer.id}
                  type="button"
                  disabled={!isActive}
                  onClick={() => onAnswer(answer.id)}
                  className={`answer-choice flex items-center justify-center rounded-xl border px-1.5 py-1 text-center text-[clamp(.62rem,2.8vw,.8rem)] font-black leading-[1.05] transition active:scale-[.96] ${found ? "border-[var(--lime)]/50 bg-[var(--lime)] text-[var(--accent-ink)]" : "border-white/10 bg-white/[.055] text-white disabled:opacity-72"}`}
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
                  disabled={!isActive}
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

        {/* Réponses / score : intégrés en pied de panneau, comme le score
            d'un match — pas de bloc flottant séparé sous le panel. */}
        <div className="flex items-end justify-between gap-4 border-t border-white/10 px-3 py-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary">
              Réponses
            </p>
            <p className="display-face text-3xl">
              {game.revealedAnswerIds.length}
              <span className="text-quaternary">/9</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-tertiary">
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
  onToggleAnswer,
  onContinue,
}: {
  game: GameState;
  onToggleAnswer: (answerId: string) => void;
  onContinue: () => void;
}) {
  const result = game.history.at(-1);
  const orderedAnswers = useMemo(
    () => (result ? [...result.foundAnswers, ...result.missedAnswers] : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result?.id],
  );
  if (!result) return null;

  const isFunMode = game.mode === "fun";
  const reward = isFunMode
    ? calculateFunSips(result.foundAnswers.length, result.difficultyLevel, result.bombTriggered)
    : result.pointsEarned;
  const foundSet = new Set(result.foundAnswerIds);

  return (
    <section className="flex min-h-0 flex-1 flex-col justify-center pb-1">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-text)]">
          Tour terminé
        </p>
        <p className="score-pop display-face mt-3 text-6xl leading-none text-[var(--accent-text)]">
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
        <h1 className="balance mx-auto mt-3 max-w-xl text-[clamp(1rem,3.8vw,1.3rem)] font-black leading-tight">
          {result.questionText}
        </h1>
      </div>
      <ResultAnswerGrid
        answers={orderedAnswers}
        foundSet={foundSet}
        foundCount={result.foundAnswerIds.length}
        onToggle={onToggleAnswer}
      />
      <div className="mt-5">
        <Button className="min-h-11 py-2" onClick={onContinue}>
          {game.history.length >= game.roundsPerTeam * 2 ? "Résultat final" : "Tour suivant"}
        </Button>
      </div>
    </section>
  );
}

function ResultAnswerGrid({
  answers,
  foundSet,
  foundCount,
  onToggle,
}: {
  answers: Array<{ id: string; display: string }>;
  foundSet: Set<string>;
  foundCount: number;
  onToggle: (answerId: string) => void;
}) {
  return (
    <section className="mt-5">
      <div className="mb-2.5 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.1em]">
        <h2 className="text-white/62">Réponses</h2>
        <p className="text-[var(--accent-text)]">{foundCount}/9 trouvées</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {answers.map((answer) => {
          const found = foundSet.has(answer.id);
          return (
            <button
              key={answer.id}
              type="button"
              onClick={() => onToggle(answer.id)}
              aria-pressed={found}
              className={`flex min-h-14 items-center justify-center rounded-xl border px-2 py-2 text-center text-[clamp(.76rem,2.8vw,.92rem)] font-semibold leading-[1.15] transition active:scale-[.96] ${found ? "border-[var(--lime)]/40 bg-[var(--lime)]/[.12] text-white" : "border-white/10 bg-white/[.03] text-white/62"}`}
            >
              <span>
                {answer.display}
                {found ? (
                  <span className="ml-1 text-[var(--accent-text)]" aria-label="obtenue">
                    ✓
                  </span>
                ) : (
                  <span className="sr-only"> — manquée</span>
                )}
              </span>
            </button>
          );
        })}
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
  const standing = getWinner(game);
  return (
    <section className="flex flex-1 flex-col justify-center">
      <div className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent-text)]">
          Manche {game.currentRound - 1} terminée
        </p>
        <h1 className="display-face mt-3 text-6xl">Point scores.</h1>
        <p className="mt-3 text-sm text-white/62">
          {standing.kind === "winner"
            ? `${standing.winner!.name} mène la partie.`
            : "Égalité parfaite pour le moment."}
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
                  <p className="mt-1 text-xs text-tertiary">
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
      <p className="mt-5 text-center text-xs text-tertiary">
        Il reste {game.roundsPerTeam * game.teams.length - game.history.length} tours.
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
      <div className={`mt-8 grid gap-3 ${game.teams.length === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
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
              <p className="mt-1 text-[10px] uppercase tracking-wider text-tertiary">
                {answers} bonnes réponses
              </p>
            </div>
          );
        })}
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
