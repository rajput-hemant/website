import { z } from "zod";

import { askConfig } from "./config";

const { fields } = askConfig;

/** Character limits for the visible form fields, for counters and `maxLength`. */
export const askFieldLimits = {
  body: { min: fields.body.min, max: fields.body.max },
  name: { max: fields.name.max },
  email: { max: fields.email.max },
} as const;

const emptyToUndefined = (value: string | undefined) =>
  value === undefined || value === "" ? undefined : value;

export const askSchema = z.object({
  body: z
    .string({ error: "Write a message." })
    .trim()
    .min(
      fields.body.min,
      `Write at least ${fields.body.min} characters so there is something to answer.`
    )
    .max(fields.body.max, `Keep it under ${fields.body.max} characters.`),
  name: z
    .string()
    .trim()
    .max(fields.name.max, `Keep your name under ${fields.name.max} characters.`)
    .optional()
    .transform(emptyToUndefined),
  email: z
    .string()
    .trim()
    .max(fields.email.max, "That email address is too long.")
    .refine(
      (value) => value === "" || z.regexes.email.test(value),
      "Enter a valid email address, or leave it empty."
    )
    .optional()
    .transform(emptyToUndefined),
  /** Honeypot: hidden from people, so any value marks the request as automated. */
  website: z.string().max(fields.honeypot.max).optional().default(""),
  /**
   * Milliseconds between the form mounting and the submission, measured with the
   * client's monotonic `performance.now()` so a skewed wall clock cannot matter.
   */
  elapsed: z.number().int().nonnegative(),
});

/** What the form sends. */
export type AskInput = z.input<typeof askSchema>;
/** What the server works with after trimming and normalising. */
export type AskPayload = z.output<typeof askSchema>;

export type AskField = "body" | "name" | "email";
export type AskFieldErrors = Partial<Record<AskField, string[]>>;

const visibleFields: readonly AskField[] = ["body", "name", "email"];

export type AskParseResult =
  | { success: true; data: AskPayload }
  | { success: false; fieldErrors: AskFieldErrors };

/**
 * Validates a submission. Errors on the hidden fields (`website`, `elapsed`) are not
 * reported per field; they surface as an empty `fieldErrors` object, which the
 * caller turns into a generic "reload and try again" message.
 */
export function parseAskInput(input: unknown): AskParseResult {
  const result = askSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data };

  const flattened = z.flattenError(result.error).fieldErrors;
  const fieldErrors: AskFieldErrors = {};
  for (const field of visibleFields) {
    const messages = flattened[field];
    if (messages?.length) fieldErrors[field] = messages;
  }
  return { success: false, fieldErrors };
}
