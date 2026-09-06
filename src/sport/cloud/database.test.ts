// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { emptyStore } from "../model";

const alice = "00000000-0000-0000-0000-000000000001";
const bob = "00000000-0000-0000-0000-000000000002";
const eve = "00000000-0000-0000-0000-000000000003";
let db: PGlite;
async function asUser(id: string) {
  await db.exec(
    `reset role; set role authenticated; select set_config('request.jwt.claim.sub', '${id}', false);`,
  );
}
async function save(revision: number, data: unknown) {
  return db.query<{ save_backup: number }>("select public.save_backup($1, $2::jsonb)", [
    revision,
    JSON.stringify(data),
  ]);
}
const session = (id: string) => ({
  id,
  kind: "full",
  startedAt: new Date().toISOString(),
  endedAt: new Date().toISOString(),
  exercises: [],
});
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    grant usage on schema auth, public to authenticated, anon, service_role;
    grant execute on function auth.uid() to authenticated;
    insert into auth.users values('${alice}'),('${bob}'),('${eve}');`);
  await db.exec(await readFile("supabase/migrations/202609060001_accounts_social.sql", "utf8"));
  await db.exec(await readFile("supabase/migrations/202609060002_session_feedback.sql", "utf8"));
  for (const [id, username] of [
    [alice, "Alice"],
    [bob, "Bob"],
    [eve, "Eve"],
  ]) {
    await asUser(id!);
    await db.query("insert into profiles(id,username) values($1,$2)", [id, username]);
  }
}, 60000);
afterAll(async () => {
  await db?.close();
});
describe.sequential("actual PostgreSQL migration and RLS", () => {
  it("requires a unique nickname and denies impersonating another profile", async () => {
    await asUser(bob);
    await expect(
      db.query("update profiles set username='alice' where id=$1", [bob]),
    ).rejects.toThrow();
    const result = await db.query(
      "update profiles set username='Imposter' where id=$1 returning id",
      [alice],
    );
    expect(result.rows).toHaveLength(0);
  });
  it("saves, retrieves, versions and rejects stale writes", async () => {
    await asUser(alice);
    expect((await save(0, emptyStore())).rows[0]?.save_backup).toBe(1);
    await save(1, { ...emptyStore(), history: [session("first")] });
    await expect(save(1, emptyStore())).rejects.toThrow("BACKUP_CONFLICT");
    expect((await db.query("select * from backup_versions")).rows).toHaveLength(1);
    await asUser(bob);
    expect((await db.query("select * from backups")).rows).toHaveLength(0);
    expect((await db.query("select * from backup_versions")).rows).toHaveLength(0);
    await expect(db.query("update backups set payload='{}'")).rejects.toThrow();
  });
  it("shares only completed sessions after the recipient accepts", async () => {
    await asUser(bob);
    expect((await db.query("select * from sport_sessions")).rows).toHaveLength(0);
    await db.query("insert into friendships(requester,recipient) values($1,$2)", [bob, alice]);
    await expect(db.query("select accept_friend($1)", [alice])).rejects.toThrow();
    await expect(db.query("update friendships set accepted_at=now()")).rejects.toThrow();
    expect((await db.query("select * from sport_sessions")).rows).toHaveLength(0);
    await asUser(alice);
    await db.query("select accept_friend($1)", [bob]);
    await asUser(bob);
    expect((await db.query("select * from sport_sessions")).rows).toHaveLength(1);
    expect((await db.query("select * from backups")).rows).toHaveLength(0);
    await asUser(eve);
    expect((await db.query("select * from sport_sessions")).rows).toHaveLength(0);
  });
  it("queues exactly one push per new session and subscribed friend, not on edits", async () => {
    await asUser(bob);
    await db.query(
      "insert into push_subscriptions(endpoint,user_id,p256dh,auth) values($1,$2,'key','auth')",
      ["https://fcm.googleapis.com/example", bob],
    );
    await asUser(alice);
    const snapshot = { ...emptyStore(), history: [session("first"), session("second")] };
    await save(2, snapshot);
    await save(3, snapshot);
    await expect(db.query("select * from push_jobs")).rejects.toThrow();
    await db.exec("reset role");
    expect((await db.query("select * from push_jobs")).rows).toHaveLength(1);
    expect((await db.query("select * from claim_push_jobs()")).rows).toHaveLength(1);
    expect((await db.query("select * from claim_push_jobs()")).rows).toHaveLength(0);
  });
  it("lets accepted friends like and comment, and hides feedback from others", async () => {
    await asUser(bob);
    await db.query("insert into session_likes(owner,session_id,actor) values($1,'first',$2)", [
      alice,
      bob,
    ]);
    await db.query(
      "insert into session_comments(owner,session_id,actor,body) values($1,'first',$2,'Bien joué')",
      [alice, bob],
    );
    await expect(
      db.query("insert into session_likes(owner,session_id,actor) values($1,'first',$2)", [
        alice,
        eve,
      ]),
    ).rejects.toThrow();
    await asUser(eve);
    expect((await db.query("select * from session_likes")).rows).toHaveLength(0);
    expect((await db.query("select * from session_comments")).rows).toHaveLength(0);
    await asUser(alice);
    expect((await db.query("select * from session_likes")).rows).toHaveLength(1);
    // The session owner can moderate a comment on their own session.
    await db.query("delete from session_comments where owner=$1", [alice]);
    await asUser(bob);
    expect((await db.query("select * from session_comments")).rows).toHaveLength(0);
    await db.query("delete from session_likes where actor=$1", [bob]);
  });
  it("revokes access on removing a friend", async () => {
    await asUser(bob);
    await db.query("delete from friendships where requester=$1 and recipient=$2", [bob, alice]);
    expect((await db.query("select * from sport_sessions")).rows).toHaveLength(0);
  });
  it("deletes only the signed-in account with all dependent data", async () => {
    await asUser(alice);
    await db.query("select delete_my_account()");
    await db.exec("reset role");
    expect((await db.query("select * from backups where user_id=$1", [alice])).rows).toHaveLength(
      0,
    );
    expect((await db.query("select * from auth.users")).rows).toHaveLength(2);
  });
});
