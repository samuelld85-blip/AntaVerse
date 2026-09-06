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
export function SportSocial() {
  const { session, profile } = useSportCloud();
  const [people, setPeople] = useState<Person[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<Person | null>(null);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyMore, setHistoryMore] = useState(false);
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
    const timer = setTimeout(async () => {
      setLoading(true);
      let query = client
        .from("profiles")
        .select("id,username")
        .neq("id", id)
        .order("username")
        .range(page * 20, page * 20 + 19);
      const term = search.replace(/[^A-Za-z0-9_]/g, "").replace(/_/g, "\\_");
      if (term) query = query.ilike("username", `%${term}%`);
      try {
        const { data, error } = await query;
        if (error) throw error;
        if (live) setPeople(data ?? []);
      } catch (error) {
        if (live) setMessage(friendlyError(error));
      } finally {
        if (live) setLoading(false);
      }
    }, 250);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [client, id, profile, search, page]);
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
  }, [client, viewing, historyPage]);
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
      <section className={styles.panel}>
        <h2>Social</h2>
        <p>Retrouvez vos amis, consultez leurs séances et encouragez-les après un entraînement.</p>
        <Link className={styles.linkButton} href="/sport/compte">
          {session ? "Choisir mon pseudo" : "Me connecter pour retrouver mes amis"}
        </Link>
      </section>
    );
  function personId(f: Friendship) {
    return f.requester === id ? f.recipient : f.requester;
  }
  function openHistory(person: Person) {
    setHistory([]);
    setHistoryLoading(true);
    setHistoryPage(0);
    setViewing(person);
  }
  return (
    <section className={styles.panel} aria-labelledby="social-title">
      <h2 id="social-title">Social</h2>
      <p className={styles.muted}>
        Seuls vos amis acceptés peuvent consulter vos séances terminées. Votre séance en cours et
        vos favoris restent privés.
      </p>
      {message && (
        <p className={styles.notice} role="status">
          {message}
        </p>
      )}
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
        Un push lorsqu’un ami termine une séance. Sur iPhone, ouvrez l’application depuis l’écran
        d’accueil.
      </p>
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
          {!friends.length && <p>Votre liste d’amis est vide. Retrouvez un pseudo ci-dessous.</p>}
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
      <label>
        Rechercher un pseudo
        <input
          type="search"
          autoComplete="off"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </label>
      {loading ? (
        <p role="status">Recherche des joueurs…</p>
      ) : (
        <>
          {!people.length && <p>Aucun joueur trouvé.</p>}
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
        </>
      )}
      <div className={styles.actions}>
        <button disabled={page === 0 || loading} onClick={() => setPage((p) => p - 1)}>
          Page précédente
        </button>
        <button disabled={people.length < 20 || loading} onClick={() => setPage((p) => p + 1)}>
          Page suivante
        </button>
      </div>
    </section>
  );
}
