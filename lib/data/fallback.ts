/**
 * The only data-layer import of the bundled bootstrap content. Sanity is the
 * source of truth; this exists for running without a Sanity project and can be
 * deleted (with content/fallback) once that is no longer needed.
 */
import * as content from "@/content/fallback";

let warned = false;

export function getFallbackContent(): typeof content {
  if (!warned) {
    warned = true;
    console.warn(
      "[data] Sanity not configured — rendering bundled fallback content (see docs/sanity.md)"
    );
  }
  return content;
}
