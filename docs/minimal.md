# Minimal

The default edition (`flavors/minimal`, `app/f/minimal`). Its design law is `architecture.md` (text first; interaction is a thin layer of small, precise moments). This page holds what is specific to Minimal's 3D, motion and sound. Last verified 2026-10-02.

## 3D: ink on paper glyphs

Wave 4 adds small in-page objects ("glyphs") beside the text they belong to. They are decoration: every glyph box is `aria-hidden` and `data-decorative` (hidden in print), canvas text is banned (numerals and labels stay in the DOM), and each glyph keeps an SVG or CSS poster that is also the no-WebGL, reduced-tier and first-paint state, so layout shifts stay at 0.

- **Look.** Paper-coloured fills with ink feature edges at 0.55 opacity, accent only on what is hovered or active. No lights, shadows, `Float` or cursor changes. The kit is `components/scene/kit.tsx` (`Ink` instanced parts, `Sheet` bendable paper, `Wire` strokes, the pixel camera where one unit is one CSS pixel).
- **Rendering.** One shared viewport canvas per page (`lib/scene/session.tsx`, z-5, never takes pointer events). Each page has one **lead** glyph (view 0; its `<Glyph lead>` carries the loader, so the scene chunk is fetched only once it nears the viewport after load and idle) and up to three placeholders (`data-scene-view`), within the shared four-view budget. `lib/scene/glyphs.ts` lists each route's lead and views; `scene.test.ts` checks the budget and unique ids. Development warns past 16 draw calls or 5k triangles.
- **Input** is the glyph's own: hover and focus come from `data-scene-item` (the shared DOM contract), disclosures from `toggle`, scroll from `data-scene-section`. A drag (the 404 page) listens on its own box, which then takes pointer events (`input`).
- **Idle.** Every glyph steps damped poses on the shared clock and returns whether it still moves, so an idle page draws 0 frames.
- **Tiers and motion.** Hover tilts and pointer-driven motion run at tier 2 only. Reduced motion is gentler, not zero: springs settle three times faster and tilts are off. Tier 0 (`scene: off`, no WebGL, context loss) shows posters only.

| Route                  | Glyphs (lead first)                                                                                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                    | desk clock at the owner's local time (H2); index cards on the selected rows (H1)                                                                                              |
| `/work`                | tenure ream (W1); rail beads (W2); folders for Skills and Education (W3)                                                                                                      |
| `/projects`            | card fan counter (P2); index cards per group (P1)                                                                                                                             |
| `/now`                 | tear-off pad that thins with the page's age (N1); paper index tabs in the numeral margin (N2)                                                                                 |
| `/changelog`           | paper roll at the open year (C2, first three years live); ledger spines in the sticky year index (C1)                                                                         |
| `/ask`                 | paper plane on `ask:sent` (A1); envelope per thread row (A2)                                                                                                                  |
| `/ask/[slug]`          | opened letter by the heading (S2); sagging reply thread (S1)                                                                                                                  |
| `/resume`              | A4 sheet beside Print: curls on hover, flattens on press (R1); paper clip on the header (R2)                                                                                  |
| `/owner`               | padlock: opens on sign-in, shakes on a wrong passphrase (O1); key tag that swings on field focus (O2)                                                                         |
| 404                    | crumpled page you drag flat (F1); dog-ear that folds with the suggestions (F2)                                                                                                |
| `/lab`                 | live poster: the signature-field particles at a fraction of the count over the poster while the row is hovered or focused, paused on leave, tier 2 and fine pointer only (L1) |
| `/lab/signature-field` | ink bottle accent control (X1) and a side view of the field (X2), see below                                                                                                   |

Owner sign-in tells the padlock through a `window` event (`OWNER_EVENT`, `open` or `shake`) and a `data-owner-open` marker on the signed-in panel, so a page that loads already signed in shows the lock open.

### Lab stage extras (X1, X2)

The stage is the shared `CanvasStage` (`components/semantic/lab/canvas-stage.tsx`), one canvas for the route. Its optional `passes` prop makes it draw the main scene itself at render priority 0.5 (R3F stops auto-rendering once anything subscribes above 0), and `overlay` puts DOM over the canvas. Minimal's `stage-views.tsx` adds two scissored passes over the same canvas, no second context:

- **X1, the ink bottle.** Its own small scene and camera, drawn into the box of `[data-ink-bottle]`. The box is a real `role="slider"` (arrows, Home, End, and a vertical drag of 26px per step) that steps the accent through `accentPresets` with `setPrefs`; the field recolours live through `useAccent`.
- **X2, the side inset.** The same scene (the same geometry and material) through an orthographic camera into `[data-stage-inset]`, 18° off edge-on; dragging sideways turns it up to 60° either way.

Deviation from the audit: drei `View` was tried first, but a View's `makeDefault` camera replaces the stage's own camera in R3F (the particle layout then reads the wrong viewport), so both are plain scissor passes. The `eventSource` change the slice named is therefore not needed and was not made.

### Zoom and rotate (inspect controls), reviewed and not wired

`lib/scene/inspect.ts` (recipe in `m2-scene-spec.md`, "Inspect controls") is for an object people would turn over. Minimal's candidates were reviewed and none is wired yet, because no slot is big enough to carry a drag, a zoom and a hint:

- **R1 A4 sheet** (a 20 by 28px glyph beside Print) and **O1 padlock** (56 by 64px beside the sign-in form): too small to turn or zoom, and a zoomed copy would be clipped by the glyph's own box. They would need a larger host box (a layout change on `/resume` and `/owner`) and a pose on each glyph's root matrix (`place(root, ...)`) before `sceneInspect` could take them.
- **F1 crumpled page** (64px on the 404): it already has its own drag (flick or tap into the bin), so inspect would replace it; left alone.
- The lab stage's **X2 inset** already turns on drag.
- No: clock, cards, fan, tenure, beads, folders, pad, tabs, spines, roll, plane, envelopes, letter, thread, clip, key tag, dog-ear, ink bottle, live poster. They are list marks or strips.

## Sound

Paper and nib voices: see `architecture.md` section 4. The paper plane's flight starts in the same frame as the `sent` voice; the padlock's open uses `sent` and the shake uses `knock`.
