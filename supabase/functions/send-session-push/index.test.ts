// @deno-types="npm:@types/web-push@3.6.4"
import webpush from "npm:web-push@3.6.7";

let handler: (request: Request) => Promise<Response>;
Deno.serve = ((callback: typeof handler) => {
  handler = callback;
  return {};
}) as typeof Deno.serve;
await import("./index.ts");
const vapid = webpush.generateVAPIDKeys();
Deno.env.set("PUSH_WORKER_SECRET", "isolated-test-secret");
Deno.env.set("WEB_PUSH_PUBLIC_KEY", vapid.publicKey);
Deno.env.set("WEB_PUSH_PRIVATE_KEY", vapid.privateKey);
Deno.env.set("WEB_PUSH_SUBJECT", "mailto:test@example.com");
Deno.env.set("SUPABASE_URL", "https://isolated-test.supabase.co");
Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "isolated-test-service-key");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
let friends = true;
let endpoint = "https://fcm.googleapis.com/isolated-test";
let sent = 0;
let delivered = 0;
let removed = 0;
let failSend = false;
let sawBody = "";
webpush.sendNotification = async (_subscription, payload) => {
  sent++;
  sawBody = String(payload);
  if (failSend) throw Object.assign(new Error("gone"), { statusCode: 410 });
  return { statusCode: 201, body: "", headers: {} };
};
// All network is intercepted. Tests must never contact Supabase or a push provider.
globalThis.fetch = async (input, init) => {
  const url = new URL(
    typeof input === "string" ? input : input instanceof URL ? input.href : input.url,
  );
  const table = url.pathname.split("/").at(-1);
  if (url.hostname !== "isolated-test.supabase.co") throw new Error("Unexpected network request");
  if (table === "claim_push_jobs")
    return Response.json([{ id: 1, actor: "alice", recipient: "bob", session_id: "s1", endpoint }]);
  if (init?.method === "PATCH" && table === "push_jobs") {
    delivered++;
    return new Response(null, { status: 204 });
  }
  if (init?.method === "DELETE") {
    if (table === "push_subscriptions") removed++;
    return new Response(null, { status: 204 });
  }
  if (table === "friendships") return Response.json(friends ? [{ requester: "alice" }] : []);
  if (table === "push_subscriptions")
    return Response.json([{ endpoint, p256dh: "test", auth: "test" }]);
  if (table === "sport_sessions") return Response.json([{ session_id: "s1" }]);
  if (table === "profiles") return Response.json({ username: "Alice" });
  throw new Error(`Unhandled test route: ${table}`);
};
const request = () =>
  new Request("https://worker.example", {
    method: "POST",
    headers: { "x-push-secret": "isolated-test-secret" },
  });
function reset() {
  friends = true;
  endpoint = "https://fcm.googleapis.com/isolated-test";
  sent = 0;
  delivered = 0;
  removed = 0;
  failSend = false;
  sawBody = "";
}
Deno.test("worker refuses unauthenticated requests", async () => {
  reset();
  const response = await handler(new Request("https://worker.example", { method: "POST" }));
  assert(response.status === 401 && sent === 0, "Expected access denial without delivery");
});
Deno.test("worker sends a finished-session message and acknowledges delivery", async () => {
  reset();
  const response = await handler(request());
  assert(
    response.status === 200 && sent === 1 && delivered === 1,
    "Expected one acknowledged delivery",
  );
  assert(
    JSON.parse(sawBody).body.includes("@Alice") && JSON.parse(sawBody).url === "/sport/?social=1",
    "Expected actor and Sport destination",
  );
});
Deno.test("worker rechecks friendship before sending", async () => {
  reset();
  friends = false;
  await handler(request());
  assert(sent === 0, "An ex-friend must not receive a push");
});
Deno.test("worker rejects arbitrary endpoints", async () => {
  reset();
  endpoint = "https://127.0.0.1/private";
  await handler(request());
  assert(sent === 0 && removed === 1, "Must reject an internal network destination");
});
Deno.test("worker removes expired subscriptions and does not mark them delivered", async () => {
  reset();
  failSend = true;
  await handler(request());
  assert(sent === 1 && removed === 1 && delivered === 0, "Expired endpoint must be removed");
});
