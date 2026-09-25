import { describe, expect, it } from "vitest";

import { askFieldLimits, validateAskFields } from "../fields";
import { parseAskInput } from "../schema";

const { min, max } = askFieldLimits.body;

describe("validateAskFields", () => {
  it("accepts a message within the limits", () => {
    expect(validateAskFields({ body: "a".repeat(min) })).toEqual({});
    expect(validateAskFields({ body: "a".repeat(max), name: "" })).toEqual({});
  });

  it("trims before measuring, like the server", () => {
    const errors = validateAskFields({ body: `   ${"a".repeat(min - 1)}   ` });
    expect(errors.body).toHaveLength(1);
    expect(validateAskFields({ body: "a".repeat(min), name: "  " })).toEqual(
      {}
    );
  });

  it("reports each visible field separately", () => {
    const errors = validateAskFields({
      body: "a".repeat(max + 1),
      name: "n".repeat(askFieldLimits.name.max + 1),
    });
    expect(Object.keys(errors).sort()).toEqual(["body", "name"]);
  });

  it("returns exactly the server's field errors", () => {
    const cases = [
      { body: "" },
      { body: "short" },
      { body: ` ${"a".repeat(min)} ` },
      { body: "a".repeat(max + 1) },
      { body: "a".repeat(min), name: "n".repeat(askFieldLimits.name.max + 1) },
      { body: "hi", name: "n".repeat(askFieldLimits.name.max + 1) },
    ];
    for (const fields of cases) {
      const server = parseAskInput({ ...fields, website: "", elapsed: 5_000 });
      expect(validateAskFields(fields)).toEqual(
        server.success ? {} : server.fieldErrors
      );
    }
  });
});
