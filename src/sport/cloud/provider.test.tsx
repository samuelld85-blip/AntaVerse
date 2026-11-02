import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Session as AuthSession } from "@supabase/supabase-js";
import { emptyStore, createSession, saveStore, type SportStore } from "../model";
import { SportCloudProvider } from "./provider";
import { readSnapshot } from "./snapshot";

const server = vi.hoisted(() => ({
  session: null as AuthSession | null,
  backups: new Map<string, { payload: SportStore; revision: number }>(),
  listeners: new Set<(event: string, session: AuthSession | null) => void>(),
  writes: [] as { id: string; snapshot: SportStore }[],
  fail: false,
}));
vi.mock("./client", () => ({
  cloudConfigured: true,
  friendlyError: () => "Connexion interrompue, réessayez",
  getCloud: () => ({
    auth: {
      onAuthStateChange: (fn: (event: string, session: AuthSession | null) => void) => {
        server.listeners.add(fn);
        return { data: { subscription: { unsubscribe: () => server.listeners.delete(fn) } } };
      },
      getSession: async () => ({ data: { session: server.session }, error: null }),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (_key: string, id: string) => ({
          maybeSingle: async () =>
            server.fail
              ? { data: null, error: new Error("offline") }
              : {
                  data:
                    table === "profiles" ? { id, username: id } : (server.backups.get(id) ?? null),
                  error: null,
                },
        }),
      }),
    }),
    rpc: async (_name: string, args: { expected_revision: number; snapshot: SportStore }) => {
      const id = server.session!.user.id;
      if (server.fail) return { error: new Error("offline") };
      if ((server.backups.get(id)?.revision ?? 0) !== args.expected_revision)
        return { error: { code: "40001" } };
      server.writes.push({ id, snapshot: args.snapshot });
      server.backups.set(id, { payload: args.snapshot, revision: args.expected_revision + 1 });
      return { data: args.expected_revision + 1, error: null };
    },
  }),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));

let host: HTMLDivElement;
let root: Root;
const session = (id: string) =>
  ({ user: { id, email: `${id}@example.com` }, access_token: "test" }) as AuthSession;
const carnet = (name: string) => ({
  ...emptyStore(),
  active: { ...createSession("full", []), name },
});
const withHistory = (count: number) => ({
  ...emptyStore(),
  history: Array.from({ length: count }, (_, index) => ({
    ...createSession("full", []),
    id: `session-${index}`,
    startedAt: "2026-10-01T10:00:00.000Z",
    endedAt: "2026-10-01T11:00:00.000Z",
  })),
});
const button = (label: string) =>
  [...host.querySelectorAll("button")].find((b) => b.textContent === label)!;
const tick = async (ms = 30) => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
};
async function login(id: string | null) {
  await act(async () => {
    server.session = id ? session(id) : null;
    server.listeners.forEach((fn) => fn(id ? "SIGNED_IN" : "SIGNED_OUT", server.session));
  });
  await tick();
}
async function mount() {
  await act(async () => {
    root.render(
      <SportCloudProvider>
        <p>Carnet ouvert</p>
      </SportCloudProvider>,
    );
  });
  await tick();
}
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  localStorage.clear();
  server.backups.clear();
  server.listeners.clear();
  server.writes = [];
  server.session = null;
  server.fail = false;
  Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request: (_name: string, fn: () => Promise<void>) => fn() },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});

