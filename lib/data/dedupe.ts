import { naturalKeyOf, type DuplicateType } from "./natural-keys";
import type { NaturalKeyFields } from "./natural-keys";

type Document = NaturalKeyFields & { _id: string };

/** Seeded documents use `<type>-<id>`; Studio-created copies get random ids. */
const isSeedOwned = (type: DuplicateType, id: string) =>
  id.startsWith(`${type}-`);

/**
 * Drops extra copies of the same content (for example a hand-entered twin of
 * a seeded entry), so one stray document can't render twice or collide on an
 * anchor or view-transition name. The seeded copy wins, else the first one;
 * the survivor keeps the position of the group's first copy. `bun run doctor
 * --fix` removes the extra documents from the dataset itself.
 */
export function dedupeDocuments<T extends Document>(
  type: DuplicateType,
  documents: readonly T[],
  onDuplicate: (dropped: string[]) => void = warnDuplicates(type)
): T[] {
  const kept = new Map<string, number>();
  const result: T[] = [];
  const dropped: string[] = [];
  for (const doc of documents) {
    const key = naturalKeyOf(type, doc);
    const index = key === null ? undefined : kept.get(key);
    if (key === null || index === undefined) {
      if (key !== null) kept.set(key, result.length);
      result.push(doc);
      continue;
    }
    const current = result[index];
    if (
      current &&
      !isSeedOwned(type, current._id) &&
      isSeedOwned(type, doc._id)
    ) {
      dropped.push(current._id);
      result[index] = doc;
    } else {
      dropped.push(doc._id);
    }
  }
  if (dropped.length > 0) onDuplicate(dropped);
  return result;
}

function warnDuplicates(type: DuplicateType) {
  return (dropped: string[]) => {
    console.warn(
      `[content] Ignoring ${dropped.length} duplicate ${type} document(s): ${dropped.join(", ")}. Run \`bun run doctor --fix\` to remove them from the dataset.`
    );
  };
}
