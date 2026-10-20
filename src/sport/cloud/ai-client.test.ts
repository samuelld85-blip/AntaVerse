import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { requestSportAssistant } from "./ai-client";
import { buildAssistantContext } from "../ai/context";
import type { AssistantRequest } from "../../../supabase/functions/_shared/sport-ai-contract";

const { getSession, getCloud } = vi.hoisted(() => ({ getSession: vi.fn(), getCloud: vi.fn() }));
vi.mock("./client", () => ({ getCloud }));
const request: AssistantRequest = {
  mode: "prepare",
  messages: [{ role: "user", content: "Prépare une séance" }],
  context: buildAssistantContext([]),
  draft: null,
};
const answer = { message: "Quel matériel utilisez-vous ?", observations: [], draft: null };
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
  getCloud.mockReturnValue({ auth: { getSession } });
  getSession.mockResolvedValue({
    data: { session: { access_token: "test-access-token" } },
    error: null,
  });
  vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Sport assistant browser transport", () => {
  it("requires a configured connected account and never sends invalid requests", async () => {
    getCloud.mockReturnValueOnce(null);
    await expect(requestSportAssistant(request)).rejects.toThrow("pas encore activé");
    getSession.mockResolvedValueOnce({ data: { session: null }, error: null });
    await expect(requestSportAssistant(request)).rejects.toThrow("Reconnectez");
    await expect(requestSportAssistant({ ...request, messages: [] })).rejects.toThrow("incomplète");
    expect(fetch).not.toHaveBeenCalled();
  });
  it("sends only validated payload and bearer session through the Sport backend", async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify(answer)));
    await expect(requestSportAssistant(request)).resolves.toEqual(answer);
    const [, options] = vi.mocked(fetch).mock.calls[0]!;
    expect(options?.headers).toMatchObject({ Authorization: "Bearer test-access-token" });
    expect(JSON.parse(String(options?.body))).toEqual(request);
    expect(String(options?.body)).not.toContain("test-access-token");
  });
  it("maps known and arbitrary server errors to safe French messages", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: "quota_exceeded", message: "PRIVATE UPSTREAM DETAIL" } }),
        { status: 429 },
      ),
    );
    await expect(requestSportAssistant(request)).rejects.toThrow("limite");
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(
        JSON.stringify({ error: { code: "unknown", message: "PRIVATE UPSTREAM DETAIL" } }),
        { status: 502 },
      ),
    );
    await expect(requestSportAssistant(request)).rejects.toThrow("indisponible");
  });
  it("rejects malformed drafts, malformed JSON and unknown session citations", async () => {
    for (const body of [
      "bad json",
      JSON.stringify({ ...answer, draft: { exerciseId: "invented" } }),
      JSON.stringify({
        ...answer,
        observations: [{ text: "Une séance", sessionIds: ["another-user"] }],
      }),
    ]) {
      vi.mocked(fetch).mockResolvedValueOnce(new Response(body));
      await expect(requestSportAssistant(request)).rejects.toThrow("pas exploitable");
    }
  });
  it("preserves a cancellation instead of rendering it as an upstream error", async () => {
    const controller = new AbortController();
    vi.mocked(fetch).mockImplementation(async (_url, options) => {
      controller.abort();
      expect(options?.signal?.aborted).toBe(true);
      throw new DOMException("aborted", "AbortError");
    });
    await expect(requestSportAssistant(request, controller.signal)).rejects.toMatchObject({
      name: "AbortError",
    });
  });
  it("does not send offline requests", async () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    await expect(requestSportAssistant(request)).rejects.toThrow("hors ligne");
    expect(fetch).not.toHaveBeenCalled();
  });
});
