"use client";

import { useEffect } from "react";
import { clearTeamNames } from "@/games/sans-le-dire/lib/game/persistence";

/** Leaving Sans le dire through its home screen ends the temporary team-name session. */
export function ClearTeamNamesOnHome() {
  useEffect(() => {
    clearTeamNames();
  }, []);

  return null;
}
