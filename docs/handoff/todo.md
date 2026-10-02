# Shared to-do (agents and owner)

Last updated: 2026-10-02. One list for every agent working on `portfolio-3d`. Pick the top open item in **Now**, tick it here in the same commit that lands it, and add anything you defer under **Later** with one line of context. Never work on an item another lane holds (see the Lane column).

Rules that apply to every item: [cloud-handoff-2026-09-27.md](cloud-handoff-2026-09-27.md) owner rules, `/home/user/lanes/LANE-BRIEF.md` (when running in the cloud session), signed commits with the two trailers, no em dashes, work on `portfolio-3d` only (the only exception so far was the Press 3D identity fix, pushed to `master` at `aad74b8`).

## Now (one at a time, in order)

| Status | #   | Item                                                                                                                                                                                                       | Lane / branch           | State                      |
| :----: | --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------- |
|  [x]   | 1   | Inspect controls (zoom and 360° rotate) plus the review's 8 fixes and the Calibre beat-burst tier drop                                                                                                     | `lane/inspect`          | Done (landed)              |
|  [x]   | 2   | Wave 4 Minimal: M-S4 to M-S8 landed (glyph kit, home, projects, work, now, changelog, ask, resume, owner, 404, lab); deferred items are under Later                                                        | `lane/w4-minimal`       | Done (landed)              |
|  [x]   | 3   | Wave 4 Drawing Set: slices 7 to 9 landed (six tracked views, seven glyph kinds; deferred items are under Follow-ups)                                                                                       | `lane/w4-drawing-set`   | Done (landed)              |
|  [x]   | 4   | Wave 4 Timetable: slices 8 and 9 landed (see Later for deferred items)                                                                                                                                     | `lane/w4-timetable`     | Done (landed)              |
|  [x]   | 5   | Wave 4 Press: P-5 set A and P-6 set B landed (every Appendix F §6 element has a tracked view; deferred items are under Follow-ups)                                                                         | `lane/w4-press`         | Done (landed)              |
|  [ ]   | 6   | Wave 4 Surface: slices 7 to 10 (bench refactor and parts library done); last step reached: the home placement edits                                                                                        | `lane/w4-surface`       | In progress                |
|  [ ]   | 7   | Wave 4 Survey: most glyphs done; last step reached: the three React hosts                                                                                                                                  | `lane/w4-survey`        | Paused, has a `wip` commit |
|  [ ]   | 8   | Wire the inspect controls into every edition's big 3D object (hero, model, movement, globe, desk), including Jacquard, Darkroom, Mission and Maquette (Calibre is the pilot)                               | new lane, after 1 lands | Open                       |
|  [ ]   | 9   | Wave 5: each audit appendix §4 motion set, edition doc updates, then the final budget and accessibility pass (Lighthouse on each edition's home and projects, axe, CLS 0 with posters, print hides glyphs) | new lanes per edition   | Open                       |
|  [ ]   | 10  | Repo-wide Prettier pass for the files still flagged by `bunx prettier --check .` (one `style:` commit, after the Wave 4 lanes land)                                                                        | new lane                | Open                       |
|  [ ]   | 11  | Final docs refresh: a dated handoff, refresh `docs/README.md` "last verified" stamps, regenerate `docs/redundancy-inventory.tsv`                                                                           | new lane, last          | Open                       |

Each `wip(<lane>): paused mid-slice, not gated` commit holds work saved when the lane was paused. Finish it, gate it, and turn it into proper commits on that lane branch before reporting.

## Follow-ups from landed work

- [x] **Verification:** DRAFT verification skill and feature map in `.agents/skills/verify` (relative symlink `.claude/skills/verify`), with the one issue ledger in `docs/checks/verification-issues.md`. Written from source on 2026-10-02; nothing has run in a browser and every feature reads `Last live proof: none`.
- [ ] **Verification:** live proof of the eleven editions, scenes, reduced motion, keyboard, identity and CMS fallback is outstanding until the captain supplies the chosen browser skill. First run: confirm the launch and doctor helpers and the baseline gates (ledger WEB-G11 and WEB-G10), then work the ledger's gaps in order.
- [x] **Identity:** Timetable's scene still paints the handle with canvas text (`ctx.fillText`); move it to a DOM overlay or SVG texture. Done: the plate and handle are flap-atlas glyphs now.
- [x] **Dependencies:** combined dependency ship `fm/portfolio-r3f-v10-clock` (`next` 16.3.8, `motion` 13.5.0, `vitest` 5.0.3, `eslint-config-next` 16.3.8, `@types/node` 26.6.4). Done in `541fc61` (merged into `portfolio-3d`).
- [x] **Dependencies:** remove unused direct dependencies `styled-components` and `web-vitals`. Done in `eab0768` (removed from `package.json`).
- [x] **Tooling:** `scripts/generate-signature.ts` wrote to non-existent path. Done in `eab0768` (output directed to `flavors/minimal/components/signature/signature-paths.ts`).
- [x] **Sound:** Press and Timetable synthesized sound palettes. Done in `eab0768` (`flavors/press/lib/sound/voices.ts`, `flavors/timetable/lib/sound/voices.ts`).
- [x] **Performance:** move Zod/T3Env validation to server-only. Done in `eab0768` (`lib/env.server.ts`, `server-only`).
- [x] **Scene / Prefs:** Minimal Customize "3D" row `data-scene` integration. Done: `detectTier()` in `lib/scene/tier.ts:37` reads `document.documentElement.dataset.scene`.
- [x] **Identity:** lab experiment `aria-label`s still say the fallback short name; run them through `personalize` in each edition's `experiment-stage.tsx`.
- [x] **Identity:** add `scripts/check-identity.ts` (fail if the owner's name or handle appears outside `content/fallback`, docs, tests and repo meta) and wire it into `bun run`.
- [ ] **Identity:** a non-owner production build plus a browser smoke test (picker, Minimal, Timetable, one more).
- [x] **Identity:** remove the unused `configuredIdentity` export; fix the stale comments in `components/og/og-card.tsx` and `flavors/surface/lib/sound/voices.ts`.
- [ ] **Pinned edition:** the sitemap, llms.txt and markdown mirrors should list only the pinned edition (`siteFlavor` instead of `DEFAULT_FLAVOR`); `content/site.ts` `only: "drawing-set"` on `/about` is out of date.
- [ ] **Pinned edition:** skip other editions' trees in static generation when pinned (optional).
- [ ] **Haptics:** a hydration-safe attach for switch overlays inside late Suspense boundaries (low).
- [ ] **Drawing Set 3D:** P2 (mini sheet in the register's hover preview), S2 (drawer glyph on `/lab/[slug]`, which has no slot), S1 (view cube; the experiment camera is in the shared lab scene, needs a shared camera handle) and a 3D stamp on every answered thread (the four-view cap allows two) are not built.
- [ ] **Drawing Set 3D:** wire the inspect controls (see `docs/drawing-set.md`: desk and chest, scale, stack).
- [ ] **Drawing Set:** phones lost MSAA under the phone cap; desktop DPR is up to 2 on a full-viewport canvas (owner may want the shared `[1, 1.25]`).
- [ ] **Timetable 3D:** wire the inspect controls (see `docs/timetable.md`: pylon, ticket, turntable, "i" sign, totem).
- [ ] **Timetable 3D:** not built, deferred from Appendix D: slice 7 slot extras (Now clock, Lab beacon, Resume leaflet, Owner padlock, mini flap boards for `ask/[slug]`, feed pages and `lab/[slug]`) and the signal head for `lab/[slug]`; the Work roundel on each guide (only the docked one is built).
- [ ] **Timetable:** T2 DPR dropped from 2 to 1.25; check flap text sharpness on retina.
- [ ] **Survey:** relief redraw after a gazetteer hover (the w4-survey lane has a fix commit pending).
- [ ] **Survey 3D:** Field Survey has no runtime tier step-down (no `PerformanceMonitor` or `SceneMonitor`).
- [ ] **Darkroom:** frame tags can fade out as the page goes idle (possible visible flicker).
- [ ] **Calibre:** hover a card to enlarge the drawn jewel on the no-WebGL poster; crowded jewel tags at 390.
- [ ] **Maquette:** check the filled Ask comment card and thread page with real questions; the resume "drawn by" shows the site URL.
- [ ] **Jacquard:** optional phone-only drawdown so the figure stays short on phones.
- [ ] **Command menu:** Base UI's modal Dialog sets no `aria-modal`; the scroll rule relies on the body lock.
- [ ] **Tooling:** `typescript` is pinned to 6.0.3 on `portfolio-3d` because typescript-eslint 8 rejects TypeScript 7 (issue 10940); `master` still has TS 7 and a red ESLint until this reaches it. Unpin once typescript-eslint supports 7.
- [ ] **Press 3D:** wire the inspect controls (see `docs/press.md`: the press, plates, tins, guillotine, tray, folded sheet, chase, lever).
- [ ] **Press 3D:** the paginated `/ask/page/[page]` pages have no press slot, so no flag board; the books' shelf drag (`PresentationControls`) is left to the inspect controls.
- [ ] **Press 3D:** the thread loupe and corrected sheet were only checked without published queries; check with real threads (answered and not).
- [ ] **Minimal 3D:** L2 glass slide with an ink drop on `/lab`, H3 avatar card on home, and R2's drag along the sheet edge are not built; the clip only wiggles.
- [ ] **Minimal 3D:** wire the inspect controls (see `docs/minimal.md`: A4 sheet, padlock, crumpled page) once the shared lane lands.
- [ ] **Minimal:** `/work` at 390 under reduced motion shifts layout by 0.122 at about 150ms (the timeline's text moves down 20px, likely the font swap), with or without WebGL; find the cause and fix.
- [ ] **Minimal 3D:** the 404 page renders two site headers (the page brings its own, the root layout adds one); fix in the not-found page or layout.
- [ ] **Minimal 3D:** thread glyphs (A2 envelopes, S1 thread, S2 letter) were only checked on the empty feed; check with real questions.
- [ ] **Scene monitor:** Drawing Set and Timetable still duplicate `SceneMonitor` logic in `world.tsx` rather than reusing shared `components/semantic/scene/scene-monitor.tsx` (used by Press only).
- [ ] **Code quality:** 14 em dashes in source (`app/`, `lib/`, `flavors/`, `components/`, `sanity/`) against owner's rule.
- [ ] **Documentation formatting:** CI `bun run fmt:check` fails on docs (`docs/handoff/*`, `docs/redundancy-audit-2026-09-27.md`).
- [ ] **CMS:** Live draft refresh (`DraftModeTools`) is mounted in Minimal layout only (`app/f/minimal/layout.tsx`).

## Needs the owner

- [ ] Seed the new Sanity project (`mfx2gwza`) with the seed script from the cloud session, or allow `*.api.sanity.io` in the environment's network settings so an agent can.
- [ ] Device checks: Safari after clearing the site's HSTS once; iPhone haptics on toggles (iOS 18 or later, System Haptics on); command menu scrolling on iPhone; Timetable, Drawing Set and Survey 3D on a real GPU.
- [ ] Minimal's texture picker stays at None by default (every texture animates forever); say if you want one on.
- [ ] The final gate before merging `portfolio-3d` to `master`.

## Done recently (for context)

Editions Maquette, Flight Plan and Calibre went live; shared dialog, scroll and switch fixes; link hardening; edition e2e and axe coverage; Drawing Set flicker fixes and destination tags; Timetable and Drawing Set on the shared viewport canvas; blit engine fixes and Survey glyphs; iOS switch haptics; identity from the profile with the `NEXT_PUBLIC_OWNER_BRANDING` flag; `NEXT_PUBLIC_FLAVOR` single-edition mode; every Customize option on by default; the Press 3D identity fix.
