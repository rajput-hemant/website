/**
 * Pure duplicate detection for `scripts/find-duplicates.ts`: groups content
 * documents by the fields that make them "the same thing" to a reader, and
 * decides which copy of each group stays.
 */
import {
  DUPLICATE_TYPES,
  isDuplicateType,
  naturalKeyOf,
  type DuplicateType,
} from "@/lib/data/natural-keys";

export { DUPLICATE_TYPES, type DuplicateType };

/** The projected fields the natural keys read, as fetched with the raw perspective. */
export type ContentDocument = {
  _id: string;
  _type: string;
  _updatedAt: string;
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

/** The key a document is grouped by, or `null` when its type isn't checked or a key field is empty. */
export function naturalKey(doc: ContentDocument): string | null {
  return isDuplicateType(doc._type) ? naturalKeyOf(doc._type, doc) : null;
}

/** Seed ids are `<type>-<id>`, matching `docId` in `scripts/seed.ts`. */
export function seedDocId(type: DuplicateType, id: string): string {
  return `${type}-${id}`;
}

type SeedContent = {
  education: readonly { id: string }[];
  experience: readonly { id: string }[];
  projects: readonly { id: string }[];
  skills: readonly { id: string }[];
  changelog: readonly { id: string }[];
};

/** Every document id `scripts/seed.ts` writes for the checked types. */
export function seedOwnedIds(content: SeedContent): Set<string> {
  const sources: [DuplicateType, readonly { id: string }[]][] = [
    ["education", content.education],
    ["experience", content.experience],
    ["project", content.projects],
    ["skillGroup", content.skills],
    ["update", content.changelog],
  ];
  return new Set(
    sources.flatMap(([type, items]) =>
      items.map((item) => seedDocId(type, item.id))
    )
  );
}

const DRAFT_PREFIX = "drafts.";

export const publishedId = (id: string) =>
  id.startsWith(DRAFT_PREFIX) ? id.slice(DRAFT_PREFIX.length) : id;

export type DuplicateCopy = {
  /** Published id; a draft-only document is listed under the id it would publish to. */
  id: string;
  updatedAt: string;
  seedOwned: boolean;
  /** The ids to delete to remove this copy: the published document and/or its draft. */
  documentIds: string[];
};

export type DuplicateGroup = {
  type: DuplicateType;
  key: string;
  keep: DuplicateCopy[];
  remove: DuplicateCopy[];
};

/**
 * Collapses a document and its draft into one copy. The published version
 * supplies the key; a draft-only document is keyed by its draft.
 */
function toCopies(
  documents: readonly ContentDocument[],
  seedIds: ReadonlySet<string>
) {
  const byId = new Map<string, { doc: ContentDocument; copy: DuplicateCopy }>();
  for (const doc of documents) {
    const id = publishedId(doc._id);
    const isDraft = id !== doc._id;
    const existing = byId.get(id);
    if (!existing) {
      byId.set(id, {
        doc,
        copy: {
          id,
          updatedAt: doc._updatedAt,
          seedOwned: seedIds.has(id),
          documentIds: [doc._id],
        },
      });
      continue;
    }
    existing.copy.documentIds.push(doc._id);
    if (doc._updatedAt > existing.copy.updatedAt)
      existing.copy.updatedAt = doc._updatedAt;
    if (!isDraft) existing.doc = doc;
  }
  return [...byId.values()];
}

/**
 * Seed-owned copies always stay (Studio edits to them are kept). When no copy
 * is seed-owned, the most recently updated one stays.
 */
function splitGroup(
  copies: DuplicateCopy[]
): Pick<DuplicateGroup, "keep" | "remove"> {
  const seeded = copies.filter((copy) => copy.seedOwned);
  if (seeded.length > 0) {
    return { keep: seeded, remove: copies.filter((copy) => !copy.seedOwned) };
  }
  const [newest, ...rest] = copies.toSorted((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );
  return { keep: newest ? [newest] : [], remove: rest };
}

/** Groups with more than one copy, in type order, then by key. */
export function findDuplicateGroups(
  documents: readonly ContentDocument[],
  seedIds: ReadonlySet<string>
): DuplicateGroup[] {
  const groups = new Map<
    string,
    { type: DuplicateType; key: string; copies: DuplicateCopy[] }
  >();
  for (const { doc, copy } of toCopies(documents, seedIds)) {
    const key = naturalKey(doc);
    if (key === null || !isDuplicateType(doc._type)) continue;
    const groupId = `${doc._type}\u0000${key}`;
    const group = groups.get(groupId);
    if (group) group.copies.push(copy);
    else groups.set(groupId, { type: doc._type, key, copies: [copy] });
  }
  return [...groups.values()]
    .filter((group) => group.copies.length > 1)
    .toSorted(
      (a, b) =>
        DUPLICATE_TYPES.indexOf(a.type) - DUPLICATE_TYPES.indexOf(b.type) ||
        a.key.localeCompare(b.key)
    )
    .map(({ type, key, copies }) => ({ type, key, ...splitGroup(copies) }));
}

/** Every document id (published and draft) the fix deletes. */
export function idsToDelete(groups: readonly DuplicateGroup[]): string[] {
  return groups.flatMap((group) =>
    group.remove.flatMap((copy) => copy.documentIds)
  );
}

/** A plain-text report, one block per group. */
export function formatDuplicateReport(
  groups: readonly DuplicateGroup[]
): string {
  if (groups.length === 0) return "No duplicate content documents.";
  const width = Math.max(
    ...groups.flatMap((group) =>
      [...group.keep, ...group.remove].map((copy) => copy.id.length)
    )
  );
  const line = (action: "keep" | "remove", copy: DuplicateCopy) => {
    const notes = [
      copy.seedOwned ? "seed" : "",
      copy.documentIds.some((id) => id !== copy.id) ? "has draft" : "",
    ].filter(Boolean);
    return `  ${action.padEnd(6)}  ${copy.id.padEnd(width)}  updated ${copy.updatedAt}${
      notes.length > 0 ? `  (${notes.join(", ")})` : ""
    }`;
  };
  return groups
    .map((group) =>
      [
        `${group.type}: ${group.key}`,
        ...group.keep.map((copy) => line("keep", copy)),
        ...group.remove.map((copy) => line("remove", copy)),
      ].join("\n")
    )
    .join("\n\n");
}
