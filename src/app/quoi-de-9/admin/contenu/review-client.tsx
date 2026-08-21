"use client";

import { useEffect, useMemo, useState } from "react";
import rawBundle from "@/games/quoi-de-9/generated/content-review-bundle.json";
import { Brand } from "@/games/quoi-de-9/components/brand";
import { Button, inputClassName } from "@/games/quoi-de-9/components/ui";
import { DIFFICULTY_LABELS, type DifficultyLevel } from "@/games/quoi-de-9/lib/game/config";
import { normalizeText } from "@/games/quoi-de-9/lib/text/encoding";

type ReviewStatus = "verified" | "rejected";

interface QuestionEdits {
  questionText: string;
  difficultyLevel: DifficultyLevel;
  answerAliases: Record<string, string[]>;
}

interface ReviewDecision {
  questionId: string;
  status: ReviewStatus;
  reason?: string;
  edits?: QuestionEdits;
  reviewedAt: string;
}

interface ReviewQuestion {
  id: string;
  themeId: string;
  questionText: string;
  shortTitle: string;
  difficultyLevel: DifficultyLevel;
  difficultyLabel: string;
  status: string;
  qualificationRule: string;
  exclusionNotes?: string;
  explanation: string;
  answers: Array<{
    id: string;
    display: string;
    aliases: string[];
    abbreviations: string[];
    alternativeSpellings: string[];
  }>;
  sources: Array<{ id: string; title: string; publisher: string; url: string }>;
}

const bundle = rawBundle as {
  contentVersion: string;
  themes: Array<{ id: string; label: string }>;
  questions: ReviewQuestion[];
  duplicateWarnings: Array<{
    type: string;
    questionIds: string[];
    score: number;
  }>;
};
const STORAGE_KEY = `qui-des-9-content-review-${bundle.contentVersion}`;

