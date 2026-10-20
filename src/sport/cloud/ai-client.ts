import {
  requestSchema,
  responseSchema,
  type AssistantRequest,
  type AssistantResponse,
} from "../../../supabase/functions/_shared/sport-ai-contract";
import { getCloud } from "./client";

const messages: Record<string, string> = {
  not_configured:
    "L’assistant n’est pas encore activé. Vous pouvez continuer à utiliser votre carnet.",
  unauthorized: "Reconnectez-vous pour utiliser l’assistant.",
  quota_exceeded: "La limite de demandes est atteinte. Réessayez plus tard.",
  quota_unavailable: "L’assistant est temporairement indisponible. Réessayez dans un instant.",
  provider_unavailable: "L’assistant est temporairement indisponible. Réessayez dans un instant.",
  refused: "L’assistant ne peut pas répondre à cette demande. Vous pouvez la reformuler.",
  request_too_large:
    "Cette demande est trop volumineuse. Raccourcissez la conversation et réessayez.",
  invalid_request: "Cette demande est trop longue ou incomplète. Raccourcissez-la et réessayez.",
  invalid_response:
    "La proposition reçue n’est pas exploitable. Votre carnet est conservé ; vous pouvez réessayer.",
  timeout: "L’assistant a mis trop de temps à répondre. Vous pouvez réessayer.",
};

export async function requestSportAssistant(
  request: AssistantRequest,
  signal?: AbortSignal,
): Promise<AssistantResponse> {
  const parsed = requestSchema.safeParse(request);
  if (!parsed.success) throw new Error(messages.invalid_request);
  const client = getCloud();
  if (!client) throw new Error(messages.not_configured);
  if (!navigator.onLine)
    throw new Error("Vous êtes hors ligne. Retrouvez une connexion pour envoyer votre demande.");
  const { data, error } = await client.auth.getSession();
  if (error || !data.session) throw new Error(messages.unauthorized);
  const controller = new AbortController();
  let timedOut = false;
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, 95_000);
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/sport-assistant`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
        cache: "no-store",
      },
    );
    const text = await response.text();
    if (text.length > 128_000) throw new Error(messages.invalid_response);
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new Error(messages.invalid_response);
    }
    if (!response.ok) {
      const code = (body as { error?: { code?: string } })?.error?.code;
      throw new Error(
        messages[code ?? ""] ??
          (response.status === 401
            ? messages.unauthorized
            : response.status === 429
              ? messages.quota_exceeded
              : response.status === 503
                ? messages.not_configured
                : "L’assistant est indisponible. Réessayez dans un instant."),
      );
    }
    const result = responseSchema.safeParse(body);
    if (
      !result.success ||
      result.data.observations.some((item) =>
        item.sessionIds.some(
          (id) => !request.context.recentSessions.some((session) => session.id === id),
        ),
      )
    )
      throw new Error(messages.invalid_response);
    return result.data;
  } catch (error) {
    if (timedOut) throw new Error(messages.timeout);
    if (controller.signal.aborted) throw new DOMException("Demande annulée", "AbortError");
    if (error instanceof TypeError)
      throw new Error("Connexion à l’assistant impossible. Vérifiez votre réseau et réessayez.");
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
