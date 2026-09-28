import { askConfig } from "./config";

/**
 * The visible form fields' limits, messages and a dependency-free check.
 * Client-safe: the composer imports this instead of `schema.ts`, which keeps
 * zod out of the browser bundle. The server's zod schema reads the same limits
 * and messages, so both sides always agree.
 */

const { fields } = askConfig;

/** Character limits for the visible form fields, for counters and `maxLength`. */
export const askFieldLimits = {
  body: { min: fields.body.min, max: fields.body.max },
  name: { max: fields.name.max },
} as const;

export const askFieldMessages = {
  bodyMissing: "Write a message.",
  bodyShort: `Write at least ${fields.body.min} characters so there is something to answer.`,
  bodyLong: `Keep it under ${fields.body.max} characters.`,
  nameLong: `Keep your name under ${fields.name.max} characters.`,
} as const;

export type AskField = "body" | "name";
export type AskFieldErrors = Partial<Record<AskField, string[]>>;

/**
 * Length checks on the visible fields, trimmed the way the server trims them.
 * An empty result means the server will accept both fields; it still runs the
 * full validation (hidden fields, timing) on every submission.
 */
export function validateAskFields(input: {
  body: string;
  name?: string;
}): AskFieldErrors {
  const errors: AskFieldErrors = {};
  const body = input.body.trim();
  if (body.length < askFieldLimits.body.min) {
    errors.body = [askFieldMessages.bodyShort];
  } else if (body.length > askFieldLimits.body.max) {
    errors.body = [askFieldMessages.bodyLong];
  }
  if ((input.name ?? "").trim().length > askFieldLimits.name.max) {
    errors.name = [askFieldMessages.nameLong];
  }
  return errors;
}
