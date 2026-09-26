# Signature

`<Signature />` draws the handwritten "Hemant" stroke by stroke. The strokes live in `signature-paths.ts`, which `bun run signature` generates from the hand-traced pen points in `scripts/generate-signature.ts`.

## Using your real signature

1. Sign in any drawing app that exports SVG with a pen or pencil tool (Figma, Procreate, Illustrator, Inkscape). Use **single-line strokes**, not filled shapes or outlined text. One path per pen stroke, in the order you write them.
2. Export the SVG and copy each `<path d="…">` value.
3. Replace the contents of `signature-paths.ts` (and stop running `bun run signature`, which would overwrite it):
   - `SIGNATURE_VIEWBOX`: the exported SVG's `viewBox` width and height. Its origin must be `0 0`.
   - `signatureStrokes`: one `{ d, duration, pause }` per stroke. `duration` is the time in ms the pen takes (keep it proportional to the stroke's length); `pause` is the ms the pen is lifted before the stroke. Aim for 1.6–2.4 s in total.

Alternatively, edit the `points` in `scripts/generate-signature.ts` and rerun `bun run signature`: it smooths them into Béziers and times the strokes for you.

## Play modes

`play="in-view"` (default) writes the signature once as it scrolls into view. `play="hover"` shows it drawn and writes it again on hover or click. `play="intro"` (home) writes it in CSS with the first paint, squeezed to about 760ms by `strokeTimeline` in `lib/signature/timing.ts`. It plays once per load and never after a client navigation, with motion off, without JavaScript or in print. After that it behaves like `hover`.
