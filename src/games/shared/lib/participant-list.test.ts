import { describe, expect, it } from "vitest";
import {
  addField,
  createDefaultFields,
  hasEmptyName,
  isFieldRemovable,
  removeField,
  updateFieldValue,
} from "./participant-list";

describe("initial screen with more fields than the game's minimum", () => {
  it("marks only the entries past minPlayers as removable (3 shown, min 2)", () => {
    const fields = createDefaultFields(3);

    expect(isFieldRemovable(0, fields.length, 2)).toBe(false);
    expect(isFieldRemovable(1, fields.length, 2)).toBe(false);
    expect(isFieldRemovable(2, fields.length, 2)).toBe(true);
  });

  it("marks no entry removable when the default count equals the minimum (3 shown, min 3)", () => {
    const fields = createDefaultFields(3);

    expect(isFieldRemovable(0, fields.length, 3)).toBe(false);
    expect(isFieldRemovable(1, fields.length, 3)).toBe(false);
    expect(isFieldRemovable(2, fields.length, 3)).toBe(false);
  });
});

describe("removeField", () => {
  it("refuses to drop below minPlayers", () => {
    const fields = createDefaultFields(2);
    const result = removeField(fields, fields[0]!.id, 2);
    expect(result).toBe(fields);
    expect(result).toHaveLength(2);
  });

  it("removes the targeted field when above minPlayers", () => {
    const fields = createDefaultFields(3);
    const result = removeField(fields, fields[2]!.id, 2);
    expect(result).toHaveLength(2);
    expect(result.map((f) => f.id)).toEqual([fields[0]!.id, fields[1]!.id]);
  });
});

describe("addField then removability", () => {
  it("a newly added player is removable", () => {
    let fields = createDefaultFields(3);
    fields = addField(fields, 100, 12);
    const newIndex = fields.length - 1;

    expect(fields).toHaveLength(4);
    expect(isFieldRemovable(newIndex, fields.length, 3)).toBe(true);
  });

  it("does not add past maxPlayers", () => {
    const fields = createDefaultFields(2);
    const result = addField(fields, 99, 2);
    expect(result).toBe(fields);
  });
});

describe("launching with exactly the minimum after a removal", () => {
  it("removing down to minPlayers and filling names passes validation", () => {
    let fields = createDefaultFields(3); // min 2, default 3
    fields = removeField(fields, fields[2]!.id, 2);
    fields = updateFieldValue(fields, fields[0]!.id, "Alice");
    fields = updateFieldValue(fields, fields[1]!.id, "Bob");

    expect(fields).toHaveLength(2);
    expect(hasEmptyName(fields)).toBe(false);
  });
});

describe("hasEmptyName", () => {
  it("blocks launch when any visible field is unnamed", () => {
    let fields = createDefaultFields(3);
    fields = updateFieldValue(fields, fields[0]!.id, "Alice");
    fields = updateFieldValue(fields, fields[1]!.id, "Bob");
    // third field left empty
    expect(hasEmptyName(fields)).toBe(true);
  });

  it("blocks launch on a name that is only whitespace", () => {
    let fields = createDefaultFields(1);
    fields = updateFieldValue(fields, fields[0]!.id, "   ");
    expect(hasEmptyName(fields)).toBe(true);
  });
});
