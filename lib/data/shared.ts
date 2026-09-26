import type { RichText } from "./types";

/** Seeded documents use `<type>-<id>` ids; strip that so domain ids match the fallback content. */
export function toDomainId(sanityId: string, type: string): string {
  return sanityId.replace(/^drafts\./, "").replace(new RegExp(`^${type}-`), "");
}

/**
 * Generated Portable Text types differ cosmetically from `@portabletext/react`'s
 * (optional span text); the schema restricts content to what the renderer handles.
 */
export function toRichText(value: unknown): RichText {
  return Array.isArray(value) ? (value as RichText) : [];
}

export function optional<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}
