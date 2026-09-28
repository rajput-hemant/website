import { createBlit, glRenderer } from "@/lib/scene/blit";

/**
 * Survey's blit glyphs (`lib/scene/blit.ts`, slice S3): one engine, so one
 * off-screen renderer, for every glyph on the page. The relief keeps its own
 * session canvas; glyphs never draw into it.
 */
export const glyphs = createBlit(glRenderer);
