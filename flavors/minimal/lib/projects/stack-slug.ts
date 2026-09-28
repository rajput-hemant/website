/**
 * A stack name as it appears in the /projects filter hash: `Next.js` → `next`,
 * `Tailwind CSS` → `tailwind-css`. Short enough to type by hand.
 */
export function stackSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\.js$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
