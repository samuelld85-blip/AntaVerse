"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { accountUrl, friendlyError, getCloud } from "./client";
import { useSportCloud } from "./provider";
import { snapshotSchema, writeSnapshot } from "./snapshot";
import { notifySaveChanged } from "./changed";
import styles from "./cloud.module.css";

export function SportAccount() {
  const cloud = useSportCloud();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [providers, setProviders] = useState<{ google: boolean; apple: boolean }>({
    google: false,
    apple: false,
  });
  const [restore, setRestore] = useState<ReturnType<typeof snapshotSchema.parse> | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [versions, setVersions] = useState<
    { revision: number; updated_at: string; payload: unknown }[]
  >([]);
  const client = getCloud();
  useEffect(() => {
    if (!client) return;
    const controller = new AbortController();
    void fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => {
        setProviders({
          google: data.external?.google === true,
          apple: data.external?.apple === true,
        });
      })
      .catch(() => {});
    const parameters = new URLSearchParams(location.search);
    if (parameters.has("error") || new URLSearchParams(location.hash.slice(1)).has("error"))
      queueMicrotask(() =>
        setMessage("La connexion a été annulée ou le lien a expiré. Réessayez ci-dessous."),
      );
    return () => controller.abort();
  }, [client]);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(friendlyError(error));
    } finally {
      setBusy(false);
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!client) return;
    await run(async () => {
      if (cloud.recovery) {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        setPassword("");
        cloud.clearRecovery();
        history.replaceState(null, "", "/sport/compte/");
        setMessage("Votre mot de passe a été changé.");
      } else if (mode === "reset") {
        const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: accountUrl(true),
        });
        if (error) throw error;
        setMessage(
          "Si ce compte existe, un e-mail vous permettra de choisir un nouveau mot de passe. Ouvrez-le dans ce navigateur.",
        );
      } else if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { requested_username: username.trim() }, emailRedirectTo: accountUrl() },
        });
        if (error) throw error;
        if (!data.session) {
          setMessage(
            "La connexion immédiate n’est pas encore activée sur le serveur. Contactez l’administrateur.",
          );
          return;
        }
        const { error: profileError } = await client
          .from("profiles")
          .insert({ id: data.session.user.id, username: username.trim() });
        if (profileError) throw profileError;
        await cloud.refreshProfile();
        await cloud.sync();
        setPassword("");
      } else {
        const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          if (/invalid login credentials/i.test(error.message)) {
            setMode("signup");
            setMessage(
              "Aucun compte ne correspond à cet e-mail et ce mot de passe. Choisissez un pseudo pour créer votre compte.",
            );
            return;
          }
          throw error;
        }
        setPassword("");
      }
    });
  }
  return (
    <main className={styles.panel}>
      <Link href="/sport">← Mon carnet Sport</Link>
      <h1>
        {cloud.recovery
          ? "Nouveau mot de passe"
          : cloud.session
            ? "Mon compte Sport"
            : "Retrouvez votre carnet partout"}
      </h1>
      <p className={styles.muted}>
        Séances, favoris et historique sauvegardés en ligne. Le carnet reste utilisable hors
        connexion.
      </p>
      {message && (
        <p className={styles.notice} role="status">
          {message}
        </p>
      )}
      {!client ? (
        <p className={styles.notice}>
          Les comptes en ligne ne sont pas encore disponibles. Votre carnet reste enregistré sur cet
          appareil ; vous pouvez l’exporter ci-dessous.
        </p>
      ) : cloud.session && !cloud.recovery ? (
        <>
          <p>{cloud.session.user.email}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(async () => {
                const { error } = await client
                  .from("profiles")
                  .upsert({ id: cloud.session!.user.id, username: username.trim() });
                if (error) throw error;
                await cloud.refreshProfile();
                await cloud.sync();
                setMessage("Pseudo enregistré.");
              });
            }}
          >
            <label>
              Pseudo
              <input
                required
                pattern="[A-Za-z0-9_]{3,24}"
                minLength={3}
                maxLength={24}
                autoComplete="nickname"
                placeholder={cloud.profile?.username ?? "Votre pseudo"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-describedby="nickname-help"
              />
            </label>
            <small id="nickname-help">
              3 à 24 lettres sans accent, chiffres ou _. Visible dans la liste des joueurs Sport.
            </small>
            <button className={styles.primary} disabled={busy}>
              {cloud.profile ? "Modifier mon pseudo" : "Choisir mon pseudo"}
            </button>
          </form>
          {!cloud.profile && (
            <p>Choisissez votre pseudo pour activer la sauvegarde et rejoindre vos amis.</p>
          )}
          <p role="status">{cloud.status}</p>
          <div className={styles.actions}>
            <button disabled={busy || !cloud.profile} onClick={() => void run(cloud.sync)}>
              Sauvegarder maintenant
            </button>
            <button disabled={busy} onClick={() => void run(cloud.signOut)}>
              Me déconnecter
            </button>
          </div>
          <button
            disabled={busy}
            onClick={() =>
              void run(async () => {
                const { data, error } = await client
                  .from("backup_versions")
                  .select("revision, updated_at, payload")
                  .eq("user_id", cloud.session!.user.id)
                  .order("revision", { ascending: false })
                  .limit(10);
                if (error) throw error;
                setVersions(data ?? []);
                if (!data?.length) setMessage("Aucune version précédente pour le moment.");
              })
            }
          >
            Voir les sauvegardes précédentes
          </button>
          <ul className={styles.list}>
            {versions.map((v) => (
              <li key={v.revision}>
                {new Date(v.updated_at).toLocaleString("fr-FR")}
                <button
                  onClick={() => {
                    try {
                      setRestore(snapshotSchema.parse(v.payload));
                    } catch {
                      setMessage("Cette sauvegarde est incompatible avec cette version de Sport.");
                    }
                  }}
                >
                  Restaurer cette version
                </button>
              </li>
            ))}
          </ul>
          <details>
            <summary>Supprimer mon compte Sport</summary>
            <p>
              Cette action supprime le compte, ses sauvegardes, son pseudo, ses amitiés et ses
              abonnements push. Exportez d’abord votre carnet si vous souhaitez le conserver.
            </p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}>Supprimer mon compte…</button>
            ) : (
              <div className={styles.actions}>
                <button onClick={() => setConfirmDelete(false)}>Annuler</button>
                <button disabled={busy} onClick={() => void run(cloud.deleteAccount)}>
                  Confirmer la suppression définitive
                </button>
              </div>
            )}
          </details>
        </>
      ) : (
        <>
          {!cloud.recovery && (
            <div className={styles.actions}>
              {(["google", "apple"] as const)
                .filter((p) => providers[p])
                .map((provider) => (
                  <button
                    key={provider}
                    disabled={busy}
                    onClick={() =>
                      void run(async () => {
                        const { error } = await client!.auth.signInWithOAuth({
                          provider,
                          options: { redirectTo: accountUrl() },
                        });
                        if (error) throw error;
                      })
                    }
                  >
                    Continuer avec {provider === "google" ? "Google" : "Apple"}
                  </button>
                ))}
            </div>
          )}
          <form onSubmit={submit}>
            <fieldset disabled={busy}>
              {!cloud.recovery && (
                <label>
                  E-mail
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </label>
              )}
              {!cloud.recovery && mode === "signup" && (
                <label>
                  Pseudo
                  <input
                    required
                    autoComplete="nickname"
                    pattern="[A-Za-z0-9_]{3,24}"
                    minLength={3}
                    maxLength={24}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <small>3 à 24 lettres, chiffres ou _. Visible par les joueurs Sport.</small>
                </label>
              )}
              {(cloud.recovery || mode !== "reset") && (
                <>
                  <label>
                    Mot de passe
                    <input
                      type="password"
                      autoComplete={
                        cloud.recovery || mode === "signup" ? "new-password" : "current-password"
                      }
                      required
                      minLength={mode === "login" && !cloud.recovery ? 1 : 8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </label>
                  {(mode === "signup" || cloud.recovery) && <small>Au moins 8 caractères.</small>}
                </>
              )}
              <button className={styles.primary}>
                {busy
                  ? "Un instant…"
                  : cloud.recovery
                    ? "Enregistrer le mot de passe"
                    : mode === "signup"
                      ? "Créer mon compte"
                      : mode === "reset"
                        ? "Recevoir un lien de récupération"
                        : "Me connecter"}
              </button>
            </fieldset>
          </form>
          {!cloud.recovery && mode === "signup" && (
            <button
              type="button"
              className={styles.quiet}
              disabled={busy}
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
            >
              J’ai déjà un compte
            </button>
          )}
          {!cloud.recovery && mode !== "signup" && (
            <button
              type="button"
              className={styles.quiet}
              disabled={busy}
              onClick={() => {
                setMode(mode === "reset" ? "login" : "reset");
                setMessage("");
              }}
            >
              {mode === "reset" ? "Retour à la connexion" : "Mot de passe oublié ?"}
            </button>
          )}
        </>
      )}
      {restore && (
        <div className={styles.notice}>
          <p>
            Remplacer le carnet actuel par cette sauvegarde de {restore.history.length} séance(s) ?
            La modification sera synchronisée avec votre compte.
          </p>
          <div className={styles.actions}>
            <button onClick={() => setRestore(null)}>Annuler</button>
            <button
              onClick={() => {
                try {
                  writeSnapshot(restore);
                  notifySaveChanged();
                  setRestore(null);
                  setMessage("Carnet restauré. Vous pouvez retourner à Sport.");
                } catch {
                  setMessage("Restauration impossible : libérez de l’espace puis réessayez.");
                }
              }}
            >
              Confirmer la restauration
            </button>
          </div>
        </div>
      )}
      <p className={styles.muted}>
        <Link href="/legal/confidentialite">Confidentialité et gestion de vos données</Link>
      </p>
    </main>
  );
}
