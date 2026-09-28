/**
 * Surface's bench: the shared blit-glyph engine (`lib/scene/blit.ts`) under
 * the names Surface's instruments use. An instrument is a glyph; the bench
 * appends its canvas to the instrument's slot.
 */
export { createBlit as createBench, glRenderer } from "@/lib/scene/blit";
export type {
  BlitRenderer as BenchRenderer,
  Glyph as Instrument,
  GlyphOptions as BenchOptions,
} from "@/lib/scene/blit";
