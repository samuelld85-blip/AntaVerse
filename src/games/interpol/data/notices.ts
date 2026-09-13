import raw from "./notices.json";
import type { Notice } from "../lib/game/types";

/**
 * Real, public Interpol Red Notices — name, nationality, photo, and charge —
 * downloaded once from Interpol's own public API
 * (ws-public.interpol.int/notices/v1/red) and bundled locally so the game
 * makes no network request at play time. Each entry's `sourceUrl` links back
 * to the official public notice.
 */
export const NOTICES: readonly Notice[] = raw as Notice[];
