"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  draftSchema,
  type AssistantMode,
  type AssistantRequest,
  type Draft,
} from "../../../supabase/functions/_shared/sport-ai-contract";
import coachKnowledge from "../../../supabase/functions/_shared/coach-knowledge.json";
import { equipmentLabels, exercises, sessionLabels, type Equipment } from "../catalog";
import type { Session, SessionTemplateExercise } from "../model";
import { useSportCloud } from "../cloud/provider";
import { requestSportAssistant } from "../cloud/ai-client";
import { buildAssistantContext } from "./context";
import { draftToTemplate } from "./draft";
import { CoachAvatar } from "./coach-avatar";
import styles from "./assistant.module.css";

type Template = { name: string; kind: Draft["kind"]; exercises: SessionTemplateExercise[] };
type Message = AssistantRequest["messages"][number] & {
  observations?: { text: string; sessionIds: string[] }[];
};
type Configuration = Omit<Draft["exercises"][number], "superset">;
const titles: Record<AssistantMode, string> = {
  prepare: "Préparer ma séance",
  import: "Depuis un texte",
  review: "Faire le point sur cette séance",
  progress: "Comprendre ma progression",
};
const prompts: Record<AssistantMode, string> = {
  prepare: "Quel est votre objectif, votre matériel et le temps disponible ?",
  import: "Collez votre programme. Précisez les charges et le matériel si nécessaire.",
  review: "Que souhaitez-vous comprendre ou ajuster dans cette séance ?",
  progress: "Sur quels exercices ou aspects de votre progression souhaitez-vous faire le point ?",
};

