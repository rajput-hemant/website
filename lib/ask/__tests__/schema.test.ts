import { describe, expect, it } from "vitest";

import { askFieldLimits, parseAskInput } from "../schema";

const valid = { body: "Hello there, how are you?", t: 1_700_000_000_000 };

describe("parseAskInput", () => {
  it("accepts a minimal submission and defaults the honeypot", () => {
    const result = parseAskInput(valid);
    expect(result).toEqual({
      success: true,
      data: { body: valid.body, website: "", t: valid.t },
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

  it("turns empty optional fields into undefined", () => {
    const result = parseAskInput({ ...valid, name: "  ", email: "" });
    expect(result.success && result.data).toMatchObject({
      name: undefined,
      email: undefined,
    });
  });

  it("rejects a long name and an invalid email with field errors", () => {
    const result = parseAskInput({
      ...valid,
      name: "n".repeat(askFieldLimits.name.max + 1),
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(Object.keys(result.fieldErrors).sort()).toEqual(["email", "name"]);
    }
  });

  it("accepts a valid email, trimmed", () => {
    const result = parseAskInput({ ...valid, email: " me@example.com " });
    expect(result.success && result.data.email).toBe("me@example.com");
  });

  it("reports hidden-field problems without field errors", () => {
    expect(parseAskInput({ body: valid.body })).toEqual({
      success: false,
      fieldErrors: {},
    });
    expect(parseAskInput({ ...valid, t: "soon" })).toEqual({
      success: false,
      fieldErrors: {},
    });
  });

  it("rejects non-object payloads", () => {
    expect(parseAskInput(null).success).toBe(false);
    expect(parseAskInput("hello").success).toBe(false);
  });
});
