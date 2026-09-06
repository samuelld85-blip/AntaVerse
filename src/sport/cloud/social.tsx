"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getCloud, friendlyError } from "./client";
import { useSportCloud } from "./provider";
import { enableSportPush, disableSportPush } from "./push";
import { storeSchema, type Session } from "../model";
import { exercises } from "../catalog";
import styles from "./cloud.module.css";

type Person = { id: string; username: string };
type Friendship = { requester: string; recipient: string; accepted_at: string | null };
type Comment = {
  id: number;
  session_id: string;
  actor: string;
  body: string;
  created_at: string;
};
export function SportSocial() {
  const { session, profile } = useSportCloud();
  const [people, setPeople] = useState<Person[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Person | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
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
    if (!client || !viewing) return;
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
  }, [client, viewing, historyPage, id]);
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
    setViewing(person);
  }
  function nameOf(actor: string) {
    if (actor === id) return profile!.username;
    if (viewing && actor === viewing.id) return viewing.username;
    return names[actor] ?? "joueur";
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
      <p className={styles.muted}>
        Seuls vos amis acceptés voient vos séances terminées. Votre séance en cours et vos favoris
        restent privés.
      </p>
      <div className={styles.socialGroup}>
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMessage("");
            try {
              if (push) await disableSportPush();
              else await enableSportPush(id);
              setPush(!push);
            } catch (error) {
              setMessage(error instanceof Error ? error.message : friendlyError(error));
            } finally {
              setBusy(false);
            }
          }}
        >
          {push
            ? "Désactiver les notifications sur cet appareil"
            : "Activer les notifications de mes amis"}
        </button>
        <p className={styles.muted}>
          Un push quand un ami termine une séance. Sur iPhone, installez l’app depuis l’écran
          d’accueil.
        </p>
      </div>
      {viewing ? (
        <div className={styles.card}>
          <button onClick={() => setViewing(null)}>← Mes amis</button>
          <h2>Séances de @{viewing.username}</h2>
          {historyLoading ? (
            <p role="status">Chargement des séances…</p>
          ) : history.length === 0 ? (
            <p>Aucune séance partagée disponible.</p>
          ) : (
            <ul className={styles.list}>
              {history.map((s) => (
                <li key={s.id}>
                  <details>
                    <summary>
                      {s.name || "Séance"} · {new Date(s.startedAt).toLocaleDateString("fr-FR")} ·{" "}
                      {s.exercises.reduce((n, e) => n + e.completedSets.length, 0)} séries
                    </summary>
                    {s.exercises.map((e) => (
                      <div key={e.id}>
                        <strong>
                          {exercises.find((x) => x.id === e.config.exerciseId)?.name ??
                            e.config.exerciseId}
                        </strong>
                        <ul>
                          {e.completedSets.map((set, i) => (
                            <li key={i}>
                              {set.loadKg} kg{set.reps !== null ? ` × ${set.reps} répétitions` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </details>
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
                                <strong>@{nameOf(c.actor)}</strong> {c.body}
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
          <div className={styles.actions}>
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
        </div>
      ) : (
        <>
          <h2>Mes amis</h2>
          {!friends.length && (
            <p className={styles.muted}>
              Votre liste d’amis est vide. Ajoutez quelqu’un depuis la liste ci-dessous.
            </p>
          )}
          <ul className={styles.list}>
            {friends.map((f) => {
              const other = personId(f);
              return (
                <li key={other}>
                  <strong>@{names[other] ?? "joueur"}</strong>
                  <p>
                    {f.accepted_at
                      ? "Ami"
                      : f.recipient === id
                        ? "Vous a envoyé une demande"
                        : "Demande envoyée"}
                  </p>
                  <div className={styles.actions}>
                    {f.accepted_at && (
                      <button
                        onClick={() =>
                          openHistory({ id: other, username: names[other] ?? "joueur" })
                        }
                      >
                        Voir ses séances
                      </button>
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
                      {f.accepted_at
                        ? "Retirer cet ami"
                        : f.recipient === id
                          ? "Refuser"
                          : "Annuler la demande"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
      <h2>Ajouter un ami</h2>
      {loading ? (
        <p role="status">Chargement des comptes…</p>
      ) : !people.length ? (
        <p className={styles.muted}>Aucun autre compte pour le moment.</p>
      ) : (
        <ul className={styles.list}>
          {people.map((p) => {
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
      <Link className={styles.linkButton} href="/sport/compte">
        Mon compte
      </Link>
      <p className={styles.muted}>Changez votre pseudo ou déconnectez-vous depuis votre compte.</p>
    </section>
  );
}