function ConfigEditor({
  value,
  onChange,
}: {
  value: Configuration;
  onChange: (next: Configuration) => void;
}) {
  const exercise = exercises.find((item) => item.id === value.exerciseId);
  const fields = [
    ["sets", "Séries", 1, 30, 1],
    ["reps", "Répétitions (facultatif)", 1, 200, 1],
    ["restSeconds", "Repos (secondes)", 5, 1800, 1],
    [
      "loadKg",
      value.equipment === "dumbbell"
        ? "kg par haltère"
        : value.equipment === "barbell"
          ? "kg, barre comprise"
          : value.equipment === "bodyweight"
            ? "Lest ajouté (kg)"
            : "Charge (kg)",
      0,
      2000,
      0.5,
    ],
  ] as const;
  return (
    <div className={styles.config}>
      <label>
        Exercice
        <select
          value={value.exerciseId}
          onChange={(event) => {
            const selected = exercises.find((item) => item.id === event.target.value)!;
            onChange({
              ...value,
              exerciseId: selected.id,
              equipment:
                value.equipment && selected.equipment.includes(value.equipment)
                  ? value.equipment
                  : null,
            });
          }}
        >
          {exercises.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Matériel
        <select
          value={value.equipment ?? ""}
          onChange={(event) =>
            onChange({ ...value, equipment: (event.target.value || null) as Equipment | null })
          }
        >
          <option value="">À préciser</option>
          {exercise?.equipment.map((equipment) => (
            <option key={equipment} value={equipment}>
              {equipmentLabels[equipment]}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.fields}>
        {fields.map(([field, label, min, max, step]) => (
          <label key={field}>
            {label}
            <input
              type="number"
              inputMode={field === "loadKg" ? "decimal" : "numeric"}
              min={min}
              max={max}
              step={step}
              placeholder="À préciser"
              value={value[field] ?? ""}
              onChange={(event) =>
                onChange({
                  ...value,
                  [field]: event.target.value === "" ? null : Number(event.target.value),
                })
              }
            />
          </label>
        ))}
      </div>
    </div>
  );
}

export function SportAssistant({
  mode,
  history,
  focusSessionId = null,
  onClose,
  onStart,
  onSave,
  hasActiveSession,
}: {
  mode: AssistantMode;
  history: Session[];
  focusSessionId?: string | null;
  onClose: () => void;
  onStart: (template: Template) => boolean;
  onSave: (template: Template) => boolean;
  hasActiveSession: boolean;
}) {
  const cloud = useSportCloud();
  const dialog = useRef<HTMLDialogElement>(null);
  const pending = useRef<AbortController | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [consent, setConsent] = useState(false);
  const [shareHistory, setShareHistory] = useState(false);
  const [rangeDays, setRangeDays] = useState<30 | 90>(30);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const previousFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const updateOnline = () => setOnline(navigator.onLine);
    updateOnline();
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      pending.current?.abort();
      element?.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);
  const accountReady = Boolean(cloud.session && cloud.profile);
  const template = draft && draft.questions.length === 0 ? draftToTemplate(draft) : null;
  const selectedHistory = shareHistory ? history : [];
  const context = buildAssistantContext(
    selectedHistory,
    rangeDays,
    mode === "review" && shareHistory ? focusSessionId : null,
  );
  const needsHistory = mode === "review" || mode === "progress";
  const readyToSend =
    !needsHistory || (shareHistory && (mode !== "review" || Boolean(context.focusSessionId)));

  async function send() {
    const content = text.trim();
    if (!content || busy || pending.current || !consent || !accountReady || !online || !readyToSend)
      return;
    if (draft && !draftSchema.safeParse(draft).success) {
      setError(
        "Vérifiez le brouillon : nom, nombre d’exercices, valeurs autorisées et nombre de tours identique dans chaque superset.",
      );
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    setStatus("");
    const nextMessages = [
      ...messages.map(({ role, content }) => ({ role, content })),
      { role: "user" as const, content },
    ].slice(-8);
    while (nextMessages.reduce((total, message) => total + message.content.length, 0) > 24000)
      nextMessages.shift();
    try {
      const response = await requestSportAssistant(
        {
          mode,
          messages: nextMessages,
          context,
          draft,
        },
        controller.signal,
      );
      if (controller.signal.aborted) return;
      setMessages(
        [
          ...nextMessages,
          {
            role: "assistant" as const,
            content: response.message,
            observations: response.observations,
          },
        ].slice(-8),
      );
      if (response.draft) setDraft(response.draft);
      setText("");
    } catch (caught) {
      if (!controller.signal.aborted)
        setError(
          caught instanceof Error
            ? caught.message
            : "L’assistant est indisponible. Réessayez dans un instant.",
        );
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  }
  function cancel() {
    pending.current?.abort();
    pending.current = null;
    setBusy(false);
    setStatus("Demande annulée. Votre texte est conservé.");
  }
  function editExercise(index: number, next: Draft["exercises"][number]) {
    setDraft((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((exercise, i) => (i === index ? next : exercise)),
          }
        : null,
    );
    setStatus("");
  }

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="sport-assistant-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className={styles.header}>
        <div className={styles.identity}>
          <CoachAvatar thinking={busy} />
          <div>
            <p className={styles.eyebrow}>Milo · coach IA</p>
            <h2 id="sport-assistant-title">{titles[mode]}</h2>
          </div>
        </div>
        <button
          className={styles.close}
          type="button"
          onClick={onClose}
          aria-label="Fermer l’assistant"
        >
          ✕
        </button>
      </div>
      <div className={styles.body}>
        <p className={styles.intro}>{prompts[mode]}</p>
        {!accountReady ? (
          <div className={styles.card}>
            <p>Connectez votre compte Sport pour utiliser l’assistant.</p>
            <Link href="/sport/compte" onClick={onClose}>
              Ouvrir mon compte
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.privacy}>
              <p>Votre demande passe par OpenRouter et OpenAI, uniquement après votre accord.</p>
              <details>
                <summary>Vos données avant chaque envoi</summary>
                <p>
                  Votre texte, les derniers échanges (8 messages maximum) et le brouillon sont
                  envoyés à notre service, puis à OpenRouter et au fournisseur OpenAI pour produire
                  une réponse. Évitez toute information personnelle ou médicale dans votre texte.
                </p>
                <p>
                  Vous pouvez joindre les séries validées, dates et statistiques utiles du carnet.
                  La période précédente de même durée sert de comparaison ; au maximum 12 séances et
                  80 séries par séance sont détaillées. Les commentaires, photos et données des amis
                  sont exclus. Cette conversation reste en mémoire et disparaît à la fermeture.
                </p>
              </details>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                  disabled={busy}
                />
                J’accepte cet envoi à l’assistant pour cette conversation.
              </label>
            </div>
            <div className={styles.card}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={shareHistory}
                  onChange={(event) => setShareHistory(event.target.checked)}
                  disabled={busy}
                />
                {mode === "review"
                  ? "Joindre cette séance et mes séances récentes"
                  : "Joindre les données de mon carnet"}
              </label>
              {mode !== "review" && shareHistory && (
                <label className={styles.range}>
                  Période
                  <select
                    value={rangeDays}
                    onChange={(event) => setRangeDays(Number(event.target.value) as 30 | 90)}
                    disabled={busy}
                  >
                    <option value={30}>30 derniers jours</option>
                    <option value={90}>90 derniers jours</option>
                  </select>
                </label>
              )}
              <p className={styles.muted}>
                {shareHistory
                  ? `${context.recentSessions.length} séance(s) détaillée(s) ; bilan de ${context.summary.sessions} séance(s) sur la période et ${context.previousSummary.sessions} sur la période précédente.`
                  : "Aucune donnée de séance jointe."}
              </p>
              {context.recentSessions.length > 0 && (
                <details>
                  <summary>Voir les séances sélectionnées</summary>
                  <ul>
                    {context.recentSessions.map((session) => (
                      <li key={session.id}>
                        {sessionLabels[session.kind]} ·{" "}
                        {new Date(session.date).toLocaleDateString("fr-FR")}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
            <div
              className={styles.conversation}
              role="log"
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages.map((message, index) => (
                <article
                  className={`${styles.message} ${message.role === "user" ? styles.user : ""}`}
                  key={index}
                >
                  <strong>{message.role === "user" ? "Vous" : "Milo"}</strong>
                  <p>{message.content}</p>
                  {message.observations?.map((observation, i) => (
                    <div key={i} className={styles.observation}>
                      <p>{observation.text}</p>
                      {observation.sessionIds.length > 0 && (
                        <small>
                          Séances :{" "}
                          {observation.sessionIds
                            .map((id) => {
                              const session = history.find((item) => item.id === id);
                              return session
                                ? new Date(session.startedAt).toLocaleDateString("fr-FR")
                                : "référence indisponible";
                            })
                            .join(", ")}
                        </small>
                      )}
                    </div>
                  ))}
                </article>
              ))}
            </div>
            {draft && (
              <section className={styles.draft} aria-labelledby="sport-assistant-draft-title">
                <h3 id="sport-assistant-draft-title">Brouillon de séance</h3>
                <p>Vérifiez chaque réglage avant de démarrer ou d’enregistrer.</p>
                <details className={styles.unitHelp}>
                  <summary>Comprendre les charges et le matériel</summary>
                  <p>
                    Les charges d’haltères sont par haltère ; une barre inclut son poids ; au poids
                    du corps, indiquez uniquement le lest ajouté (0 sans lest).
                  </p>
                </details>
                <fieldset disabled={busy}>
                  <label>
                    Nom
                    <input
                      value={draft.name}
                      maxLength={100}
                      onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                    />
                  </label>
                  <label>
                    Format
                    <select
                      value={draft.kind}
                      onChange={(event) =>
                        setDraft({ ...draft, kind: event.target.value as Draft["kind"] })
                      }
                    >
                      {Object.entries(sessionLabels).map(([kind, label]) => (
                        <option key={kind} value={kind}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {draft.questions.length > 0 && (
                    <div className={styles.questions}>
                      <h4>Points à préciser</h4>
                      <p>
                        Répondez dans la conversation ou corrigez le brouillon, puis confirmez
                        chaque point résolu.
                      </p>
                      {draft.questions.map((question, index) => (
                        <div key={index}>
                          <p>{question}</p>
                          <button
                            type="button"
                            onClick={() =>
                              setDraft({
                                ...draft,
                                questions: draft.questions.filter((_, i) => i !== index),
                              })
                            }
                          >
                            J’ai vérifié ce point
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {draft.exercises.map((exercise, index) => (
                    <fieldset className={styles.exercise} key={index}>
                      <legend>
                        Exercice {index + 1}
                        {exercise.superset ? " · superset" : ""}
                      </legend>
                      <ConfigEditor
                        value={exercise}
                        onChange={(next) =>
                          editExercise(index, { ...next, superset: exercise.superset })
                        }
                      />
                      {exercise.superset && (
                        <div className={styles.superset}>
                          <h4>Deuxième mouvement</h4>
                          <ConfigEditor
                            value={exercise.superset}
                            onChange={(next) =>
                              editExercise(index, { ...exercise, superset: next })
                            }
                          />
                          <button
                            type="button"
                            onClick={() => editExercise(index, { ...exercise, superset: null })}
                          >
                            Retirer le superset
                          </button>
                        </div>
                      )}
                      <div className={styles.actions}>
                        {!exercise.superset && (
                          <button
                            type="button"
                            onClick={() =>
                              editExercise(index, {
                                ...exercise,
                                superset: {
                                  exerciseId: exercises[0]!.id,
                                  equipment: null,
                                  sets: null,
                                  reps: null,
                                  restSeconds: null,
                                  loadKg: null,
                                },
                              })
                            }
                          >
                            Ajouter un superset
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              ...draft,
                              exercises: draft.exercises.filter((_, i) => i !== index),
                            })
                          }
                        >
                          Retirer cet exercice
                        </button>
                      </div>
                    </fieldset>
                  ))}
                  <button
                    type="button"
                    disabled={draft.exercises.length >= 12}
                    onClick={() =>
                      setDraft({
                        ...draft,
                        exercises: [
                          ...draft.exercises,
                          {
                            exerciseId: exercises[0]!.id,
                            equipment: null,
                            sets: null,
                            reps: null,
                            restSeconds: null,
                            loadKg: null,
                            superset: null,
                          },
                        ],
                      })
                    }
                  >
                    Ajouter un exercice
                  </button>
                </fieldset>
                {!template && (
                  <p className={styles.muted}>
                    Complétez les réglages et vérifiez les points à préciser pour démarrer ou
                    enregistrer.
                  </p>
                )}
                {hasActiveSession && (
                  <p>
                    Une séance est déjà en cours. Terminez-la avant d’en démarrer une autre. Vous
                    pouvez enregistrer ce brouillon en favori.
                  </p>
                )}
                <div className={styles.actions}>
                  <button
                    className={styles.primary}
                    type="button"
                    disabled={!template || hasActiveSession || busy || !accountReady}
                    onClick={() => {
                      if (template && onStart(template)) onClose();
                      else
                        setError(
                          "Impossible de démarrer : vérifiez votre compte et votre séance en cours.",
                        );
                    }}
                  >
                    Démarrer cette séance
                  </button>
                  <button
                    type="button"
                    disabled={!template || busy || !accountReady}
                    onClick={() => {
                      if (template && onSave(template))
                        setStatus("Séance enregistrée dans vos favoris.");
                      else setError("Impossible d’enregistrer la séance. Réessayez.");
                    }}
                  >
                    Enregistrer en favori
                  </button>
                </div>
              </section>
            )}
            <form
              className={styles.composer}
              onSubmit={(event) => {
                event.preventDefault();
                void send();
              }}
            >
              <label htmlFor="sport-assistant-message">
                {messages.length
                  ? "Votre réponse ou vos ajustements"
                  : mode === "import"
                    ? "Votre programme"
                    : "Votre demande"}
              </label>
              <textarea
                id="sport-assistant-message"
                rows={4}
                maxLength={4000}
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={busy}
                placeholder={
                  mode === "import"
                    ? "Exemple : développé couché, 3 × 8, barre de 40 kg au total, repos 120 s…"
                    : mode === "review"
                      ? "Exemple : comment cette séance se compare-t-elle aux précédentes ?"
                      : mode === "progress"
                        ? "Exemple : sur quels exercices ai-je progressé ces 30 derniers jours ?"
                        : "Exemple : une séance haut du corps de 45 minutes avec des haltères…"
                }
              />
              <small className={styles.muted}>{text.length}/4 000 caractères</small>
              {!online && (
                <p role="status">
                  Vous êtes hors ligne. Votre texte est conservé ; reconnectez-vous pour l’envoyer.
                </p>
              )}
              {error && (
                <p className={styles.error} role="alert">
                  {error}
                </p>
              )}
              <div className={styles.actions}>
                {busy ? (
                  <>
                    <p role="status">Milo prépare sa réponse…</p>
                    <button type="button" onClick={cancel}>
                      Annuler la demande
                    </button>
                  </>
                ) : (
                  <button
                    className={styles.primary}
                    disabled={!text.trim() || !consent || !online || !readyToSend}
                    type="submit"
                  >
                    Envoyer à l’assistant
                  </button>
                )}
              </div>
              {!consent && (
                <p className={styles.muted}>
                  Consultez les données envoyées et cochez votre accord pour activer l’envoi.
                </p>
              )}
              {!readyToSend && (
                <p className={styles.muted}>
                  Joignez les données de {mode === "review" ? "cette séance" : "votre carnet"} pour
                  demander ce bilan.
                </p>
              )}
            </form>
          </>
        )}
        {status && <p role="status">{status}</p>}
        <p className={styles.muted}>
          Les propositions peuvent contenir des erreurs. Adaptez-les à vos capacités ; l’assistant
          ne fournit pas de diagnostic médical.
        </p>
        <details className={styles.unitHelp}>
          <summary>Les repères de Milo</summary>
          <p>
            Repères vérifiés le 20/10/2026. Milo s’appuie sur cette synthèse et n’effectue pas de
            recherche web en direct.
          </p>
          <ul>
            {coachKnowledge.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </dialog>
  );
}
