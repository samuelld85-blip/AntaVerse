"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { cloudConfigured, friendlyError, getCloud } from "./client";
import {
  emptySnapshot,
  equalSnapshot,
  readSnapshot,
  snapshotSchema,
  syncDecision,
  writeSnapshot,
  type Snapshot,
} from "./snapshot";
import styles from "./cloud.module.css";
import { STORAGE_KEY } from "../model";

type Profile = { id: string; username: string };
type CloudContext = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  recovery: boolean;
  refreshProfile: () => Promise<void>;
  sync: () => Promise<void>;
  status: string;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearRecovery: () => void;
};
const Context = createContext<CloudContext | null>(null);
export function useSportCloud() {
  const value = useContext(Context);
  if (!value) throw new Error("SportCloudProvider missing");
  return value;
}
const OWNER = "antaverse:sport:owner";
const cacheKey = (id: string) => `antaverse:sport:account:${id}`;
const baseKey = (id: string) => `antaverse:sport:base:${id}`;
export function SportCloudProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(cloudConfigured);
  const [recovery, setRecovery] = useState(false);
  const [status, setStatus] = useState("Sauvegarde sur cet appareil uniquement");
  const [epoch, setEpoch] = useState(0);
  const [conflict, setConflict] = useState<{ remote: Snapshot; revision: number } | null>(null);
  const [exclusive, setExclusive] = useState(false);
  const [initializing, setInitializing] = useState(cloudConfigured);
  const [fatal, setFatal] = useState("");
  const syncRef = useRef<() => Promise<void>>(async () => {});
  const resolveRef = useRef<(remote: boolean) => Promise<void>>(async () => {});
  const sessionRef = useRef<Session | null>(null);
  const profileRequest = useRef(0);
  const profileRef = useRef<Profile | null>(null);
  const [resolving, setResolving] = useState(false);

  // Only one editable Sport tab. Another tab must not overwrite in-memory edits.
  useEffect(() => {
    if (!cloudConfigured) return;
    let cancelled = false;
    let release: (() => void) | undefined;
    if (!navigator.locks) {
      setTimeout(
        () =>
          setFatal(
            "Ce navigateur ne permet pas une synchronisation sûre. Utilisez une version récente de Safari, Chrome ou Firefox.",
          ),
        0,
      );
      return;
    }
    void navigator.locks.request("antaverse:sport-editor", async () => {
      if (cancelled) return;
      setExclusive(true);
      await new Promise<void>((resolve) => {
        release = resolve;
      });
    });
    return () => {
      cancelled = true;
      release?.();
    };
  }, []);

  useEffect(() => {
    const client = getCloud();
    if (!client) return;
    let live = true;

    // Ask the browser to keep our storage (the refresh token lives there).
    // Without this, Chrome/Firefox may evict it under storage pressure and
    // some engines drop script-writable storage after ~7 idle days.
    void navigator.storage?.persist?.().catch(() => {});

    // supabase-js only refreshes the token while the tab is active. When the
    // app returns to the foreground after a long idle period (or a reboot),
    // resume the refresh loop and revalidate the session immediately.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      client.auth.startAutoRefresh();
      void client.auth.getSession();
    };
    document.addEventListener("visibilitychange", onVisible);

    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (!live) return;
      sessionRef.current = next;
      setSession(next);
      setLoading(false);
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
    });
    void client.auth
      .getSession()
      .then(({ data, error }) => {
        if (!live) return;
        if (error) setStatus(friendlyError(error));
        sessionRef.current = data.session;
        setSession(data.session);
        setLoading(false);
      })
      .catch((error) => {
        if (live) {
          setStatus(friendlyError(error));
          setLoading(false);
        }
      });
    return () => {
      live = false;
      document.removeEventListener("visibilitychange", onVisible);
      data.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    const request = ++profileRequest.current;
    const client = getCloud();
    const id = sessionRef.current?.user.id;
    if (!client || !id) {
      profileRef.current = null;
      setProfile(null);
      return;
    }
    const { data, error } = await client
      .from("profiles")
      .select("id, username")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    if (sessionRef.current?.user.id === id && request === profileRequest.current) {
      profileRef.current = data;
      setProfile(data);
    }
  }, []);

  const id = session?.user.id;
  useEffect(() => {
    if (!cloudConfigured || loading || !exclusive) return;
    let live = true;
    let busy: Promise<void> | null = null;
    let base: Snapshot | null = null;
    let pendingConflict = false;
    let interval: ReturnType<typeof setInterval> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const client = getCloud()!;
    const valid = () => live && sessionRef.current?.user.id === id;
    const saveBase = (snapshot: Snapshot) => {
      localStorage.setItem(baseKey(id!), JSON.stringify(snapshot));
      base = snapshot;
    };
    const persist = async (snapshot: Snapshot, revision: number) => {
      if (!valid()) return;
      const { error } = await client.rpc("save_backup", { expected_revision: revision, snapshot });
      if (error) throw error;
      if (!valid()) return;
      saveBase(snapshot);
      setStatus(
        equalSnapshot(readSnapshot(), snapshot)
          ? `Sauvegardé en ligne à ${new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
          : "Modifications en attente de sauvegarde",
      );
    };
    const sync = async () => {
      if (!valid() || !id || pendingConflict) return;
      if (busy) return busy;
      busy = (async () => {
        try {
          const local = readSnapshot();
          localStorage.setItem(cacheKey(id), JSON.stringify(local));
          if (!navigator.onLine) {
            setStatus("Hors ligne · sauvegarde sur cet appareil, envoi au retour du réseau");
            return;
          }
          if (!profileRef.current) await refreshProfile();
          if (!profileRef.current) {
            setStatus("Choisissez votre pseudo dans Mon compte pour activer la sauvegarde");
            return;
          }
          const { data, error } = await client
            .from("backups")
            .select("payload, revision")
            .eq("user_id", id)
            .maybeSingle();
          if (error) throw error;
          if (!valid()) return;
          const remote = data ? snapshotSchema.parse(data.payload) : emptySnapshot();
          const revision = data?.revision ?? 0;
          // Read again after the request: edits made while fetching must participate.
          const latest = readSnapshot();
          const decision = syncDecision(latest, remote, base);
          if (decision === "conflict") {
            pendingConflict = true;
            setConflict({ remote, revision });
            setStatus("Deux versions du carnet sont disponibles");
          } else if (decision === "download") {
            writeSnapshot(remote);
            saveBase(remote);
            localStorage.setItem(cacheKey(id), JSON.stringify(remote));
            setEpoch((n) => n + 1);
            setStatus("Carnet récupéré depuis la sauvegarde en ligne");
          } else if (decision === "upload" || !data) {
            setStatus("Sauvegarde en ligne…");
            await persist(latest, revision);
          } else {
            saveBase(remote);
            setStatus("Sauvegardé en ligne");
          }
        } catch (error) {
          if (valid())
            setStatus(
              (error as { code?: string })?.code === "40001"
                ? "Une autre sauvegarde est arrivée. Nouvelle vérification en cours…"
                : friendlyError(error),
            );
        }
      })().finally(() => {
        busy = null;
      });
      return busy;
    };
    const changed = () => {
      if (!valid() || !id) return;
      try {
        localStorage.setItem(cacheKey(id), JSON.stringify(readSnapshot()));
      } catch {
        setStatus("Stockage local saturé. Exportez votre carnet avant de fermer.");
        return;
      }
      setStatus(
        navigator.onLine
          ? "Modifications en attente de sauvegarde"
          : "Hors ligne · sauvegarde locale",
      );
      clearTimeout(timer);
      timer = setTimeout(() => void sync(), 400);
    };
    async function initialize() {
      setInitializing(true);
      setConflict(null);
      setProfile(null);
      profileRef.current = null;
      try {
        const owner = localStorage.getItem(OWNER);
        const incoming = id ?? "guest";
        if (owner && owner !== incoming) {
          localStorage.setItem(cacheKey(owner), JSON.stringify(readSnapshot()));
          const cached = localStorage.getItem(cacheKey(incoming));
          if (cached || owner !== "guest" || !id) {
            writeSnapshot(cached ? snapshotSchema.parse(JSON.parse(cached)) : emptySnapshot());
            setEpoch((n) => n + 1);
          }
        }
        // Unowned legacy data stays on first login and is reconciled with the remote copy.
        localStorage.setItem(OWNER, incoming);
        if (!id) {
          setStatus("Sauvegarde sur cet appareil uniquement");
          return;
        }
        const rawBase = localStorage.getItem(baseKey(id));
        base = rawBase ? snapshotSchema.parse(JSON.parse(rawBase)) : null;
        await refreshProfile().catch((error) => {
          if (valid()) setStatus(friendlyError(error));
        });
        if (!valid()) return;
        await sync();
        interval = setInterval(() => void sync(), 15000);
        window.addEventListener("antaverse:save-changed", changed);
        window.addEventListener("online", changed);
        window.addEventListener("focus", changed);
        syncRef.current = sync;
        resolveRef.current = async (useRemote) => {
          const { data, error } = await client
            .from("backups")
            .select("payload, revision")
            .eq("user_id", id)
            .maybeSingle();
          if (error) throw error;
          if (!valid()) return;
          const remote = data ? snapshotSchema.parse(data.payload) : emptySnapshot();
          // A restoration is explicit and keeps the losing local copy for export.
          if (useRemote) {
            writeSnapshot(remote);
            saveBase(remote);
            setEpoch((n) => n + 1);
          } else await persist(readSnapshot(), data?.revision ?? 0);
          pendingConflict = false;
          setConflict(null);
          await sync();
        };
      } catch {
        if (live)
          setFatal(
            "Impossible d’ouvrir le stockage de ce compte. Les données locales sont conservées. Libérez de l’espace puis rechargez la page.",
          );
      } finally {
        if (live) setInitializing(false);
      }
    }
    void initialize();
    return () => {
      live = false;
      clearInterval(interval);
      clearTimeout(timer);
      window.removeEventListener("antaverse:save-changed", changed);
      window.removeEventListener("online", changed);
      window.removeEventListener("focus", changed);
      syncRef.current = async () => {};
    };
  }, [id, loading, exclusive, refreshProfile]);

  async function signOut() {
    const client = getCloud();
    if (!client) return;
    await syncRef.current();
    // Remove this device's push association before changing accounts.
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager?.getSubscription();
      if (subscription) {
        const { error } = await client
          .from("push_subscriptions")
          .delete()
          .eq("endpoint", subscription.endpoint);
        if (error) throw error;
        await subscription.unsubscribe();
      }
    }
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw error;
    setRecovery(false);
  }
  async function deleteAccount() {
    const client = getCloud();
    const current = sessionRef.current;
    if (!client || !current) return;
    await syncRef.current();
    // Invalidate all pending sync work before deleting its account.
    sessionRef.current = null;
    setInitializing(true);
    const { error } = await client.rpc("delete_my_account");
    if (error) {
      sessionRef.current = current;
      setInitializing(false);
      throw error;
    }
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OWNER);
    localStorage.removeItem(cacheKey(current.user.id));
    localStorage.removeItem(baseKey(current.user.id));
    localStorage.removeItem("antaverse:sport:before-restore");
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager?.getSubscription();
      await subscription?.unsubscribe();
    }
    await client.auth.signOut({ scope: "local" });
    // Full reload discards all views from the deleted account.
    location.replace(new URL("/sport/", location.origin).href);
  }
  const blocked = cloudConfigured && (loading || !exclusive || initializing);
  return (
    <Context.Provider
      value={{
        session,
        profile,
        loading,
        recovery,
        refreshProfile,
        status,
        sync: () => syncRef.current(),
        signOut,
        deleteAccount,
        clearRecovery: () => setRecovery(false),
      }}
    >
      {fatal ? (
        <div className={styles.panel} role="alert">
          {fatal}
        </div>
      ) : blocked ? (
        <div className={styles.panel} role="status">
          {!exclusive && !loading
            ? "Ouvrez Sport dans un seul onglet. Fermez l’autre onglet pour continuer ici."
            : "Ouverture de votre carnet…"}
        </div>
      ) : (
        <>
          {conflict ? (
            <section className={styles.panel} aria-labelledby="conflict-title">
              <h1 id="conflict-title">Quel carnet souhaitez-vous conserver ?</h1>
              <p>
                Les deux versions ont changé. Votre version locale contient{" "}
                {readSnapshot().history.length} séance(s), la version en ligne{" "}
                {conflict.remote.history.length}. Exportez votre carnet avant de choisir si vous
                souhaitez conserver les deux.
              </p>
              <button onClick={() => exportSport(readSnapshot())}>Exporter mon carnet local</button>
              <div className={styles.actions}>
                {[false, true].map((remote) => (
                  <button
                    key={String(remote)}
                    disabled={resolving}
                    onClick={async () => {
                      setResolving(true);
                      try {
                        await resolveRef.current(remote);
                      } catch (error) {
                        setStatus(friendlyError(error));
                      } finally {
                        setResolving(false);
                      }
                    }}
                  >
                    {remote ? "Récupérer la version en ligne" : "Conserver ma version locale"}
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <div key={`${id ?? "guest"}:${epoch}`}>{children}</div>
          )}
        </>
      )}
    </Context.Provider>
  );
}

export function exportSport(snapshot: Snapshot) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = `antaverse-sport-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
