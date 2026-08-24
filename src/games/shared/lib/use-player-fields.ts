"use client";

import { useRef, useState } from "react";
import {
  addField,
  createDefaultFields,
  isFieldRemovable,
  removeField,
  updateFieldValue,
  type PlayerField,
} from "./participant-list";

export interface UsePlayerFieldsOptions {
  /** The game's minimum player count — the first `minPlayers` entries are never removable. */
  minPlayers: number;
  maxPlayers: number;
  /** How many empty fields to pre-fill the screen with (may be > minPlayers). */
  defaultCount: number;
}

export function usePlayerFields({ minPlayers, maxPlayers, defaultCount }: UsePlayerFieldsOptions) {
  const nextId = useRef(defaultCount);
  const [fields, setFields] = useState<PlayerField[]>(() => createDefaultFields(defaultCount));

  function updateName(id: number, value: string) {
    setFields((current) => updateFieldValue(current, id, value));
  }

  function addPlayer() {
    setFields((current) => {
      const next = addField(current, nextId.current, maxPlayers);
      if (next !== current) nextId.current += 1;
      return next;
    });
  }

  function removePlayer(id: number) {
    setFields((current) => removeField(current, id, minPlayers));
  }

  function replacePlayers(names: readonly string[]) {
    const nextNames = names.slice(0, maxPlayers);
    if (nextNames.length < minPlayers) return;
    setFields(nextNames.map((value, index) => ({ id: index, value })));
    nextId.current = nextNames.length;
  }

  function isRemovable(index: number) {
    return isFieldRemovable(index, fields.length, minPlayers);
  }

  return {
    fields,
    updateName,
    addPlayer,
    removePlayer,
    replacePlayers,
    isRemovable,
    canAddMore: fields.length < maxPlayers,
  };
}
