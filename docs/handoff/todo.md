# Shared to-do (agents and owner)

Last updated: 2026-10-02. One list for every agent working on `portfolio-3d`. Pick the top open item in **Now**, tick it here in the same commit that lands it, and add anything you defer under **Later** with one line of context. Never work on an item another lane holds (see the Lane column).

Rules that apply to every item: [cloud-handoff-2026-09-27.md](cloud-handoff-2026-09-27.md) owner rules, `/home/user/lanes/LANE-BRIEF.md` (when running in the cloud session), signed commits with the two trailers, no em dashes, work on `portfolio-3d` only (the only exception so far was the Press 3D identity fix, pushed to `master` at `aad74b8`).

## Now (one at a time, in order)

| #   | Item                                                                                                                                                                                                       | Lane / branch           | State                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------- |
| 1   | Inspect controls (zoom and 360° rotate) plus the review's 8 fixes and the Calibre beat-burst tier drop                                                                                                     | `lane/inspect`          | Done (landed)              |
| 2   | Wave 4 Minimal: finish M-S6 to M-S8 (Now, Changelog, Ask, Resume, Owner, 404, Lab glyphs); last step reached: wiring the Now, Changelog and Ask DOM                                                        | `lane/w4-minimal`       | In progress                |
| 3   | Wave 4 Drawing Set: slices 7 to 9 (leftover fixes are done); last step reached: rewriting each view as a factory                                                                                           | `lane/w4-drawing-set`   | Paused, has a `wip` commit |
| 4   | Wave 4 Timetable: finish slices 8 and 9; last step reached: wiring the DOM placements                                                                                                                      | `lane/w4-timetable`     | Paused, has a `wip` commit |
| 5   | Wave 4 Press: P-5 set A done, P-6 set B left; last step reached: the smoke and measure script                                                                                                              | `lane/w4-press`         | Paused, has a `wip` commit |
| 6   | Wave 4 Surface: slices 7 to 10 (bench refactor and parts library done); last step reached: the home placement edits                                                                                        | `lane/w4-surface`       | Paused, has a `wip` commit |
| 7   | Wave 4 Survey: most glyphs done; last step reached: the three React hosts                                                                                                                                  | `lane/w4-survey`        | Paused, has a `wip` commit |
| 8   | Wire the inspect controls into every edition's big 3D object (hero, model, movement, globe, desk), including Jacquard, Darkroom, Mission and Maquette (Calibre is the pilot)                               | new lane, after 1 lands | Open                       |
| 9   | Wave 5: each audit appendix §4 motion set, edition doc updates, then the final budget and accessibility pass (Lighthouse on each edition's home and projects, axe, CLS 0 with posters, print hides glyphs) | new lanes per edition   | Open                       |
| 10  | Repo-wide Prettier pass for the files still flagged by `bunx prettier --check .` (one `style:` commit, after the Wave 4 lanes land)                                                                        | new lane                | Open                       |
| 11  | Final docs refresh: a dated handoff, refresh `docs/README.md` "last verified" stamps, regenerate `docs/redundancy-inventory.tsv`                                                                           | new lane, last          | Open                       |

Each `wip(<lane>): paused mid-slice, not gated` commit holds work saved when the lane was paused. Finish it, gate it, and turn it into proper commits on that lane branch before reporting.

## Follow-ups from landed work

- [ ] **Identity:** Timetable's scene still paints the handle with canvas text (`ctx.fillText`); move it to a DOM overlay or SVG texture.
- [ ] **Identity:** lab experiment `aria-label`s still say the fallback short name; run them through `personalize` in each edition's `experiment-stage.tsx`.
- [ ] **Identity:** add `scripts/check-identity.ts` (fail if the owner's name or handle appears outside `content/fallback`, docs, tests and repo meta) and wire it into `bun run`.
- [ ] **Identity:** a non-owner production build plus a browser smoke test (picker, Minimal, Timetable, one more).
- [ ] **Identity:** remove the unused `configuredIdentity` export; fix the stale comments in `components/og/og-card.tsx` and `flavors/surface/lib/sound/voices.ts`.
- [ ] **Pinned edition:** the sitemap, llms.txt and markdown mirrors should list only the pinned edition (`siteFlavor` instead of `DEFAULT_FLAVOR`); `content/site.ts` `only: "drawing-set"` on `/about` is out of date.
- [ ] **Pinned edition:** skip other editions' trees in static generation when pinned (optional).
- [ ] **Haptics:** a hydration-safe attach for switch overlays inside late Suspense boundaries (low).
- [ ] **Drawing Set:** phones lost MSAA under the phone cap; desktop DPR is up to 2 on a full-viewport canvas (owner may want the shared `[1, 1.25]`).
- [ ] **Timetable:** T2 DPR dropped from 2 to 1.25; check flap text sharpness on retina.
- [ ] **Survey:** relief redraw after a gazetteer hover (the w4-survey lane has a fix commit pending).
- [ ] **Darkroom:** frame tags can fade out as the page goes idle (possible visible flicker).
- [ ] **Calibre:** hover a card to enlarge the drawn jewel on the no-WebGL poster; crowded jewel tags at 390.
- [ ] **Maquette:** check the filled Ask comment card and thread page with real questions; the resume "drawn by" shows the site URL.
- [ ] **Jacquard:** optional phone-only drawdown so the figure stays short on phones.
- [ ] **Command menu:** Base UI's modal Dialog sets no `aria-modal`; the scroll rule relies on the body lock.
- [ ] **Tooling:** `typescript` is pinned to 6.0.3 on `portfolio-3d` because typescript-eslint 8 rejects TypeScript 7 (issue 10940); `master` still has TS 7 and a red ESLint until this reaches it. Unpin once typescript-eslint supports 7.

## Needs the owner

- [ ] Seed the new Sanity project (`mfx2gwza`) with the seed script from the cloud session, or allow `*.api.sanity.io` in the environment's network settings so an agent can.
- [ ] Device checks: Safari after clearing the site's HSTS once; iPhone haptics on toggles (iOS 18 or later, System Haptics on); command menu scrolling on iPhone; Timetable, Drawing Set and Survey 3D on a real GPU.
- [ ] Minimal's texture picker stays at None by default (every texture animates forever); say if you want one on.
- [ ] The final gate before merging `portfolio-3d` to `master`.

## Done recently (for context)

Editions Maquette, Flight Plan and Calibre went live; shared dialog, scroll and switch fixes; link hardening; edition e2e and axe coverage; Drawing Set flicker fixes and destination tags; Timetable and Drawing Set on the shared viewport canvas; blit engine fixes and Survey glyphs; iOS switch haptics; identity from the profile with the `NEXT_PUBLIC_OWNER_BRANDING` flag; `NEXT_PUBLIC_FLAVOR` single-edition mode; every Customize option on by default; the Press 3D identity fix.
