"use client";

import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  draftSchema,
  type AssistantMode,
  type AssistantRequest,
  type Draft,
} from "../../../supabase/functions/_shared/sport-ai-contract";
import { equipmentLabels, exercises, sessionLabels, type Equipment } from "../catalog";
import type { Session, SessionTemplateExercise } from "../model";
import { useSportCloud } from "../cloud/provider";
import { requestSportAssistant } from "../cloud/ai-client";
import { buildAssistantContext } from "./context";
import { draftToTemplate } from "./draft";
import { CoachAvatar } from "./coach-avatar";
import { buildPrepareRequest } from "./prepare-request";
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
const initialRequests: Partial<Record<AssistantMode, string>> = {
  review: "Fais le point sur cette séance et mon historique.",
  progress: "Fais le point sur ma progression à partir de mon historique.",
};
const isInitialPreparePrompt = (message: Message) =>
  message.role === "user" &&
  message.content.startsWith("Prépare ma prochaine séance de musculation");

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
  const requestId = useRef(0);
  const autoSent = useRef(false);
  const composer = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [initialOrientation, setInitialOrientation] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
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
    const updateOnline = () => {
      const connected = navigator.onLine;
      setOnline(connected);
      if (!connected && pending.current) {
        pending.current.abort();
        pending.current = null;
        requestId.current += 1;
        setBusy(false);
      }
    };
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
  const template = draft ? draftToTemplate(draft) : null;
  const context = buildAssistantContext(history, mode === "review" ? focusSessionId : null);

  async function send(requestText?: string) {
    const isInitialPrepare = mode === "prepare" && messages.length === 0;
    const orientation = text.trim();
    const content = isInitialPrepare
      ? buildPrepareRequest(context, orientation)
      : (requestText ?? text).trim();
    if (!content || busy || pending.current || !accountReady || !online) return;
    if (draft && !draftSchema.safeParse(draft).success) {
      setError(
        "Vérifiez le brouillon : nom, nombre d’exercices, valeurs autorisées et nombre de tours identique dans chaque superset.",
      );
      return;
    }
    const controller = new AbortController();
    const currentRequest = ++requestId.current;
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
      if (controller.signal.aborted || currentRequest !== requestId.current) return;
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
      if (isInitialPrepare) setInitialOrientation(orientation);
      setText("");
    } catch (caught) {
      if (!controller.signal.aborted && currentRequest === requestId.current)
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
    requestId.current += 1;
    pending.current?.abort();
    pending.current = null;
    setBusy(false);
    setStatus("Demande annulée. Votre texte est conservé.");
  }
  const sendInitial = useEffectEvent(() => {
    if (!autoSent.current) {
      autoSent.current = true;
      void send(initialRequests[mode]);
    }
  });
  useEffect(() => {
    if (!accountReady || mode === "import" || mode === "prepare" || autoSent.current) return;
    const timer = window.setTimeout(() => sendInitial(), 0);
    return () => window.clearTimeout(timer);
  }, [accountReady, mode]);
  useEffect(() => {
    if (mode === "import" && accountReady) composer.current?.focus();
  }, [accountReady, mode]);
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
        {mode === "import" && <p className={styles.intro}>Collez votre programme.</p>}
        {mode === "prepare" && messages.length === 0 && (
          <div className={styles.coachIntro}>
            <CoachAvatar small />
            <div className={styles.coachBubbles}>
              <p className={styles.coachBubble}>
                Salut, moi c’est Milo, ton coach IA. Je prépare ta prochaine séance à partir de ton
                historique et de tes dernières séances.
              </p>
              <p className={styles.coachBubble}>
                Une envie précise ou une contrainte aujourd’hui ? Tu peux me la préciser ci-dessous,
                ou me laisser faire.
              </p>
            </div>
          </div>
        )}
        {!accountReady ? (
          <div className={styles.card}>
            <p>Connectez votre compte Sport pour utiliser l’assistant.</p>
            <Link href="/sport/compte" onClick={onClose}>
              Ouvrir mon compte
            </Link>
          </div>
        ) : (
          <>
            {messages.length > 0 && (
              <div
                className={styles.conversation}
                role="log"
                aria-live="polite"
                aria-label="Conversation"
              >
                {messages
                  .filter(
                    (message, index) =>
                      !(
                        index === 0 &&
                        mode !== "import" &&
                        message.role === "user" &&
                        (mode !== "prepare" ||
                          (isInitialPreparePrompt(message) && !initialOrientation))
                      ),
                  )
                  .map((message, index) => (
                    <article
                      className={`${styles.message} ${message.role === "user" ? styles.user : ""}`}
                      key={index}
                    >
                      <strong>{message.role === "user" ? "Vous" : "Milo"}</strong>
                      <p>
                        {mode === "prepare" && isInitialPreparePrompt(message)
                          ? initialOrientation
                          : message.content}
                      </p>
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
            )}
            {busy && (
              <div className={styles.actions}>
                <p role="status">Milo réfléchit…</p>
                {mode !== "prepare" && messages.length === 0 && !draft && (
                  <button type="button" onClick={cancel}>
                    Annuler
                  </button>
                )}
              </div>
            )}
            {!online && <p role="status">Hors ligne.</p>}
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            {mode !== "import" &&
              mode !== "prepare" &&
              !busy &&
              messages.length === 0 &&
              !draft && (
                <button
                  className={styles.primary}
                  type="button"
                  disabled={!online}
                  onClick={() => void send(initialRequests[mode])}
                >
                  Réessayer
                </button>
              )}
            {draft && (
              <section className={styles.draft} aria-labelledby="sport-assistant-draft-title">
                <h3 id="sport-assistant-draft-title">Brouillon de séance</h3>
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
                      {draft.questions.map((question, index) => (
                        <p key={index}>{question}</p>
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
                    Complétez les champs nécessaires pour démarrer ou enregistrer.
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
            {(mode === "import" || mode === "prepare" || messages.length > 0 || draft) && (
              <form
                className={styles.composer}
                onSubmit={(event) => {
                  event.preventDefault();
                  void send();
                }}
              >
                <div
                  className={
                    mode === "prepare" && messages.length === 0
                      ? styles.guidanceCard
                      : styles.composerFields
                  }
                >
                  <label htmlFor="sport-assistant-message">
                    {messages.length
                      ? "Votre réponse ou vos ajustements"
                      : mode === "import"
                        ? "Votre programme"
                        : mode === "prepare"
                          ? "Ta réponse (facultatif)"
                          : "Votre demande"}
                  </label>
                  <textarea
                    ref={composer}
                    id="sport-assistant-message"
                    rows={mode === "prepare" && messages.length === 0 ? 3 : 4}
                    maxLength={mode === "prepare" && messages.length === 0 ? 3500 : 4000}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    disabled={busy}
                    placeholder={
                      mode === "prepare" && messages.length === 0
                        ? "Ex. : 45 minutes, sans machine, priorité aux jambes…"
                        : mode === "import"
                          ? "Exemple : développé couché, 3 × 8, barre de 40 kg au total, repos 120 s…"
                          : mode === "review"
                            ? "Exemple : comment cette séance se compare-t-elle aux précédentes ?"
                            : mode === "progress"
                              ? "Exemple : quel exercice mérite plus d’attention ?"
                              : "Exemple : une séance haut du corps de 45 minutes avec des haltères…"
                    }
                  />
                </div>
                <div className={styles.actions}>
                  {busy ? (
                    <>
                      <button type="button" onClick={cancel}>
                        Annuler la demande
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.primary}
                      disabled={
                        (!(mode === "prepare" && messages.length === 0) && !text.trim()) ||
                        !online ||
                        !accountReady
                      }
                      type="submit"
                    >
                      {mode === "prepare" && messages.length === 0
                        ? "Créer ma séance personnalisée"
                        : "Envoyer à l’assistant"}
                    </button>
                  )}
                </div>
              </form>
            )}
          </>
        )}
        {status && <p role="status">{status}</p>}
      </div>
    </dialog>
  );
}
