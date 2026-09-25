import { askConfig } from "./config";

// 64 symbols, so masking a random byte with 63 keeps every symbol equally likely.
const ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** A random URL-safe id, used as the permalink of a submission. */
export function createSlug(length: number = askConfig.slugLength): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let slug = "";
  for (const byte of bytes) slug += ALPHABET[byte & 63];
  return slug;
}
