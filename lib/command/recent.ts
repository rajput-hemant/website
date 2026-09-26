/** Ids of the entries last opened from the menu, newest first, kept per browser. */
export const RECENT_KEY = "hr.command.recent";
const MAX_RECENT = 8;

/** Reading `localStorage` itself throws when site data is blocked. */
function resolve(storage?: Storage): Storage | undefined {
  try {
    return storage ?? globalThis.localStorage;
  } catch {
    return undefined;
  }
}

export function readRecent(storage?: Storage): string[] {
  try {
    const raw = resolve(storage)?.getItem(RECENT_KEY);
    const parsed: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

/** Moves `id` to the front and returns the new list. */
export function pushRecent(id: string, storage?: Storage): string[] {
  const next = [id, ...readRecent(storage).filter((item) => item !== id)].slice(
    0,
    MAX_RECENT
  );
  try {
    resolve(storage)?.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // Quota or private mode: recents then last only for this visit.
  }
  return next;
}
