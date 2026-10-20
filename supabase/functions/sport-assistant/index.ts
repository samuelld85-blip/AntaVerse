import { createClient } from "npm:@supabase/supabase-js@2.115.0";
import { createHandler } from "./handler.ts";

// The gateway JWT check is disabled; getUser verifies the real user server-side.
// Never trust a user ID supplied in a request, nor decode a JWT without verification.
const env = (name: string) => Deno.env.get(name);
const client = () => createClient(env("SUPABASE_URL")!, env("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});
Deno.serve(createHandler({
  env,
  fetch: globalThis.fetch,
  authenticate: async (token) => {
    const { data, error } = await client().auth.getUser(token);
    return error || !data.user || data.user.is_anonymous ? null : data.user.id;
  },
  consumeQuota: async (userId, limits) => {
    const { data, error } = await client().rpc("consume_sport_ai_quota", {
      p_user_id: userId,
      p_user_daily_limit: limits.userDaily,
      p_global_daily_limit: limits.globalDaily,
      p_minute_limit: limits.perMinute,
    });
    if (error || typeof data !== "boolean") throw new Error("QUOTA_UNAVAILABLE");
    return data;
  },
}));
