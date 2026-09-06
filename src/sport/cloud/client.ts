import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;
export const cloudConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
export function getCloud(): SupabaseClient | null {
  if (!cloudConfigured) return null;
  client ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { flowType: "pkce", persistSession: true, detectSessionInUrl: true } },
  );
  return client;
}

export function accountUrl(recovery = false) {
  return `${window.location.origin}/sport/compte/${recovery ? "?recovery=1" : ""}`;
}

export function friendlyError(error: unknown): string {
  const code = (error as { code?: string })?.code;
  if (code === "invalid_credentials") return "E-mail ou mot de passe incorrect.";
  if (code === "user_already_exists")
    return "Un compte existe déjà avec cet e-mail. Connectez-vous.";
  if (code === "23505") return "Ce pseudo est déjà utilisé. Choisissez-en un autre.";
  if (code === "weak_password") return "Choisissez un mot de passe plus long et moins courant.";
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit")
    return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  return "Opération impossible. Vérifiez votre connexion et réessayez. Vos données locales sont conservées.";
}
