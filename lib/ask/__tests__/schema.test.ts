import { describe, expect, it } from "vitest";

import { askFieldLimits, parseAskInput } from "../schema";

const valid = { body: "Hello there, how are you?", elapsed: 12_000 };

describe("parseAskInput", () => {
  it("accepts a minimal submission and defaults the honeypot", () => {
    const result = parseAskInput(valid);
    expect(result).toEqual({
      success: true,
      data: { body: valid.body, website: "", elapsed: valid.elapsed },
    });
  });

  it("trims the body before checking its length", () => {
    const result = parseAskInput({ ...valid, body: `   ${"a".repeat(9)}   ` });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.fieldErrors.body).toHaveLength(1);
  });

  it("enforces the body limits exactly", () => {
    const { min, max } = askFieldLimits.body;
    expect(parseAskInput({ ...valid, body: "a".repeat(min) }).success).toBe(
      true
    );
    expect(parseAskInput({ ...valid, body: "a".repeat(max) }).success).toBe(
      true
    );
    expect(parseAskInput({ ...valid, body: "a".repeat(max + 1) }).success).toBe(
      false
    );
  });

  it("turns an empty name into undefined", () => {
    const result = parseAskInput({ ...valid, name: "  " });
    expect(result.success && result.data.name).toBeUndefined();
  });

  it("rejects a long name with a field error", () => {
    const result = parseAskInput({
      ...valid,
      name: "n".repeat(askFieldLimits.name.max + 1),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.fieldErrors)).toEqual(["name"]);
    }
  });

  it("drops a legacy email field instead of storing it", () => {
    const result = parseAskInput({ ...valid, email: "me@example.com" });
    expect(result.success && "email" in result.data).toBe(false);
  });

  it("reports hidden-field problems without field errors", () => {
    expect(parseAskInput({ body: valid.body })).toEqual({
      success: false,
      fieldErrors: {},
    });
    for (const elapsed of ["soon", -1, 1.5]) {
      expect(parseAskInput({ ...valid, elapsed })).toEqual({
        success: false,
        fieldErrors: {},
      });
    }
  });

  it("rejects non-object payloads", () => {
    expect(parseAskInput(null).success).toBe(false);
    expect(parseAskInput("hello").success).toBe(false);
  });
});
