const PREFIX = "se-";

/**
 * A `view-transition-name` for one identity, e.g. `sharedElementName("lab", slug)`.
 * Names must be unique on the page and valid CSS identifiers. Kept out of
 * shared-element.tsx so Server Components can call it.
 */
export function sharedElementName(kind: string, id?: string): string {
  const raw = id === undefined ? kind : `${kind}-${id}`;
  return `${PREFIX}${raw.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
}

/** Whether `name` came from `sharedElementName`; only those names morph. */
export function isSharedElementName(name: string): boolean {
  return name.startsWith(PREFIX);
}
