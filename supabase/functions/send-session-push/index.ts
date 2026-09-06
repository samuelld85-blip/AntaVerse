import { createClient } from "npm:@supabase/supabase-js@2.115.0";
// @deno-types="npm:@types/web-push@3.6.4"
import webpush from "npm:web-push@3.6.7";

// Invoked by a scheduled job, never by the browser. A separate secret authenticates it.
Deno.serve(async (request: Request) => {
  const secret = Deno.env.get("PUSH_WORKER_SECRET");
  if (!secret || request.method !== "POST" || request.headers.get("x-push-secret") !== secret)
    return new Response("Unauthorized", { status: 401 });
  const publicKey = Deno.env.get("WEB_PUSH_PUBLIC_KEY");
  const privateKey = Deno.env.get("WEB_PUSH_PRIVATE_KEY");
  const subject = Deno.env.get("WEB_PUSH_SUBJECT");
  if (!publicKey || !privateKey || !subject)
    return new Response("Push configuration missing", { status: 503 });
  webpush.setVapidDetails(subject, publicKey, privateKey);
  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { data: jobs, error } = await db.rpc("claim_push_jobs");
  if (error) return new Response("Queue unavailable", { status: 503 });
  let delivered = 0;
  // Five deliveries in parallel keep a batch within the Edge runtime deadline.
  const queue = (jobs ?? []) as {
    id: number;
    actor: string;
    recipient: string;
    session_id: string;
    endpoint: string;
  }[];
  for (let offset = 0; offset < queue.length; offset += 5) {
    await Promise.all(
      queue.slice(offset, offset + 5).map(async (job) => {
        try {
          const { data: friends, error: friendError } = await db
            .from("friendships")
            .select("requester")
            .not("accepted_at", "is", null)
            .or(
              `and(requester.eq.${job.actor},recipient.eq.${job.recipient}),and(requester.eq.${job.recipient},recipient.eq.${job.actor})`,
            );
          const { data: subscription, error: subscriptionError } = await db
            .from("push_subscriptions")
            .select("endpoint,p256dh,auth")
            .eq("endpoint", job.endpoint)
            .eq("user_id", job.recipient)
            .maybeSingle();
          const { data: session, error: sessionError } = await db
            .from("sport_sessions")
            .select("session_id")
            .eq("user_id", job.actor)
            .eq("session_id", job.session_id)
            .maybeSingle();
          if (friendError || subscriptionError || sessionError) throw new Error("Lookup failed");
          if (!friends?.length || !subscription || !session) {
            await db.from("push_jobs").delete().eq("id", job.id);
            return;
          }
          // Endpoints come from users: never allow arbitrary requests to internal hosts.
          const url = new URL(subscription.endpoint);
          const allowed =
            url.hostname === "fcm.googleapis.com" ||
            url.hostname === "updates.push.services.mozilla.com" ||
            url.hostname.endsWith(".push.apple.com") ||
            url.hostname === "web.push.apple.com" ||
            url.hostname.endsWith(".notify.windows.com");
          if (url.protocol !== "https:" || url.port || url.username || url.password || !allowed) {
            await db.from("push_subscriptions").delete().eq("endpoint", job.endpoint);
            return;
          }
          const { data: actor, error: actorError } = await db
            .from("profiles")
            .select("username")
            .eq("id", job.actor)
            .single();
          if (actorError) throw actorError;
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            JSON.stringify({
              title: "AntaVerse Sport",
              body: `@${actor.username} vient de terminer une séance !`,
              tag: `sport-${job.actor}-${job.session_id}`,
              url: "/sport/?social=1",
            }),
            { TTL: 86400, timeout: 10000 },
          );
          const { error: updateError } = await db
            .from("push_jobs")
            .update({ delivered_at: new Date().toISOString() })
            .eq("id", job.id);
          if (updateError) throw updateError;
          delivered++;
        } catch (error) {
          const status = (error as { statusCode?: number }).statusCode;
          if (status === 404 || status === 410)
            await db.from("push_subscriptions").delete().eq("endpoint", job.endpoint);
          // The leased job retries after five minutes. Never log subscription keys or endpoints.
        }
      }),
    );
  }
  // Bound operational records; session_events remains for completion deduplication.
  await db
    .from("push_jobs")
    .delete()
    .lt("available_at", new Date(Date.now() - 7 * 86400000).toISOString());
  return Response.json({ delivered, processed: jobs?.length ?? 0 });
});