describe("Sport provider lifecycle", () => {
  it("downloads the authenticated account after a browser wipe", async () => {
    const remote = carnet("En ligne");
    server.session = session("alice");
    server.backups.set("alice", { payload: remote, revision: 1 });
    await mount();
    expect(readSnapshot()).toEqual(remote);
    expect(server.writes).toHaveLength(0);
    expect(host.textContent).toContain("Carnet ouvert");
  });
  it("imports an existing guest carnet on first login", async () => {
    const guest = carnet("Invité");
    saveStore(guest);
    await mount();
    await login("alice");
    expect(server.backups.get("alice")?.payload).toEqual(guest);
  });
  it("never copies Alice's local carnet into Bob's account", async () => {
    const a = carnet("Alice");
    const b = carnet("Bob");
    server.session = session("alice");
    server.backups.set("alice", { payload: a, revision: 1 });
    server.backups.set("bob", { payload: b, revision: 1 });
    await mount();
    await login("bob");
    expect(readSnapshot()).toEqual(b);
    expect(server.writes.filter((w) => w.id === "bob")).toHaveLength(0);
    await login("alice");
    expect(readSnapshot()).toEqual(a);
  });
  it("retries persisted offline edits when the network returns", async () => {
    server.session = session("alice");
    const original = carnet("Original");
    server.backups.set("alice", { payload: original, revision: 1 });
    await mount();
    Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
    const edited = { ...original, active: { ...original.active, name: "Hors ligne" } };
    await act(async () => {
      saveStore(edited);
    });
    await tick(450);
    expect(server.writes).toHaveLength(0);
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    await act(async () => window.dispatchEvent(new Event("online")));
    await tick(450);
    expect(server.backups.get("alice")?.payload).toEqual(edited);
  });
  it("uploads local edits over a newer cloud copy without asking the user", async () => {
    server.session = session("alice");
    const original = carnet("Original");
    server.backups.set("alice", { payload: original, revision: 1 });
    await mount();
    const remote = { ...original, active: { ...original.active, name: "Autre téléphone" } };
    server.backups.set("alice", { payload: remote, revision: 2 });
    const local = { ...original, active: { ...original.active, name: "Ce téléphone" } };
    await act(async () => {
      saveStore(local);
    });
    await tick(450);
    expect(host.textContent).not.toContain("Quel carnet souhaitez-vous conserver");
    expect(host.textContent).toContain("Carnet ouvert");
    expect(readSnapshot()).toEqual(local);
    expect(server.backups.get("alice")).toEqual({ payload: local, revision: 3 });
  });
  it("uploads this device's carnet over an existing cloud copy on first login, without a prompt", async () => {
    const local = carnet("Ce téléphone");
    const remote = carnet("En ligne");
    saveStore(local);
    server.session = session("alice");
    server.backups.set("alice", { payload: remote, revision: 1 });
    await mount();
    expect(host.textContent).toContain("Carnet ouvert");
    expect(host.textContent).not.toContain("Quel carnet souhaitez-vous conserver");
    expect(readSnapshot()).toEqual(local);
    expect(server.backups.get("alice")?.payload).toEqual(local);
  });
  it("asks which carnet to keep when one finished session differs, without uploading", async () => {
    server.session = session("alice");
    server.backups.set("alice", { payload: withHistory(8), revision: 1 });
    saveStore(withHistory(9));
    await mount();
    expect(host.textContent).toContain("Quel carnet souhaitez-vous conserver");
    expect(host.textContent).toContain("Carnet ouvert");
    expect(server.writes).toHaveLength(0);
    expect(readSnapshot()).toEqual(withHistory(9));
    expect(server.backups.get("alice")?.payload).toEqual(withHistory(8));
  });
  it("keeps the local carnet when chosen, even if the cloud changed meanwhile", async () => {
    server.session = session("alice");
    server.backups.set("alice", { payload: withHistory(8), revision: 1 });
    const local = withHistory(10);
    saveStore(local);
    await mount();
    server.backups.set("alice", { payload: withHistory(7), revision: 2 });
    await act(async () => button("Conserver ma version locale").click());
    await tick();
    expect(server.backups.get("alice")).toEqual({ payload: local, revision: 3 });
    expect(host.textContent).not.toContain("Quel carnet souhaitez-vous conserver");
    expect(readSnapshot()).toEqual(local);
  });
  it("restores the cloud carnet when chosen", async () => {
    server.session = session("alice");
    const remote = withHistory(8);
    server.backups.set("alice", { payload: remote, revision: 1 });
    saveStore(withHistory(10));
    await mount();
    await act(async () => button("Récupérer la version en ligne").click());
    await tick();
    expect(readSnapshot()).toEqual(remote);
    expect(host.textContent).not.toContain("Quel carnet souhaitez-vous conserver");
    expect(server.writes).toHaveLength(0);
  });
  it("shows a retryable error when the choice fails, then succeeds on retry", async () => {
    server.session = session("alice");
    server.backups.set("alice", { payload: withHistory(8), revision: 1 });
    const local = withHistory(10);
    saveStore(local);
    await mount();
    server.fail = true;
    await act(async () => button("Conserver ma version locale").click());
    expect(host.querySelector('[role="alert"]')?.textContent).toContain("Connexion interrompue");
    expect(button("Conserver ma version locale").disabled).toBe(false);
    expect(readSnapshot()).toEqual(local);
    server.fail = false;
    await act(async () => button("Conserver ma version locale").click());
    expect(server.backups.get("alice")?.payload).toEqual(local);
    expect(host.textContent).not.toContain("Quel carnet souhaitez-vous conserver");
  });
  it("keeps synchronization active after an initial service outage", async () => {
    server.session = session("alice");
    server.fail = true;
    await mount();
    server.fail = false;
    await act(async () => {
      saveStore(carnet("Après la panne"));
    });
    await tick(450);
    expect(server.backups.get("alice")?.payload.active?.name).toBe("Après la panne");
  });
});
