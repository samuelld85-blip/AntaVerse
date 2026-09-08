"use client";
import Link from "next/link";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { getCloud, friendlyError } from "./client";
import { useSportCloud } from "./provider";
import { enableSportPush, disableSportPush } from "./push";
import { storeSchema, type Session } from "../model";
import { getGlobalProgression } from "../progression";
import { ProgressionBadge } from "../progression-badge";
import { StatsDashboard } from "../stats-dashboard";
import styles from "./cloud.module.css";
import sportStyles from "../sport.module.css";

type Person = { id: string; username: string };
type Friendship = { requester: string; recipient: string; accepted_at: string | null };
type Comment = {
  id: number;
  session_id: string;
  actor: string;
  body: string;
  created_at: string;
};
type FriendView = "history" | "profile";

export function SessionReactions({
  ownerId,
  ownerName,
  sessionId,
}: {
  ownerId: string;
  ownerName: string;
  sessionId: string;
}) {
  const { session, profile } = useSportCloud();
  const client = getCloud();
  const [likes, setLikes] = useState<string[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const id = session?.user.id;

  useEffect(() => {
    if (!client || !id || !profile) {
      return;
    }
    let live = true;
    void (async () => {
      setLoading(true);
      try {
        const [likeRes, commentRes] = await Promise.all([
          client
            .from("session_likes")
            .select("actor")
            .eq("owner", ownerId)
            .eq("session_id", sessionId),
          client
            .from("session_comments")
            .select("id,session_id,actor,body,created_at")
            .eq("owner", ownerId)
            .eq("session_id", sessionId)
            .order("created_at"),
        ]);
        if (likeRes.error) throw likeRes.error;
        if (commentRes.error) throw commentRes.error;
        const likeActors = ((likeRes.data ?? []) as { actor: string }[]).map((row) => row.actor);
        const thread = (commentRes.data ?? []) as Comment[];
        const actors = [...new Set([...likeActors, ...thread.map((comment) => comment.actor)])].filter(
          (actor) => actor !== id && actor !== ownerId,
        );
        let extraNames: Record<string, string> = {};
        if (actors.length) {
          const { data: profiles } = await client.from("profiles").select("id,username").in("id", actors);
          extraNames = Object.fromEntries((profiles ?? []).map((person) => [person.id, person.username]));
        }
        if (live) {
          setLikes(likeActors);
          setComments(thread);
          setNames(extraNames);
          setMessage("");
        }
      } catch (error) {
        if (live) setMessage(friendlyError(error));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [client, id, ownerId, profile, sessionId]);

  if (!id || !profile || !client) return null;
  const cloudClient = client;
  const currentId = id;
  const nameOf = (actor: string) =>
    actor === id ? profile.username : actor === ownerId ? ownerName : names[actor] ?? "joueur";
  const liked = likes.includes(id);

  async function toggleLike() {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (liked) {
        const { error } = await cloudClient
          .from("session_likes")
          .delete()
          .eq("owner", ownerId)
          .eq("session_id", sessionId)
          .eq("actor", currentId);
        if (error) throw error;
        setLikes((items) => items.filter((actor) => actor !== id));
      } else {
        const { error } = await cloudClient
          .from("session_likes")
          .insert({ owner: ownerId, session_id: sessionId, actor: currentId });
        if (error) throw error;
        setLikes((items) => [...items, currentId]);
      }
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  async function postComment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const { data, error } = await cloudClient
        .from("session_comments")
        .insert({ owner: ownerId, session_id: sessionId, actor: currentId, body })
        .select("id,session_id,actor,body,created_at")
        .single();
      if (error) throw error;
      setComments((items) => [...items, data as Comment]);
      setDraft("");
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  async function deleteComment(commentId: number) {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const { error } = await cloudClient.from("session_comments").delete().eq("id", commentId);
      if (error) throw error;
      setComments((items) => items.filter((comment) => comment.id !== commentId));
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.feedback} aria-label="Réactions à la séance">
      {loading ? (
        <p role="status">Chargement des réactions…</p>
      ) : (
        <>
          <div className={styles.actions}>
            <button type="button" aria-pressed={liked} disabled={busy} onClick={() => void toggleLike()}>
              {liked ? "❤️ Aimé" : "🤍 J’aime"}
              {likes.length ? ` · ${likes.length}` : ""}
            </button>
          </div>
          {likes.length > 0 && (
            <p className={styles.muted}>Aimé par {likes.map(nameOf).map((name) => `@${name}`).join(", ")}</p>
          )}
          {comments.length > 0 && (
            <ul className={styles.commentList}>
              {comments.map((comment) => (
                <li key={comment.id}>
                  <span className={styles.commentBody}>
                    <strong>@{nameOf(comment.actor)}</strong> {comment.body}
                  </span>
                  {comment.actor === id && (
                    <button
                      className={styles.quiet}
                      type="button"
                      disabled={busy}
                      onClick={() => void deleteComment(comment.id)}
                    >
                      Supprimer
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <form className={styles.commentForm} onSubmit={(event) => void postComment(event)}>
            <input
              aria-label="Commenter cette séance"
              maxLength={500}
              placeholder="Écrire un commentaire…"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button disabled={busy || !draft.trim()} type="submit">
              Publier
            </button>
          </form>
        </>
      )}
      {message && <p className={styles.notice} role="alert">{message}</p>}
    </div>
  );
}

export function SportSocial({ onOpenHistory }: { onOpenHistory: (sessionId: string) => void }) {
  const { session, profile } = useSportCloud();
  const [people, setPeople] = useState<Person[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Person | null>(null);
  const [viewMode, setViewMode] = useState<FriendView>("history");
  const [history, setHistory] = useState<Session[]>([]);
  const [profileHistory, setProfileHistory] = useState<Session[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [historyMore, setHistoryMore] = useState(false);
  const [likes, setLikes] = useState<Record<string, string[]>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [feedbackBusy, setFeedbackBusy] = useState<string | null>(null);
  const [push, setPush] = useState(false);
  const id = session?.user.id;
  const client = getCloud();
  const refresh = useCallback(async () => {
    if (!client || !id || !profile) return;
    const { data, error } = await client
      .from("friendships")
      .select("requester,recipient,accepted_at")
      .or(`requester.eq.${id},recipient.eq.${id}`);
    if (error) throw error;
    const relations = (data ?? []) as Friendship[];
    const ids = [
      ...new Set(relations.map((f) => (f.requester === id ? f.recipient : f.requester))),
    ];
    if (ids.length) {
      const { data: profiles, error: namesError } = await client
        .from("profiles")
        .select("id,username")
        .in("id", ids);
      if (namesError) throw namesError;
      setNames(Object.fromEntries((profiles ?? []).map((p) => [p.id, p.username])));
    }
    setFriends(relations);
  }, [client, id, profile]);
  useEffect(() => {
    if (!client || !id || !profile) return;
    let live = true;
    void Promise.resolve()
      .then(refresh)
      .catch((error) => {
        if (live) setMessage(friendlyError(error));
      });
    const timer = setInterval(() => void refresh().catch(() => {}), 30000);
    if ("serviceWorker" in navigator)
      void navigator.serviceWorker
        .getRegistration()
        .then((r) => r?.pushManager?.getSubscription())
        .then(async (s) => {
          if (!s) return;
          const { data } = await client
            .from("push_subscriptions")
            .select("endpoint")
            .eq("user_id", id)
            .eq("endpoint", s.endpoint)
            .maybeSingle();
          if (live) setPush(Boolean(data));
        })
        .catch(() => {});
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [client, id, profile, refresh]);
  useEffect(() => {
    if (!client || !id || !profile) return;
    let live = true;
    void (async () => {
      setLoading(true);
      try {
        const { data, error } = await client
          .from("profiles")
          .select("id,username")
          .neq("id", id)
          // Hide the reserved test accounts (any pseudo containing "test", any case).
          .not("username", "ilike", "%test%")
          .order("username")
          .limit(200);
        if (error) throw error;
        if (live) setPeople((data ?? []).filter((p) => !/test/i.test(p.username)));
      } catch (error) {
        if (live) setMessage(friendlyError(error));
      } finally {
        if (live) setLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [client, id, profile]);
  useEffect(() => {
    if (!client || !viewing || viewMode !== "history") return;
    let live = true;
    const timer = setTimeout(async () => {
      setHistoryLoading(true);
      try {
        const { data, error } = await client
          .from("sport_sessions")
          .select("payload")
          .eq("user_id", viewing.id)
          .order("ended_at", { ascending: false })
          .range(historyPage * 20, historyPage * 20 + 19);
        if (error) throw error;
        const parsed = storeSchema.shape.history.parse((data ?? []).map((r) => r.payload));
        if (live) {
          setHistory(parsed);
          setHistoryMore(parsed.length === 20);
        }
        const sessionIds = parsed.map((s) => s.id);
        try {
          if (!sessionIds.length) throw null;
          const [likeRes, commentRes] = await Promise.all([
            client
              .from("session_likes")
              .select("session_id,actor")
              .eq("owner", viewing.id)
              .in("session_id", sessionIds),
            client
              .from("session_comments")
              .select("id,session_id,actor,body,created_at")
              .eq("owner", viewing.id)
              .in("session_id", sessionIds)
              .order("created_at"),
          ]);
          const likeRows = (likeRes.data ?? []) as { session_id: string; actor: string }[];
          const commentRows = (commentRes.data ?? []) as Comment[];
          const likeMap: Record<string, string[]> = {};
          for (const row of likeRows) (likeMap[row.session_id] ??= []).push(row.actor);
          const commentMap: Record<string, Comment[]> = {};
          for (const row of commentRows) (commentMap[row.session_id] ??= []).push(row);
          const unknown = [
            ...new Set([...likeRows, ...commentRows].map((r) => r.actor)),
          ].filter((a) => a !== id && a !== viewing.id);
          if (unknown.length) {
            const { data: extra } = await client
              .from("profiles")
              .select("id,username")
              .in("id", unknown);
            if (extra?.length && live)
              setNames((n) => ({
                ...n,
                ...Object.fromEntries(extra.map((p) => [p.id, p.username])),
              }));
          }
          if (live) {
            setLikes(likeMap);
            setComments(commentMap);
          }
        } catch {
          /* Feedback is non-critical: keep the sessions list even if it fails. */
        }
      } catch (error) {
        if (live) {
          setHistory([]);
          setMessage(friendlyError(error));
        }
      } finally {
        if (live) setHistoryLoading(false);
      }
    }, 0);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [client, viewing, historyPage, id, viewMode]);
  useEffect(() => {
    if (!client || !viewing || viewMode !== "profile") return;
    let live = true;
    void (async () => {
      try {
        const { data, error } = await client
          .from("sport_sessions")
          .select("payload")
          .eq("user_id", viewing.id)
          .order("ended_at", { ascending: false });
        if (error) throw error;
        const parsed = storeSchema.shape.history.parse((data ?? []).map((row) => row.payload));
        if (live) setProfileHistory(parsed);
      } catch (error) {
        if (live) {
          setProfileHistory([]);
          setMessage(friendlyError(error));
        }
      } finally {
        if (live) setProfileLoading(false);
      }
    })();
    return () => {
      live = false;
    };
  }, [client, viewing, viewMode]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
      await refresh();
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }
  if (!id || !profile)
    return (
      <section className={styles.panel} aria-label="Social">
        <p>Retrouvez vos amis, consultez leurs séances et encouragez-les après un entraînement.</p>
        <Link className={styles.linkButton} href="/sport/compte" style={{ marginTop: 8 }}>
          {session ? "Choisir mon pseudo" : "Me connecter pour retrouver mes amis"}
        </Link>
      </section>
    );
  function personId(f: Friendship) {
    return f.requester === id ? f.recipient : f.requester;
  }
  function openHistory(person: Person) {
    setHistory([]);
    setLikes({});
    setComments({});
    setDrafts({});
    setHistoryLoading(true);
    setHistoryPage(0);
    setViewMode("history");
    setViewing(person);
  }
  function openProfile(person: Person) {
    setProfileHistory([]);
    setProfileLoading(true);
    setViewMode("profile");
    setViewing(person);
  }
  function nameOf(actor: string) {
    if (actor === id) return profile!.username;
    if (viewing && actor === viewing.id) return viewing.username;
    return names[actor] ?? "joueur";
  }
  const acceptedFriendIds = new Set(
    friends.filter((friendship) => friendship.accepted_at).map(personId),
  );
  const peopleToAdd = people.filter((person) => !acceptedFriendIds.has(person.id));
  const latestPhotoSession = profileHistory.find(
    (item) => (item.feedback?.photos?.length ?? 0) > 0,
  );
  const latestPhoto = latestPhotoSession?.feedback?.photos?.[0];
  async function togglePush() {
    setBusy(true);
    setMessage("");
    try {
      if (push) await disableSportPush();
      else await enableSportPush(id!);
      setPush(!push);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : friendlyError(error));
    } finally {
      setBusy(false);
    }
  }
  function pushControl(showHint: boolean) {
    return (
      <div className={styles.socialGroup}>
        <button disabled={busy} onClick={() => void togglePush()} type="button">
          {push
            ? "Désactiver les notifications sur cet appareil"
            : "Activer les notifications de mes amis"}
        </button>
        {showHint ? (
          <p className={styles.muted}>
            Un push quand un ami termine une séance. Sur iPhone, ajoutez le site à l’écran d’accueil
            puis ouvrez Sport depuis son icône ; sur Android, utilisez un navigateur compatible
            comme Chrome.
          </p>
        ) : (
          <p className={styles.muted}>Notifications activées sur cet appareil.</p>
        )}
      </div>
    );
  }
  async function toggleLike(sessionId: string) {
    if (!client || !viewing || feedbackBusy) return;
    const mine = (likes[sessionId] ?? []).includes(id!);
    setFeedbackBusy(sessionId);
    setMessage("");
    try {
      if (mine) {
        const { error } = await client
          .from("session_likes")
          .delete()
          .eq("owner", viewing.id)
          .eq("session_id", sessionId)
          .eq("actor", id!);
        if (error) throw error;
        setLikes((l) => ({ ...l, [sessionId]: (l[sessionId] ?? []).filter((a) => a !== id) }));
      } else {
        const { error } = await client
          .from("session_likes")
          .insert({ owner: viewing.id, session_id: sessionId, actor: id! });
        if (error) throw error;
        setLikes((l) => ({ ...l, [sessionId]: [...(l[sessionId] ?? []), id!] }));
      }
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setFeedbackBusy(null);
    }
  }
  async function postComment(sessionId: string) {
    const body = (drafts[sessionId] ?? "").trim();
    if (!client || !viewing || !body || feedbackBusy) return;
    setFeedbackBusy(sessionId);
    setMessage("");
    try {
      const { data, error } = await client
        .from("session_comments")
        .insert({ owner: viewing.id, session_id: sessionId, actor: id!, body })
        .select("id,session_id,actor,body,created_at")
        .single();
      if (error) throw error;
      setComments((c) => ({ ...c, [sessionId]: [...(c[sessionId] ?? []), data as Comment] }));
      setDrafts((d) => ({ ...d, [sessionId]: "" }));
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setFeedbackBusy(null);
    }
  }
  async function deleteComment(sessionId: string, commentId: number) {
    if (!client || feedbackBusy) return;
    setFeedbackBusy(sessionId);
    setMessage("");
    try {
      const { error } = await client.from("session_comments").delete().eq("id", commentId);
      if (error) throw error;
      setComments((c) => ({
        ...c,
        [sessionId]: (c[sessionId] ?? []).filter((x) => x.id !== commentId),
      }));
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setFeedbackBusy(null);
    }
  }
  return (
    <section className={`${styles.panel} ${styles.social}`} aria-label="Social">
      {message && (
        <p className={styles.notice} role="status">
          {message}
        </p>
      )}
      {!viewing && (
        <>
          <p className={styles.muted}>
            Seuls vos amis acceptés voient vos séances terminées. Votre séance en cours et vos favoris
            restent privés.
          </p>
          {!push && pushControl(true)}
        </>
      )}
      {viewing ? (
        <div className={styles.friendSessions}>
          <button className={styles.backButton} onClick={() => setViewing(null)} type="button">
            ← Mes amis
          </button>
          {viewMode === "profile" ? (
            profileLoading ? (
              <p role="status">Chargement du profil…</p>
            ) : (
              <div className={styles.friendProfile}>
                <div className={styles.friendProfileHeading}>
                  <div>
                    <p className={sportStyles.eyebrow}>Profil Sport</p>
                    <h2>@{viewing.username}</h2>
                  </div>
                  <ProgressionBadge kind="status" status={getGlobalProgression(profileHistory).status} />
                </div>
                {latestPhoto && latestPhotoSession && (
                  <figure className={styles.friendProfilePhoto}>
                    <img src={latestPhoto} alt={`Dernière photo de @${viewing.username}`} />
                    <figcaption>
                      Dernière photo publiée ·{" "}
                      {new Date(latestPhotoSession.startedAt).toLocaleDateString("fr-FR")}
                    </figcaption>
                  </figure>
                )}
                <StatsDashboard history={profileHistory} username={viewing.username} compact />
                <button className={sportStyles.secondary} onClick={() => setViewMode("history")} type="button">
                  Voir ses séances
                </button>
              </div>
            )
          ) : (
            <>
              <h2>Séances de @{viewing.username}</h2>
              {historyLoading ? (
                <p role="status">Chargement des séances…</p>
              ) : history.length === 0 ? (
                <p>Aucune séance partagée disponible.</p>
              ) : (
                <ul className={styles.historyCarousel}>
                  {history.map((s) => (
                    <li key={s.id}>
                      <div className={styles.sessionSummary}>
                        <strong>{s.name || "Séance"}</strong>
                        <span>
                          {new Date(s.startedAt).toLocaleDateString("fr-FR")} ·{" "}
                          {s.exercises.reduce((n, e) => n + e.completedSets.length, 0)} séries
                        </span>
                        <button type="button" onClick={() => onOpenHistory(s.id)}>
                          Ouvrir dans l’historique
                        </button>
                      </div>
                      {(() => {
                        const sessionLikes = likes[s.id] ?? [];
                        const liked = sessionLikes.includes(id!);
                        const thread = comments[s.id] ?? [];
                        return (
                          <div className={styles.feedback}>
                            <div className={styles.actions}>
                              <button
                                aria-pressed={liked}
                                disabled={feedbackBusy === s.id}
                                onClick={() => void toggleLike(s.id)}
                              >
                                {liked ? "❤️ Aimé" : "🤍 J’aime"}
                                {sessionLikes.length ? ` · ${sessionLikes.length}` : ""}
                              </button>
                            </div>
                            {sessionLikes.length > 0 && (
                              <p className={styles.muted}>
                            Aimé par {sessionLikes.map(nameOf).map((n) => `@${n}`).join(", ")}
                              </p>
                            )}
                            {thread.length > 0 && (
                              <ul className={styles.commentList}>
                                {thread.map((c) => (
                                  <li key={c.id}>
                                    <span className={styles.commentBody}>
                                      <strong>@{nameOf(c.actor)}</strong> {c.body}
                                    </span>
                                    {c.actor === id && (
                                      <button
                                        className={styles.quiet}
                                        disabled={feedbackBusy === s.id}
                                        onClick={() => void deleteComment(s.id, c.id)}
                                      >
                                        Supprimer
                                      </button>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <form
                              className={styles.commentForm}
                              onSubmit={(e) => {
                                e.preventDefault();
                                void postComment(s.id);
                              }}
                            >
                              <input
                                aria-label={`Commenter la séance ${s.name || ""}`.trim()}
                                maxLength={500}
                                placeholder="Écrire un commentaire…"
                                value={drafts[s.id] ?? ""}
                                onChange={(e) =>
                                  setDrafts((d) => ({ ...d, [s.id]: e.target.value }))
                                }
                              />
                              <button
                                disabled={feedbackBusy === s.id || !(drafts[s.id] ?? "").trim()}
                                type="submit"
                              >
                                Publier
                              </button>
                            </form>
                          </div>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
              )}
              {history.length > 0 && (
                <div className={styles.sessionPagination}>
                  <button
                    disabled={historyPage === 0 || historyLoading}
                    onClick={() => setHistoryPage((p) => p - 1)}
                  >
                    Séances précédentes
                  </button>
                  <button
                    disabled={!historyMore || historyLoading}
                    onClick={() => setHistoryPage((p) => p + 1)}
                  >
                    Séances suivantes
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <>
          <h2>Mes amis</h2>
          {!friends.length && (
            <p className={styles.muted}>
              Votre liste d’amis est vide. Ajoutez quelqu’un depuis la liste ci-dessous.
            </p>
          )}
          <ul className={`${styles.list} ${styles.friendList}`}>
            {friends.map((f) => {
              const other = personId(f);
              const username = names[other] ?? "joueur";
              return (
                <li className={f.accepted_at ? styles.friendItem : undefined} key={other}>
                  <div className={styles.friendHeader}>
                    <strong>@{username}</strong>
                    {f.accepted_at && (
                      <button
                        aria-label={`Retirer @${username}`}
                        className={styles.iconButton}
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            const { error } = await client!
                              .from("friendships")
                              .delete()
                              .eq("requester", f.requester)
                              .eq("recipient", f.recipient);
                            if (error) throw error;
                          })
                        }
                        title={`Retirer @${username}`}
                        type="button"
                      >
                        <span aria-hidden="true">−</span>
                      </button>
                    )}
                  </div>
                  {!f.accepted_at && (
                    <p>
                      {f.recipient === id ? "Vous a envoyé une demande" : "Demande envoyée"}
                    </p>
                  )}
                  <div className={f.accepted_at ? styles.friendActions : styles.actions}>
                    {f.accepted_at && (
                      <div className={styles.friendActionsRow}>
                        <button
                          className={styles.friendPrimaryAction}
                          onClick={() => openProfile({ id: other, username })}
                          type="button"
                        >
                          Voir le profil
                        </button>
                        <button
                          className={styles.friendSecondaryAction}
                          onClick={() => openHistory({ id: other, username })}
                          type="button"
                        >
                          Voir ses séances
                        </button>
                      </div>
                    )}
                    {!f.accepted_at && f.recipient === id && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            const { error } = await client!.rpc("accept_friend", {
                              friend_id: other,
                            });
                            if (error) throw error;
                          })
                        }
                      >
                        Accepter
                      </button>
                    )}
                    {!f.accepted_at && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void run(async () => {
                            const { error } = await client!
                              .from("friendships")
                              .delete()
                              .eq("requester", f.requester)
                              .eq("recipient", f.recipient);
                            if (error) throw error;
                          })
                        }
                      >
                        {f.recipient === id ? "Refuser" : "Annuler la demande"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
      {!viewing && (
        <>
          <h2>Ajouter un ami</h2>
          {loading ? (
            <p role="status">Chargement des comptes…</p>
          ) : !peopleToAdd.length ? (
            <p className={styles.muted}>Aucun compte à ajouter pour le moment.</p>
          ) : (
            <ul className={styles.list}>
              {peopleToAdd.map((p) => {
                const relation = friends.find((f) => personId(f) === p.id);
                return (
                  <li key={p.id}>
                    <strong>@{p.username}</strong>
                    <div className={styles.actions}>
                      <button
                        disabled={busy || Boolean(relation)}
                        onClick={() =>
                          void run(async () => {
                            const { error } = await client!
                              .from("friendships")
                              .insert({ requester: id, recipient: p.id });
                            if (error) throw error;
                            setMessage(`Demande envoyée à @${p.username}.`);
                          })
                        }
                      >
                        {relation
                          ? relation.accepted_at
                            ? "Déjà amis"
                            : "Demande en cours"
                          : "Ajouter"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <hr className={styles.socialRule} />
          {push && pushControl(false)}
          <Link className={styles.linkButton} href="/sport/compte">
            Mon compte
          </Link>
          <p className={styles.muted}>Changez votre pseudo ou déconnectez-vous depuis votre compte.</p>
        </>
      )}
    </section>
  );
}