export function ContentReviewClient() {
  const [themeId, setThemeId] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(bundle.questions[0]?.id ?? "");
  const [decisions, setDecisions] = useState<ReviewDecision[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as ReviewDecision[];
      const timeout = window.setTimeout(() => setDecisions(parsed), 0);
      return () => window.clearTimeout(timeout);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const latestDecision = useMemo(
    () => new Map(decisions.map((decision) => [decision.questionId, decision])),
    [decisions],
  );
  const filtered = useMemo(() => {
    const needle = normalizeText(search).toLocaleLowerCase("fr").trim();
    return bundle.questions.filter((question) => {
      const effectiveStatus = latestDecision.get(question.id)?.status ?? question.status;
      return (
        (themeId === "all" || question.themeId === themeId) &&
        (difficulty === "all" || question.difficultyLevel === Number(difficulty)) &&
        (status === "all" || effectiveStatus === status) &&
        (!needle ||
          `${question.questionText} ${question.shortTitle} ${question.answers
            .map((answer) => answer.display)
            .join(" ")}`
            .toLocaleLowerCase("fr")
            .includes(needle))
      );
    });
  }, [difficulty, latestDecision, search, status, themeId]);

  const selected = bundle.questions.find((question) => question.id === selectedId) ?? filtered[0];
  const selectedDecision = selected ? latestDecision.get(selected.id) : undefined;
  const selectedHistory = selected
    ? [...decisions.filter((decision) => decision.questionId === selected.id)].reverse()
    : [];
  const displayed = selected ? applyEdits(selected, selectedDecision?.edits) : undefined;
  const duplicateWarnings = selected
    ? bundle.duplicateWarnings.filter((warning) => warning.questionIds.includes(selected.id))
    : [];

  function recordDecision(
    questionId: string,
    nextStatus: ReviewStatus,
    reason: string,
    edits: QuestionEdits,
  ) {
    const cleanReason = normalizeText(reason.trim());
    if (nextStatus === "rejected" && cleanReason.length < 4) return;
    const next: ReviewDecision = {
      questionId,
      status: nextStatus,
      ...(cleanReason ? { reason: cleanReason } : {}),
      edits,
      reviewedAt: new Date().toISOString(),
    };
    const updated = [...decisions, next];
    setDecisions(updated);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function exportDecisions() {
    const payload = JSON.stringify(
      { contentVersion: bundle.contentVersion, exportedAt: new Date().toISOString(), decisions },
      null,
      2,
    );
    const url = URL.createObjectURL(
      new Blob([payload], { type: "application/json;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `content-review-${bundle.contentVersion}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="safe-shell mx-auto min-h-[100dvh] w-full max-w-[1180px] pb-10">
      <header className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Brand compact />
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent-text)]">
            Outil local · développement uniquement
          </p>
          <p className="mt-1 text-xs text-white/38">Contenu {bundle.contentVersion}</p>
        </div>
      </header>

      <section className="glass-panel grid gap-3 rounded-3xl p-4 md:grid-cols-4">
        <select
          className={inputClassName}
          value={themeId}
          onChange={(event) => setThemeId(event.target.value)}
        >
          <option value="all">Tous les thèmes</option>
          {bundle.themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
        <select
          className={inputClassName}
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value)}
        >
          <option value="all">Toutes les difficultés</option>
          {([1, 2] as const).map((level) => (
            <option key={level} value={level}>
              Niveau {level} — {DIFFICULTY_LABELS[level]}
            </option>
          ))}
        </select>
        <select
          className={inputClassName}
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Tous les statuts</option>
          {["draft", "needs_review", "published", "verified", "rejected"].map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
        <input
          className={inputClassName}
          type="search"
          placeholder="Question ou réponse…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="glass-panel max-h-[78dvh] overflow-y-auto rounded-3xl p-3">
          <div className="flex items-center justify-between px-2 pb-3 text-xs text-white/40">
            <span>{filtered.length} fiche(s)</span>
            <span>{decisions.length} décision(s)</span>
          </div>
          <div className="grid gap-2">
            {filtered.map((question) => {
              const effectiveStatus = latestDecision.get(question.id)?.status ?? question.status;
              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setSelectedId(question.id)}
                  className={`rounded-2xl border p-3 text-left transition ${selected?.id === question.id ? "border-[var(--lime)]/50 bg-[var(--lime)]/[.08]" : "border-white/8 bg-white/[.025]"}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider text-white/35">
                    {question.themeId} · N{question.difficultyLevel} · {effectiveStatus}
                  </span>
                  <span className="mt-1 block text-sm font-bold leading-snug">
                    {question.shortTitle}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {selected && displayed ? (
          <article className="grid content-start gap-5">
            <section className="glass-panel rounded-3xl p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--accent-text)]">
                Aperçu en jeu · {displayed.themeId} · Niveau {displayed.difficultyLevel} —{" "}
                {displayed.difficultyLabel}
              </p>
              <h1 className="balance mt-4 text-3xl font-black leading-tight">
                {displayed.questionText}
              </h1>
              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                {displayed.answers.map((answer) => (
                  <div
                    key={answer.id}
                    className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-sm font-black"
                  >
                    {answer.display}
                    {[...answer.aliases, ...answer.abbreviations, ...answer.alternativeSpellings]
                      .length ? (
                      <span className="mt-1 block text-[10px] font-normal text-white/35">
                        {[
                          ...answer.aliases,
                          ...answer.abbreviations,
                          ...answer.alternativeSpellings,
                        ].join(" · ")}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-3xl p-5 text-sm leading-relaxed">
              <h2 className="text-lg font-black">Périmètre éditorial</h2>
              <p className="mt-3 text-white/65">
                <strong>Règle :</strong> {displayed.qualificationRule}
              </p>
              {displayed.exclusionNotes ? (
                <p className="mt-2 text-white/65">
                  <strong>Exclusions :</strong> {displayed.exclusionNotes}
                </p>
              ) : null}
              <p className="mt-2 text-white/65">
                <strong>Explication :</strong> {displayed.explanation}
              </p>
              <h3 className="mt-5 font-black">Sources</h3>
              {displayed.sources.length ? (
                <ul className="mt-2 grid gap-2">
                  {displayed.sources.map((source) => (
                    <li key={source.id}>
                      <a
                        className="text-[var(--accent-text)] underline"
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {source.title} — {source.publisher}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[var(--coral)]">Aucune source : publication interdite.</p>
              )}
            </section>

            <LocalReviewPanel
              key={`${selected.id}-${selectedDecision?.reviewedAt ?? "new"}`}
              question={displayed}
              history={selectedHistory}
              duplicateWarnings={duplicateWarnings}
              canExport={decisions.length > 0}
              onDecision={recordDecision}
              onExport={exportDecisions}
            />
          </article>
        ) : (
          <p className="glass-panel rounded-3xl p-8 text-center text-white/45">
            Aucune fiche ne correspond aux filtres.
          </p>
        )}
      </div>
    </main>
  );
}

function applyEdits(question: ReviewQuestion, edits?: QuestionEdits): ReviewQuestion {
  if (!edits) return question;
  return {
    ...question,
    questionText: edits.questionText,
    difficultyLevel: edits.difficultyLevel,
    difficultyLabel: DIFFICULTY_LABELS[edits.difficultyLevel],
    answers: question.answers.map((answer) => ({
      ...answer,
      aliases: edits.answerAliases[answer.id] ?? answer.aliases,
    })),
  };
}

function LocalReviewPanel({
  question,
  history,
  duplicateWarnings,
  canExport,
  onDecision,
  onExport,
}: {
  question: ReviewQuestion;
  history: ReviewDecision[];
  duplicateWarnings: Array<{ type: string; questionIds: string[]; score: number }>;
  canExport: boolean;
  onDecision: (
    questionId: string,
    status: ReviewStatus,
    reason: string,
    edits: QuestionEdits,
  ) => void;
  onExport: () => void;
}) {
  const [reason, setReason] = useState("");
  const [edits, setEdits] = useState<QuestionEdits>(() => ({
    questionText: question.questionText,
    difficultyLevel: question.difficultyLevel,
    answerAliases: Object.fromEntries(
      question.answers.map((answer) => [answer.id, [...answer.aliases]]),
    ),
  }));

  return (
    <section className="glass-panel rounded-3xl p-5">
      <h2 className="text-lg font-black">Édition et décision locales</h2>
      <p className="mt-1 text-xs text-white/40">
        Les changements restent dans ce navigateur. Exportez l’historique pour les appliquer aux
        fichiers source.
      </p>

      <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-white/45">
        Question
        <textarea
          className={`${inputClassName} min-h-28 resize-y py-3 normal-case tracking-normal`}
          value={edits.questionText}
          onChange={(event) =>
            setEdits((current) => ({
              ...current,
              questionText: normalizeText(event.target.value),
            }))
          }
        />
      </label>
      <label className="mt-3 grid gap-2 text-xs font-black uppercase tracking-wider text-white/45">
        Difficulté
        <select
          className={inputClassName}
          value={edits.difficultyLevel}
          onChange={(event) =>
            setEdits((current) => ({
              ...current,
              difficultyLevel: Number(event.target.value) as DifficultyLevel,
            }))
          }
        >
          {([1, 2] as const).map((level) => (
            <option key={level} value={level}>
              Niveau {level} — {DIFFICULTY_LABELS[level]}
            </option>
          ))}
        </select>
      </label>

      <h3 className="mt-5 text-xs font-black uppercase tracking-wider text-white/45">
        Alias acceptés
      </h3>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {question.answers.map((answer) => (
          <label key={answer.id} className="grid gap-1 text-xs text-white/55">
            {answer.display}
            <input
              className={`${inputClassName} min-h-11 text-sm`}
              placeholder="alias séparés par des virgules"
              value={(edits.answerAliases[answer.id] ?? []).join(", ")}
              onChange={(event) =>
                setEdits((current) => ({
                  ...current,
                  answerAliases: {
                    ...current.answerAliases,
                    [answer.id]: event.target.value
                      .split(",")
                      .map((alias) => normalizeText(alias.trim()))
                      .filter(Boolean),
                  },
                }))
              }
            />
          </label>
        ))}
      </div>

      {duplicateWarnings.length > 0 ? (
        <div className="mt-5 rounded-2xl border border-amber-300/25 bg-amber-300/[.07] p-3 text-sm">
          <strong>Doublons potentiels</strong>
          {duplicateWarnings.map((warning) => (
            <p
              key={`${warning.type}-${warning.questionIds.join("-")}`}
              className="mt-1 text-white/60"
            >
              {warning.type} · {warning.questionIds.join(" / ")} · {Math.round(warning.score * 100)}{" "}
              %
            </p>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-xs text-white/35">Aucun doublon exact ou proche signalé.</p>
      )}

      <textarea
        className={`${inputClassName} mt-4 min-h-24 resize-y py-3`}
        placeholder="Motif obligatoire pour un rejet…"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      />
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Button onClick={() => onDecision(question.id, "verified", reason, edits)}>
          Enregistrer et vérifier
        </Button>
        <Button
          variant="secondary"
          disabled={reason.trim().length < 4}
          onClick={() => onDecision(question.id, "rejected", reason, edits)}
        >
          Rejeter avec motif
        </Button>
        <Button variant="ghost" disabled={!canExport} onClick={onExport}>
          Exporter l’historique
        </Button>
      </div>

      <h3 className="mt-6 text-xs font-black uppercase tracking-wider text-white/45">
        Historique de revue · {history.length}
      </h3>
      <div className="mt-2 grid gap-2">
        {history.map((decision) => (
          <div key={decision.reviewedAt} className="rounded-2xl bg-white/[.04] p-3 text-xs">
            <strong>{decision.status}</strong> ·{" "}
            {new Date(decision.reviewedAt).toLocaleString("fr-FR")}
            {decision.reason ? (
              <span className="mt-1 block text-white/50">{decision.reason}</span>
            ) : null}
          </div>
        ))}
        {history.length === 0 ? (
          <p className="text-xs text-white/35">Aucune décision locale.</p>
        ) : null}
      </div>
    </section>
  );
}
