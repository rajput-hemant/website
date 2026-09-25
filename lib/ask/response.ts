import { type AskFieldErrors } from "./schema";

/** JSON bodies returned by `POST /api/ask`. Safe to import from client code. */
export type AskSuccessResponse = { ok: true; slug: string };

export type AskErrorResponse = {
  ok: false;
  message: string;
  /** Present on 400 responses caused by a visible field. */
  fieldErrors?: AskFieldErrors;
};

export type AskResponse = AskSuccessResponse | AskErrorResponse;

export const askMessages = {
  invalid: "Please check the highlighted fields.",
  malformed:
    "Something about that request was off. Reload the page and try again.",
  expired:
    "This form has been open for a long time. Reload the page and try again.",
  tooLarge: "That message is too long to send.",
  openThread:
    "You already have an open question. You can ask another once it's answered or after 7 days.",
  cooldown:
    "Your last question was answered recently. You can ask another 24 hours after the answer.",
  dailyCap:
    "Too many messages have come from your connection today. Please try again tomorrow.",
  unsupported: "This endpoint only accepts JSON from this site.",
  circuitOpen: "Not accepting new messages right now",
  notConfigured: "The inbox isn't connected yet",
  failed: "Something went wrong while sending. Please try again later.",
} as const;
