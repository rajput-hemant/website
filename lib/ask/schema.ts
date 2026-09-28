import { z } from "zod";

import { askConfig } from "./config";
import {
  askFieldLimits,
  askFieldMessages,
  type AskField,
  type AskFieldErrors,
} from "./fields";

/**
 * The server's full validation. Server-only in practice: it pulls in zod, so
 * client code imports `fields.ts` (same limits and messages) instead.
 */

export { askFieldLimits, type AskField, type AskFieldErrors };

const { fields } = askConfig;

const emptyToUndefined = (value: string | undefined) =>
  value === undefined || value === "" ? undefined : value;

export const askSchema = z.object({
  body: z
    .string({ error: askFieldMessages.bodyMissing })
    .trim()
    .min(askFieldLimits.body.min, askFieldMessages.bodyShort)
    .max(askFieldLimits.body.max, askFieldMessages.bodyLong),
  name: z
    .string()
    .trim()
    .max(askFieldLimits.name.max, askFieldMessages.nameLong)
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

/** What a composer sends, for new threads and replies alike. */
export type AskInput = z.input<typeof askSchema>;
/** What the server works with after trimming and normalising. */
export type AskPayload = z.output<typeof askSchema>;

const visibleFields: readonly AskField[] = ["body", "name"];

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
