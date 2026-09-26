import { normalizeName } from "@/lib/normalize";

/**
 * The fields that make two content documents "the same thing" to a reader.
 * Shared by the data layer, which drops stray copies at build time, and the
 * content doctor, which deletes them from the dataset.
 */
export const DUPLICATE_TYPES = [
  "education",
  "experience",
  "project",
  "skillGroup",
  "update",
] as const;

export type DuplicateType = (typeof DUPLICATE_TYPES)[number];

export type NaturalKeyFields = {
  institution?: string | null;
  degree?: string | null;
  endYear?: number | null;
  company?: string | null;
  startDate?: string | null;
  slug?: string | null;
  title?: string | null;
  date?: string | null;
  text?: string | null;
};

type KeyPart = string | number | null | undefined;

/** Free text compares loosely; dates, slugs and years compare exactly. */
const loose = (value: string | null | undefined) =>
  value ? normalizeName(value) : value;

function joinKey(parts: readonly KeyPart[]): string | null {
  if (
    parts.some((part) => part === null || part === undefined || part === "")
  ) {
    return null;
  }
  return parts.join(" | ");
}

const naturalKeys: Record<
  DuplicateType,
  (fields: NaturalKeyFields) => string | null
> = {
  education: (doc) =>
    joinKey([loose(doc.institution), loose(doc.degree), doc.endYear]),
  experience: (doc) => joinKey([loose(doc.company), doc.startDate]),
  project: (doc) => joinKey([doc.slug]),
  skillGroup: (doc) => joinKey([loose(doc.title)]),
  update: (doc) => joinKey([doc.date, loose(doc.text)]),
};

export function isDuplicateType(type: string): type is DuplicateType {
  return (DUPLICATE_TYPES as readonly string[]).includes(type);
}

/** The key a document is grouped by, or `null` when a key field is empty. */
export function naturalKeyOf(
  type: DuplicateType,
  fields: NaturalKeyFields
): string | null {
  return naturalKeys[type](fields);
}
