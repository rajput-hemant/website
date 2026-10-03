# Shared to-do (agents and owner)

Last updated: 2026-10-02. One list for every agent working on `portfolio-3d`. Pick the top open item in **Now**, tick it here in the same commit that lands it, and add anything you defer under **Later** with one line of context. Never work on an item another lane holds (see the Lane column).

Rules that apply to every item: [cloud-handoff-2026-09-27.md](cloud-handoff-2026-09-27.md) owner rules, `/home/user/lanes/LANE-BRIEF.md` (when running in the cloud session), signed commits with the two trailers, no em dashes, work on `portfolio-3d` only (the only exception so far was the Press 3D identity fix, pushed to `master` at `aad74b8`).

## Now (one at a time, in order)

| #   | Item                                                                                                                                                                                                       | Lane / branch         | State         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------- |
| 1   | Inspect controls (zoom and 360° rotate) plus the review's 8 fixes and the Calibre beat-burst tier drop                                                                                                     | `lane/inspect`        | Done (landed) |
| 2   | Wave 4 Minimal: M-S4 to M-S8 landed (glyph kit, home, projects, work, now, changelog, ask, resume, owner, 404, lab); deferred items are under Later                                                        | `lane/w4-minimal`     | Done (landed) |
| 3   | Wave 4 Drawing Set: slices 7 to 9 landed (six tracked views, seven glyph kinds; deferred items are under Follow-ups)                                                                                       | `lane/w4-drawing-set` | Done (landed) |
| 4   | Wave 4 Timetable: slices 8 and 9 landed (see Later for deferred items)                                                                                                                                     | `lane/w4-timetable`   | Done (landed) |
| 5   | Wave 4 Press: P-5 set A and P-6 set B landed (every Appendix F §6 element has a tracked view; deferred items are under Follow-ups)                                                                         | `lane/w4-press`       | Done (landed) |
| 6   | Wave 4 Surface: slices 7 to 10 landed (bench refactor, 14-part library, all 13 placement pages; deferred items are under Follow-ups)                                                                       | `lane/w4-surface`     | Done (landed) |
| 7   | Wave 4 Survey: slices 9 to 11 landed (blit glyph set P2, J2, W2, N2, K2/E2, R2, O1, L2, H2/A2, T2 grid; deferred items are under Follow-ups)                                                               | `lane/w4-survey`      | Done (landed) |
| 8   | Wire the inspect controls into every edition's big 3D object (hero, model, movement, globe, desk), including Jacquard, Darkroom, Mission and Maquette (Calibre is the pilot)                               | `lane/inspect-wiring` | Done (landed) |
| 9   | Wave 5: each audit appendix §4 motion set, edition doc updates, then the final budget and accessibility pass (Lighthouse on each edition's home and projects, axe, CLS 0 with posters, print hides glyphs) | `lane/final-pass`     | Done (landed) |
| 10  | Repo-wide Prettier pass for the files still flagged by `bunx prettier --check .` (one `style:` commit, after the Wave 4 lanes land)                                                                        | new lane              | Open          |
| 11  | Final docs refresh: a dated handoff, refresh `docs/README.md` "last verified" stamps, regenerate `docs/redundancy-inventory.tsv`                                                                           | new lane, last        | Open          |

Each `wip(<lane>): paused mid-slice, not gated` commit holds work saved when the lane was paused. Finish it, gate it, and turn it into proper commits on that lane branch before reporting.

## Follow-ups from landed work

- [x] **Identity:** Timetable's scene still paints the handle with canvas text (`ctx.fillText`); move it to a DOM overlay or SVG texture. Done: the plate and handle are flap-atlas glyphs now.
- [ ] **Identity:** lab experiment `aria-label`s still say the fallback short name; run them through `personalize` in each edition's `experiment-stage.tsx`.
- [ ] **Identity:** add `scripts/check-identity.ts` (fail if the owner's name or handle appears outside `content/fallback`, docs, tests and repo meta) and wire it into `bun run`.
- [ ] **Identity:** a non-owner production build plus a browser smoke test (picker, Minimal, Timetable, one more).
- [ ] **Identity:** remove the unused `configuredIdentity` export; fix the stale comments in `components/og/og-card.tsx` and `flavors/surface/lib/sound/voices.ts`.
- [ ] **Pinned edition:** the sitemap, llms.txt and markdown mirrors should list only the pinned edition (`siteFlavor` instead of `DEFAULT_FLAVOR`); `content/site.ts` `only: "drawing-set"` on `/about` is out of date.
- [ ] **Pinned edition:** skip other editions' trees in static generation when pinned (optional).
- [ ] **Haptics:** a hydration-safe attach for switch overlays inside late Suspense boundaries (low).
- [ ] **Drawing Set 3D:** P2 (mini sheet in the register's hover preview), S2 (drawer glyph on `/lab/[slug]`, which has no slot), S1 (view cube; the experiment camera is in the shared lab scene, needs a shared camera handle) and a 3D stamp on every answered thread (the four-view cap allows two) are not built.
- [x] **Drawing Set 3D:** inspect controls wired on the desk and the stack (`scale` and `solid` are strips and 32px glyphs, skipped).
- [ ] **Drawing Set:** phones lost MSAA under the phone cap; desktop DPR is up to 2 on a full-viewport canvas (owner may want the shared `[1, 1.25]`).
- [ ] **Timetable 3D:** not built, deferred from Appendix D: slice 7 slot extras (Now clock, Lab beacon, Resume leaflet, Owner padlock, mini flap boards for `ask/[slug]`, feed pages and `lab/[slug]`) and the signal head for `lab/[slug]`; the Work roundel on each guide (only the docked one is built).
- [ ] **Timetable:** T2 DPR dropped from 2 to 1.25; check flap text sharpness on retina.
- [x] **Survey:** relief redraw after a gazetteer hover. Done: the loupe no longer holds the clock's pointer window open (`3b77731`).
- [ ] **Survey 3D:** Field Survey has no runtime tier step-down (no `PerformanceMonitor` or `SceneMonitor`).
- [ ] **Darkroom:** frame tags can fade out as the page goes idle (possible visible flicker).
- [ ] **Calibre:** hover a card to enlarge the drawn jewel on the no-WebGL poster; crowded jewel tags at 390.
- [ ] **Maquette:** check the filled Ask comment card and thread page with real questions; the resume "drawn by" shows the site URL.
- [ ] **Jacquard:** optional phone-only drawdown so the figure stays short on phones.
- [ ] **Command menu:** Base UI's modal Dialog sets no `aria-modal`; the scroll rule relies on the body lock.
- [ ] **Tooling:** `typescript` is pinned to 6.0.3 on `portfolio-3d` because typescript-eslint 8 rejects TypeScript 7 (issue 10940); `master` still has TS 7 and a red ESLint until this reaches it. Unpin once typescript-eslint supports 7.

- [ ] **Surface 3D:** the lab's trim-pot row (audit `/lab` B, decorative) is not built, and `/ask/[slug]` has the 3D answered lamp only on the permalink page (the feed keeps printed lamps).
- [ ] **Surface 3D:** the lab power toggle unmounts the experiment because pausing needs a shared `paused` prop on `ExperimentSceneProps` (`lib/lab/types`); see the proposed patch in `docs/surface.md`.
- [ ] **Surface 3D:** the `/ask/[slug]` and `/ask` instruments were only checked without published questions (no Sanity data): check the queue bar-graph, the send and reply buttons and the thread lamp with real threads.
- [ ] **Press 3D:** the paginated `/ask/page/[page]` pages have no press slot, so no flag board; the books' shelf drag (`PresentationControls`) is left to the inspect controls.
- [ ] **Press 3D:** the thread loupe and corrected sheet were only checked without published queries; check with real threads (answered and not).
- [ ] **Minimal 3D:** L2 glass slide with an ink drop on `/lab`, H3 avatar card on home, and R2's drag along the sheet edge are not built; the clip only wiggles.
- [ ] **Inspect controls, not wired (small slots, need an owner decision):** Minimal (A4 sheet 20 by 28px, padlock 56 by 64px, F1 has its own drag), Timetable (pylon and turntable have their own drag; ticket, "i" sign and totem are under 100px), Press (the hero drag is the peel; the other views are under 200px and `pointer-events-none`), Surface (small instruments with their own gestures and DOM engraving) and Survey (glyphs of 96 to 160px with their own turntable drag). Each edition doc's inspect note says why. Enlarging a host box (or giving the press a modifier turn) would let `sceneInspect`, `inspectGlyph` or a view wrapper take them.
- [x] **Minimal:** `/work` at 390 under reduced motion shifts layout by 0.122 at about 150ms (the timeline's text moves down 20px, likely the font swap), with or without WebGL; find the cause and fix. Done: font stand-ins (`lib/fonts.ts`, `styles.css`).
- [x] **Minimal 3D:** the 404 page renders two site headers (the page brings its own, the root layout adds one); fix in the not-found page or layout. Done: the page no longer renders its own header and footer.
- [ ] **Minimal 3D:** thread glyphs (A2 envelopes, S1 thread, S2 letter) were only checked on the empty feed; check with real questions.

- [ ] **Shared motion:** GSAP ScrollTrigger and its ticker in `components/semantic/motion/smooth-scroll.tsx` keep a raw `requestAnimationFrame` loop running on idle pages (found in the Survey browser pass); check whether the ticker can sleep when nothing scrolls.

- [ ] **Shared scene:** a tracked view that first mounts at 0x0 inside a hidden ancestor may stay blank once shown (found in Timetable's ask validator, worked around there); check `lib/scene/views.ts`.

- [ ] **Shared app:** a dynamic `notFound()` (e.g. `/f/press/projects/zzz`) first renders Next's bare `__next_error__` shell with no layout or stylesheet, then swaps in the edition layout, a CLS of up to 0.036 on every edition (multiple root layouts plus `globalNotFound`).
- [ ] **Final pass leftovers** ([final-pass-2026-10-02.md](final-pass-2026-10-02.md)): Jacquard and Mission's header search chip fails Lighthouse `label-content-name-mismatch` (move the hint out of the button text as the other editions do); Survey's map links have the same mismatch (aria-label is the full sentence); Survey home runs at 3 fps under SwiftShader and three `desktop-survey` cases in `e2e/editions.spec.ts` time out on the button's stability check (check on a real GPU or CI); font-swap CLS residuals up to 0.0057 on Survey and Calibre home at 1440.
- [ ] **Budget:** `bun run budget` fails on `/f/drawing-set/lab/signature-field` (171.1KB) and `/f/surface/lab/signature-field` (171.3KB) against the 170KB ceiling (found 2026-10-03 on the host-runtime lane; pre-existing, no app code changed there).

## Needs the owner

- [ ] Seed the new Sanity project (`mfx2gwza`) with the seed script from the cloud session, or allow `*.api.sanity.io` in the environment's network settings so an agent can.
- [ ] Device checks: Safari after clearing the site's HSTS once; iPhone haptics on toggles (iOS 18 or later, System Haptics on); command menu scrolling on iPhone; Timetable, Drawing Set and Survey 3D on a real GPU.
- [ ] Minimal's texture picker stays at None by default (every texture animates forever); say if you want one on.
- [ ] The final gate before merging `portfolio-3d` to `master`.

## Done recently (for context)

Editions Maquette, Flight Plan and Calibre went live; shared dialog, scroll and switch fixes; link hardening; edition e2e and axe coverage; Drawing Set flicker fixes and destination tags; Timetable and Drawing Set on the shared viewport canvas; blit engine fixes and Survey glyphs; iOS switch haptics; identity from the profile with the `NEXT_PUBLIC_OWNER_BRANDING` flag; `NEXT_PUBLIC_FLAVOR` single-edition mode; every Customize option on by default; the Press 3D identity fix.
