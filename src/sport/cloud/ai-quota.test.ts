// @vitest-environment node
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile } from "node:fs/promises";

const alice = "00000000-0000-4000-8000-000000000001";
const bob = "00000000-0000-4000-8000-000000000002";
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    grant usage on schema public to anon, authenticated, service_role;
    insert into auth.users values ('${alice}'), ('${bob}');`);
  await db.exec(await readFile("supabase/migrations/202610190001_sport_ai_quota.sql", "utf8"));
}, 60000);
beforeEach(async () => {
  await db.exec("reset role; truncate public.sport_ai_user_usage, public.sport_ai_global_usage;");
});
afterAll(async () => { await db?.close(); });
async function consume(user = alice, daily = 20, global = 100, minute = 3) {
  return (await db.query<{ allowed: boolean }>(
    "select public.consume_sport_ai_quota($1::uuid,$2::integer,$3::integer,$4::integer) as allowed",
    [user, daily, global, minute],
  )).rows[0]!.allowed;
}

describe.sequential("Sport assistant quota actual SQL migration", () => {
  it("denies all counters and the RPC to anonymous and authenticated clients", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await expect(consume()).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from sport_ai_user_usage")).rejects.toThrow(/permission denied/);
      await expect(db.query("select * from sport_ai_global_usage")).rejects.toThrow(/permission denied/);
      await db.exec("reset role");
    }
    await db.exec("set role service_role");
    expect(await consume()).toBe(true);
  });
  it("enforces the per-minute quota without reserving failed attempts", async () => {
    await db.exec("set role service_role");
    expect(await consume()).toBe(true);
    expect(await consume()).toBe(true);
    expect(await consume()).toBe(true);
    expect(await consume()).toBe(false);
    await db.exec("reset role");
    const user = (await db.query<{ request_count: number; minute_count: number }>("select request_count, minute_count from sport_ai_user_usage")).rows[0];
    expect(user).toEqual({ request_count: 3, minute_count: 3 });
    expect((await db.query<{ request_count: number }>("select request_count from sport_ai_global_usage")).rows[0]!.request_count).toBe(3);
  });
  it("resets minute count on a new minute while preserving the daily quota", async () => {
    expect(await consume(alice, 2, 100, 1)).toBe(true);
    await db.exec("update sport_ai_user_usage set minute = minute - interval '1 minute'");
    expect(await consume(alice, 2, 100, 1)).toBe(true);
    await db.exec("update sport_ai_user_usage set minute = minute - interval '1 minute'");
    expect(await consume(alice, 2, 100, 1)).toBe(false);
    expect(await consume(bob, 2, 100, 1)).toBe(true);
  });
  it("shares the global ceiling across users atomically", async () => {
    const attempts = await Promise.all([consume(alice, 20, 1), consume(bob, 20, 1)]);
    expect(attempts.filter(Boolean)).toHaveLength(1);
    expect((await db.query("select * from sport_ai_user_usage")).rows).toHaveLength(1);
  });
  it("rejects null, zero and excessive server limit arguments", async () => {
    for (const args of [[null, 100, 3], [0, 100, 3], [101, 100, 3], [20, 10001, 3], [20, 0, 3], [20, 100, 11], [20, 100, 0]]) {
      await expect(db.query("select consume_sport_ai_quota($1::uuid,$2::integer,$3::integer,$4::integer)", [alice, ...args])).rejects.toThrow("INVALID_QUOTA_CONFIGURATION");
    }
    expect((await db.query("select * from sport_ai_user_usage")).rows).toHaveLength(0);
  });
  it("prunes counters older than seven days and starts a fresh day", async () => {
    await db.query("insert into sport_ai_user_usage values ((now() at time zone 'UTC')::date - 8,$1,100,now(),3)", [alice]);
    await db.exec("insert into sport_ai_global_usage values ((now() at time zone 'UTC')::date - 8,10000)");
    expect(await consume()).toBe(true);
    expect((await db.query<{ request_count: number }>("select request_count from sport_ai_user_usage")).rows).toEqual([{ request_count: 1 }]);
    expect((await db.query<{ request_count: number }>("select request_count from sport_ai_global_usage")).rows).toEqual([{ request_count: 1 }]);
  });
  it("deleting a user cascades their counter while retaining anonymous global usage", async () => {
    expect(await consume()).toBe(true);
    await db.query("delete from auth.users where id=$1", [alice]);
    expect((await db.query("select * from sport_ai_user_usage")).rows).toHaveLength(0);
    expect((await db.query<{ request_count: number }>("select request_count from sport_ai_global_usage")).rows[0]!.request_count).toBe(1);
    await db.query("insert into auth.users values ($1)", [alice]);
  });
});
