import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { SportAccount } from "./account";

const mock = vi.hoisted(() => ({
  login: vi.fn(),
  signup: vi.fn(),
  oauth: vi.fn(),
  reset: vi.fn(),
  update: vi.fn(),
  insert: vi.fn(),
  refresh: vi.fn(),
  sync: vi.fn(),
  clearRecovery: vi.fn(),
  recovery: false,
}));
vi.mock("./provider", () => ({
  exportSport: vi.fn(),
  useSportCloud: () => ({
    session: null,
    profile: null,
    recovery: mock.recovery,
    refreshProfile: mock.refresh,
    sync: mock.sync,
    clearRecovery: mock.clearRecovery,
  }),
}));
vi.mock("./client", () => {
  const client = {
    auth: {
      signInWithPassword: mock.login,
      signUp: mock.signup,
      signInWithOAuth: mock.oauth,
      resetPasswordForEmail: mock.reset,
      updateUser: mock.update,
    },
    from: () => ({ insert: mock.insert }),
  };
  return {
    getCloud: () => client,
    accountUrl: (recovery: boolean) =>
      `https://antaverse.example/sport/compte/${recovery ? "?recovery=1" : ""}`,
    friendlyError: () => "Erreur de connexion",
  };
});
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) =>
    createElement("a", { href }, children),
}));
let root: Root;
let host: HTMLDivElement;
async function click(text: string) {
  const button = [...host.querySelectorAll("button")].find((b) => b.textContent === text)!;
  expect(button).toBeTruthy();
  await act(async () => button.click());
}
async function fill(selector: string, value: string) {
  const input = host.querySelector<HTMLInputElement>(selector)!;
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
async function mount() {
  await act(async () => root.render(<SportAccount />));
}
async function submit() {
  await act(async () =>
    host
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true })),
  );
}
beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  vi.clearAllMocks();
  mock.recovery = false;
  for (const fn of [mock.login, mock.oauth, mock.reset, mock.update, mock.insert])
    fn.mockResolvedValue({ error: null });
  mock.signup.mockResolvedValue({ data: { session: { user: { id: "new-user" } } }, error: null });
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ external: { google: true, apple: true, azure: true } }),
      }),
  );
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it("offers Google and Apple web redirects and never Microsoft", async () => {
  await mount();
  expect(host.textContent).not.toContain("Microsoft");
  await click("Continuer avec Google");
  expect(mock.oauth).toHaveBeenCalledWith({
    provider: "google",
    options: { redirectTo: "https://antaverse.example/sport/compte/" },
  });
  await click("Continuer avec Apple");
  expect(mock.oauth.mock.calls[1]?.[0].provider).toBe("apple");
});
it("logs in using the entered email and password", async () => {
  await mount();
  await fill('input[type="email"]', "ami@example.com");
  await fill('input[type="password"]', "long-password");
  await submit();
  expect(mock.login).toHaveBeenCalledWith({ email: "ami@example.com", password: "long-password" });
});
it("creates an account, reserves its nickname and starts its backup", async () => {
  await mount();
  await click("Créer un compte");
  await fill('input[type="email"]', "ami@example.com");
  await fill('input[autocomplete="nickname"]', "Ami_1");
  await fill('input[type="password"]', "long-password");
  await submit();
  expect(mock.signup.mock.calls[0]?.[0]).toMatchObject({
    email: "ami@example.com",
    password: "long-password",
  });
  expect(mock.insert).toHaveBeenCalledWith({ id: "new-user", username: "Ami_1" });
  expect(mock.sync).toHaveBeenCalled();
});
it("does not pretend signup succeeded when email confirmation is still enabled on the server", async () => {
  mock.signup.mockResolvedValue({ data: { session: null }, error: null });
  await mount();
  await click("Créer un compte");
  await submit();
  expect(host.textContent).toContain("connexion immédiate n’est pas encore activée");
  expect(mock.insert).not.toHaveBeenCalled();
});
it("sends password recovery back to the web account page", async () => {
  await mount();
  await click("Mot de passe oublié");
  await fill('input[type="email"]', "ami@example.com");
  await submit();
  expect(mock.reset).toHaveBeenCalledWith("ami@example.com", {
    redirectTo: "https://antaverse.example/sport/compte/?recovery=1",
  });
});
it("updates the password only in a recovery session", async () => {
  mock.recovery = true;
  await mount();
  await fill('input[type="password"]', "new-long-password");
  await submit();
  expect(mock.update).toHaveBeenCalledWith({ password: "new-long-password" });
  expect(mock.clearRecovery).toHaveBeenCalled();
});
