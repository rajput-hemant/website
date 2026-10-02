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

## Motion

Wave 5 (audit Appendix A, section 4). The edition's vocabulary stays CSS and WAAPI on the tokens in `styles.css` (`--ease-enter`, `--ease-exit`, `--duration-enter` 220ms, `--duration-exit` 160ms); no new dependency. Reduced motion is gentler, not zero: the global rule keeps only opacity and colour transitions, and `[data-motion-safe]` marks the few keyframe fades that survive it. Idle pages run no animation (the busy spinner only spins while busy, and the scroll-linked index is driven by scrolling).

| Audit #       | Where                                                                                        | What it does                                                                                                                                                                                                                            | Reduced motion                   |
| ------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| 1             | Ask "sent" note (`ask/chat-composer.tsx`, `ask/ask.module.css`)                              | Rises 4px and fades in over the enter token, 80ms behind the paper plane                                                                                                                                                                | Opacity fade, exit token, linear |
| 2             | Pending bubble (`ask/chat-bubble.tsx`)                                                       | Settles in from its bottom-right corner (6px, scale .98)                                                                                                                                                                                | Opacity fade                     |
| 3             | Busy buttons (`ui/busy-swap.tsx`): Send, Sign in, Sign out, moderation actions, message menu | Label and spinner share one grid cell, so the button keeps its width; blur and scale swap                                                                                                                                               | Opacity cross-fade only          |
| 4             | Filtered project rows (`projects/project-list.module.css`)                                   | Rows collapse (opacity and block size) over the exit token and return over the enter token, with `display` as an allow-discrete transition. Gated on `data-filtering`, set after the filter's first pass, so page load animates nothing | Rows hide and return at once     |
| 5             | `/lab` poster                                                                                | Scales to 1.015 on row hover (hover devices only)                                                                                                                                                                                       | None                             |
| 6             | Lab stage hand-off                                                                           | Already 400ms on `ease-enter`                                                                                                                                                                                                           | n/a                              |
| 7             | Token drift                                                                                  | Every bare `transition-colors` now carries `duration-(--duration-exit)`; the cursor ease was already on the token                                                                                                                       | Unchanged                        |
| 7 (changelog) | Sticky year index (`changelog/year-index.module.css`)                                        | Each year section is a named view timeline (`timeline-scope` on the page); its index link animates a registered `--on` property, which lights the bar (and scales it from .6) and the count while the year is mid-viewport              | Colour only, no scale            |

Not done: the audit's "rejected" list stays rejected (status pulse, cmdk animation, sliding filter pill, parallax, signature replay). The lab poster scale does not move the live glyph above it (a transform on the glyph's box would misalign the shared canvas), so it applies to the static poster only.

### Layout shift on font swap

Bricolage and Martian Mono are not preloaded (the font budget), so they swap in. next/font's generated fallback is off (`adjustFontFallback: false` in `lib/fonts.ts`) because it needs `local(Arial)` and sizes Martian Mono as if it were proportional, so uppercase meta labels changed width by about half on swap and `/work` at 390 shifted 0.122. `styles.css` declares metric-matched stand-ins instead (`Bricolage Sans Stand-in`, `Fraunces Stand-in`, `Martian Stand-in`, over Liberation, Arimo, Courier-metric and the usual system names); the mono one is measured against Martian's fixed advance (0.65em at the meta width). With the fonts delayed by 1.2s, `/work` at 390 went from 0.046 to 0.003. A paragraph near a wrap boundary can still reflow by a line (`/lab` at 1440, 0.004).

## Sound

Paper and nib voices: see `architecture.md` section 4. The paper plane's flight starts in the same frame as the `sent` voice; the padlock's open uses `sent` and the shake uses `knock`.
