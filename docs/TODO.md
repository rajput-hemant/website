# Shared to-do (agents and owner)

# Open summary (as of 2026-10-03, from docs audit): bugs=5, ui-regressions=2, fixes=6, verification-gaps=9, improvements=4, decisions=4; new audit entries added=23. Priority tags on audit additions: P0=0, P1=2, P2=19, P3=3; older open items without priority tags remain uncounted. Confirmed bugs are in docs/verification/verification-issues.md (links below); unverified gaps stay here.

Last updated: 2026-10-03. One list for every agent working on `portfolio-3d`. Pick the top open item in **Now**, tick it here in the same commit that lands it, and add anything you defer under **Later** with one line of context. Never work on an item another lane holds (see the Lane column).

> Docs archive review (2026-10-03, branch `fm/website-docs-archive-cleanup`): archive complete; all superseded plans/handoffs already in `docs/archive/` (plan-2026-09-26, m1-conventions-2026-09-26, m1b-drawing-set-2026-09-26, shared-code-review-2026-09-26, redundancy-plan-2026-09-27, portfolio-3d-handoff-2026-09-26, edition-refactor-handoff-2026-09-27); no additional docs moved.

Rules that apply to every item: [cloud handoff](handoff/cloud-handoff-2026-09-27.md) owner rules, `/home/user/lanes/LANE-BRIEF.md` (when running in the cloud session), signed commits with the two trailers, no em dashes, work on `portfolio-3d` only (the only exception so far was the Press 3D identity fix, pushed to `master` at `aad74b8`).

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
| 11  | Final docs refresh: a dated handoff, refresh `docs/README.md` "last verified" stamps, regenerate `(inventory not retained in repository)`                                                                  | new lane, last        | Open          |

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
- [ ] **Surface 3D:** the lab power toggle unmounts the experiment because pausing needs a shared `paused` prop on `ExperimentSceneProps` (`lib/lab/types`); see the proposed patch in `docs/flavors/surface.md`.
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
- [ ] **Final pass leftovers** ([archive/verification/final-pass-2026-10-02.md](archive/verification/final-pass-2026-10-02.md)): Jacquard and Mission's header search chip fails Lighthouse `label-content-name-mismatch` (move the hint out of the button text as the other editions do); Survey's map links have the same mismatch (aria-label is the full sentence); Survey home runs at 3 fps under SwiftShader and three `desktop-survey` cases in `e2e/editions.spec.ts` time out on the button's stability check (check on a real GPU or CI); font-swap CLS residuals up to 0.0057 on Survey and Calibre home at 1440.
- [ ] **Budget:** `bun run budget` fails on `/f/drawing-set/lab/signature-field` (171.1KB) and `/f/surface/lab/signature-field` (171.3KB) against the 170KB ceiling (found 2026-10-03 on the host-runtime lane; pre-existing, no app code changed there).
- [ ] **Hosting gap:** Vercel build compatibility with the `bun --bun` hosted Next output is unverified (local Bun build passes and CI covers the gates; no preview deploy for this local-dev scope, so this stays a recorded gap, not an accepted risk).

## Audit additions 2026-10-03 (docs audit of open-items, feature files, edition docs, verification ledger)

New open/deferred items found by reading `docs/handoff/open-items-2026-09-27.md`, edition docs (`docs/flavors/drawing-set.md`, `docs/flavors/survey.md`, `docs/flavors/timetable.md`, `docs/flavors/surface.md`, `docs/flavors/minimal.md`, `docs/flavors/press.md`), `.agents/skills/verify/features/`, `docs/archive/reviews/redundancy-audit-2026-09-27.md`, `docs/archive/reviews/performance-audit-2026-09-27.md`, `docs/reference/prose-notes.md`, `docs/flavors/design.md`, `docs/archive/plans/plan-2026-09-26.md`, `docs/guides/m2-scene-spec.md` and source grep. Confirmed bugs are recorded in `docs/verification/verification-issues.md` (WEB-C9, WEB-C10, WEB-C11, WEB-H9); verification gaps and deferred choices stay here.

- [ ] **Drawing Set 3D / mobile:** home mobile fit could exceed shared `NARROW.fit` 0.85 (`flavors/drawing-set/lib/scene/poses.ts` only overrides `narrowShift`); `/ask` scene slot sits partly under the dock at mobile scrollY 0. [P2; improvement / UI regression; `docs/handoff/open-items-2026-09-27.md:48-49`; `docs/handoff/open-items-2026-09-27.md`; unverified: needs phone-width browser pass.]
- [ ] **AVIF posters (M2.5):** no `public/posters/`; SVG posters stand in; `?poster` hook (`docs/guides/m2-scene-spec.md:379`) not built. [P2; deferred / improvement; `docs/handoff/open-items-2026-09-27.md:52`, `docs/guides/m2-scene-spec.md:379`, `docs/archive/reviews/performance-audit-2026-09-27.md:194`; unverified: no build evidence.]
- [ ] **Unused direct dependencies:** `styled-components` (retained as `@sanity/ui` peer) and `web-vitals` (candidate removal; planned `?debug` overlay never built). [P2; decision needed / fix; `docs/handoff/open-items-2026-09-27.md:75`, `docs/archive/reviews/redundancy-audit-2026-09-27.md:66-67`, `docs/handoff/open-items-2026-09-27.md:1`; confirmed by `package.json` grep and zero source imports.]
- [ ] **Optional barrel cleanup:** `flavors/{drawing-set,press,survey,timetable}/components/{command,customize}/index.ts` barrels; collapse only after tracing imports. [P3; improvement; `docs/handoff/open-items-2026-09-27.md:86`, `docs/archive/reviews/redundancy-audit-2026-09-27.md:153`; optional, no behavior risk.]
- [ ] **Case studies M4:** schema fields (`sanity/schemas/project.ts`), typegen, mappers, seed, media components, shot list (`docs/archive/plans/plan-2026-09-26.md:110`). [P2; deferred / owner decision; `docs/handoff/open-items-2026-09-27.md:110`, `docs/archive/plans/plan-2026-09-26.md:380-392`; blocked: no project media yet.]
- [ ] **M5 polish (remaining):** sound palettes for Minimal/Drawing Set/Surface/Survey (audit appendices A/C/E) not started; 3D elements per edition (158 total, ~60 mechanism P); motion polish sets. [P2; deferred / improvement; `docs/handoff/cloud-handoff-2026-09-27.md:86-87`, `docs/archive/reviews/improvements-audit-2026-09-27.md:203`; partly done (`36160ea` sound engine, `f66f32a` docs); no live proof for most.]
- [ ] **M6 hardening (device/GPU matrix, Lighthouse CI, visual regression baselines, security review):** `docs/archive/plans/plan-2026-09-26.md:112`, `docs/handoff/open-items-2026-09-27.md:112`, `docs/handoff/cloud-handoff-2026-09-27.md:99`. [P2; verification gap; `docs/handoff/cloud-handoff-2026-09-27.md:99`, `docs/handoff/open-items-2026-09-27.md:112`, `docs/archive/plans/plan-2026-09-26.md:112`; partially closed: axe covered (`e2e/a11y.spec.ts`), visual baselines (`06f4abd`), Lighthouse CI still open.]
- [ ] **Plan §12 Q1 (owner decision):** which 3-4 projects get case studies (`default: featured: true`). [P1; decision needed; `docs/handoff/open-items-2026-09-27.md:115`, `docs/archive/plans/plan-2026-09-26.md:115`; unanswered in any doc.]
- [ ] **Plan §12 Q2 (owner decision):** include `profile.principles` on `/about` (default: skip, no field exists in `sanity/schemas/` or `lib/data/`). [P2; decision needed; `docs/handoff/open-items-2026-09-27.md:116`, `docs/archive/plans/plan-2026-09-26.md:116`.]
- [ ] **`?debug` web-vitals overlay:** never built; tied to `web-vitals` dependency decision (`docs/handoff/open-items-2026-09-27.md:117`, `docs/archive/plans/plan-2026-09-26.md:117`). [P3; deferred / decision needed; `docs/handoff/open-items-2026-09-27.md:117`; blocked on `web-vitals` removal decision.]
- [ ] **Visual restore regression (refactor revert in `2a5f42a`):** Surface probe cursor (`cursor.tsx` gone) + `data-scroll-behavior`; Surface rear-panel stacking below `xl`; Press hero readout (`numbered home query`) lost in `2a5f42a`. [P1; UI regression / fix; `docs/handoff/open-items-2026-09-27.md:169`, `docs/handoff/open-items-2026-09-27.md:169`; needs owner ruling; source evidence: `git show --stat 68090a8`, `flavors/surface/components/interaction/cursor.tsx` missing, `flavors/press/components/home/hero.tsx` and `latest-proof.tsx` match parent of `e3e119f`.]
- [ ] **Minimal Customize "3D" row unread:** `flavors/minimal/components/lab/experiment-stage.tsx` gates on motion/WebGL only; `data-scene` written but no reader (`docs/handoff/open-items-2026-09-27.md:170`, `docs/architecture/architecture.md:63`). Confirmed bug: WEB-C10 in ledger. [P2; fix; `docs/handoff/open-items-2026-09-27.md:170`, `docs/verification/verification-issues.md` WEB-C10; source evidence: `grep scene flavors/minimal/lib/prefs.ts` empty, `lib/scene/tier.ts:37` reads `data-scene`.]
- [ ] **`bun run signature` path broken:** `scripts/generate-signature.ts` writes `components/signature/signature-paths.ts`; file lives in `flavors/minimal/components/signature/`. [P2; fix; `docs/handoff/open-items-2026-09-27.md:171`, `docs/handoff/open-items-2026-09-27.md:171`; source evidence: file path mismatch, script output. Confirmed bug: WEB-C11 in ledger.]
- [ ] **Em dashes in source (14 instances):** against owner rule; e.g. `lib/data/fallback.ts`, missing-year placeholders in Drawing Set and Timetable (`docs/handoff/open-items-2026-09-27.md:172`). [P3; fix; `docs/handoff/open-items-2026-09-27.md:172`; source evidence: `grep -r` count; owner decision needed before cleanup (rule vs content). Confirmed: WEB-C11 partial (same file).]
- [ ] **Browser e2e / axe coverage only Minimal + Drawing Set:** `playwright.config.ts` projects; other editions only share-shell assertions (`docs/handoff/open-items-2026-09-27.md:174`, `docs/verification/verification-issues.md` WEB-C4). [P2; verification gap; `docs/handoff/open-items-2026-09-27.md:174`, `docs/verification/verification-issues.md` WEB-C4; unverified: no live run per edition beyond shared assertions.]
- [ ] **Live draft refresh (`DraftModeTools`) mounted in Minimal only:** no other edition imports `sanity/components/draft-mode-tools.tsx` (`docs/handoff/open-items-2026-09-27.md:175`, `docs/handoff/open-items-2026-09-27.md:175`). [P2; improvement / fix; `docs/handoff/open-items-2026-09-27.md:175`; needs owner ruling on scope.]
- [ ] **Survey runtime tier step-down missing:** no `PerformanceMonitor` or `SceneMonitor` (`docs/handoff/open-items-2026-09-27.md:176`, `docs/handoff/open-items-2026-09-27.md:176`). Confirmed gap: no source call to either monitor in `flavors/survey/components/scene/`. [P2; fix; `docs/handoff/open-items-2026-09-27.md:176`; source evidence: grep confirms absence; other editions (`flavors/press/components/scene/scene-root.tsx`, `lib/scene/session.tsx`) have it.]
- [ ] **SceneMonitor logic copied:** Drawing Set / Timetable `world.tsx` duplicate shared `SceneMonitor` logic (`components/semantic/scene/scene-monitor.tsx` used only by Press; `docs/handoff/open-items-2026-09-27.md:177`, `docs/archive/reviews/redundancy-audit-2026-09-27.md:153`). [P2; fix / deferred; `docs/handoff/open-items-2026-09-27.md:177`, `docs/archive/reviews/redundancy-audit-2026-09-27.md:153`; source evidence: `git grep createSessionScene` shows only Press; Drawing Set / Timetable each copy session behavior.]
- [ ] **`content/site.ts` `only` out of date:** `/about` is `only: "drawing-set"` though five editions have it; sitemap still correct (`docs/handoff/open-items-2026-09-27.md:178`, `docs/handoff/open-items-2026-09-27.md:178`). [P2; fix; `docs/handoff/open-items-2026-09-27.md:178`; source evidence: `grep only content/site.ts`.]
- [ ] **Survey docs not re-verified:** `docs/flavors/survey.md` not re-verified since 2026-09-27 docs cleanup (`docs/edition-docs`). [P2; verification gap; `docs/flavors/survey.md`, `docs/handoff/open-items-2026-09-27.md` notes `docs/flavors/design.md` and `docs/flavors/survey.md` not re-verified; no live proof since `b50faeb`.]
- [ ] **Design doc (`docs/flavors/design.md`) not re-verified:** edited by other lanes (`docs/flavors/design.md:3`, `docs/handoff/open-items-2026-09-27.md` line 17). [P2; verification gap; `docs/flavors/design.md:3`; no live proof since 2026-09-27.]
- [ ] **Prose notes (`docs/reference/prose-notes.md`) unverified:** email, LinkedIn, WhatsApp, dates, featured set, ShellAI, years, changelog months (`docs/reference/prose-notes.md:3`). [P2; verification gap / decision needed; `docs/reference/prose-notes.md:3`; none confirmed by owner.]
- [ ] **Performance audit: Cache Components preflight fails (`next.config.ts` has `cacheComponents: false`):** `docs/archive/reviews/performance-audit-2026-09-27.md:9`. [P2; verification gap / deferred; `docs/archive/reviews/performance-audit-2026-09-27.md:9`; by design, no fix planned unless owner enables flag.]
- [ ] **Drawing Set `docs/flavors/survey.md` gap note:** `docs/flavors/survey.md` not re-verified (already listed above; kept separate for cross-ref). [P2; verification gap; see prior entry.]

Link to ledger: confirmed bugs above (signature script path, data-scene, em dashes, visual restore, survey tier step-down, scene-monitor copy, site `only`) are also in `docs/verification/verification-issues.md` (WEB-C9, WEB-C10, WEB-C11, WEB-H9, and follow-ups). Unverified gaps (mobile fit, AVIF posters, M4-M6, device checks, e2e coverage, design/survey/prose docs, performance audit) stay here until a browser/live run provides evidence.

### full-file review partitionB

Scope: `flavors/{calibre,drawing-set,jacquard,mission,press,survey}` (768 manifest files). Per the captain's scope update, tests (`__tests__`, `*.test.*`) and every `components/ui` path (shadcn and flavor UI) were excluded and are not counted as reviewed: 183 excluded; of the 585 in scope, 579 got both the Deslop pass and the Ponytail pass (26 of those are byte-identical twins of a reviewed file and are recorded as such) and 6 generated `lib/cn-tables.ts` files got a provenance-only review (header checked, packed tables not line-reviewed). Batch reads were cut at 170 columns, so the 136 lines longer than that (106 files) were rechecked separately; none changed a finding. Complexity items below come only from the Ponytail pass; comment, cast, style and defensive-code items come from the Deslop pass and are tagged `deslop`. Review only, nothing was fixed, built or run. Reference for "never copied into an edition": `docs/flavors/README.md:95` (editions own presentation, logic lives in shared pure modules) and `docs/flavors/README.md:96` (shared code stays edition-neutral). Markup and class strings per edition are intentional, so the clone items below target logic only.

Every item is `confirmed` (read side by side or grep-proven) or `hypothesis` (needs the first step of the item to verify). Line numbers were read at branch head `fm/website-flavors-review-b` and may drift. Acceptance checks for every item also include `bun run type-check`, `bun run lint`, `bun run test` and `bun run fmt:check` staying green; only item-specific checks are listed per item. No em dashes are used, per the rules above.

Net-lines estimate (negative = lines removed), two buckets, not to be blended:

- Bucket A, confirmed mechanical cleanups (WS-B-001 to WS-B-018): about -245 to -365 lines. Tight: each item names its exact sites and the replacement already exists or is trivial. Uncertainty is plus or minus 25%, mostly from how each new helper is written.
- Bucket B, structural consolidation, all `hypothesis` (WS-B-019 to WS-B-032): about -685 to -1,740 lines (includes the four hypothesis sub-bullets of WS-B-018, about -43 to -52). Wide: every estimate depends on how much logic can leave the per-edition files without breaking the "editions own presentation" rule, and on edition-specific behaviour found only while doing the work. Treat the upper bound as unlikely.
- Small deslop and hypothesis items WS-B-033 to WS-B-038 add about -18 to -24 lines and are not in either bucket.
- Not counted: generated `cn-tables.ts` bytes (WS-B-030), CSS bytes, and the bundle effect of WS-B-025.

#### Bucket A: confirmed mechanical cleanups

- [ ] **WS-B-001** `P3` `ponytail:delete` Dead exports with no reader.
  - Where: `flavors/jacquard/lib/weave.ts:365` (`kindDye`, `yarnClass` at the next export already holds the same kind-to-dye literals), `flavors/jacquard/content.ts:34` (`cardFor`), `flavors/mission/content.ts:32` (`sectionFor`), `flavors/drawing-set/components/command/shortcuts.ts:7` and `flavors/survey/components/command/shortcuts.ts:4,15` (re-export of `GO_SEQUENCE_MS`), `flavors/drawing-set/components/scene/views/kit.tsx:127` (`scratch`) and the module-level `const m = new Matrix4()` at `:107`, which only `scratch` reads (`compose()` at `:111-124` uses its own `out` argument).
  - Evidence: grep over `app/ flavors/ lib/ components/` finds no importer for any of them outside the defining file and `__tests__`. `GO_SEQUENCE_MS` is read only from `lib/command/shortcuts.ts` and its test.
  - Cut / replace: delete the declarations and the re-export lines. net: -28..-34.
  - Preserved: nothing reads these symbols, so runtime behaviour is identical.
  - Accept: `rg "kindDye|cardFor|sectionFor|scratch"` shows no remaining reference; type-check and the existing tests pass without edits to test files other than dropping an import if one existed.

- [ ] **WS-B-002** `P4` `ponytail:shrink` Exports that are used only inside their own module.
  - Where: `flavors/survey/components/about/instrument-glyph.tsx:14` (`kitSight`), `flavors/survey/components/relief/sheet-ground.tsx:16` (`seaLines`), `flavors/{jacquard,mission,press}/components/site/nav-links.tsx:9` (`isActive`, folded into WS-B-007 if that lands first), `flavors/press/components/scene/views/lever.tsx:33` (`STAGE_LIVE`), `flavors/press/components/scene/views/kit.tsx:132` (`createLights`, used only inside `kit.tsx`). Not `clamp` at `kit.tsx:27`: `spoiled.tsx:19` imports it.
  - Evidence: grep for each name returns only the defining file.
  - Cut / replace: drop the `export` keyword. net: 0.
  - Preserved: no importer exists, so nothing breaks.
  - Accept: type-check passes with no new import errors.
  - Dedup: unrelated to the open "Optional barrel cleanup" item (those are `index.ts` barrels).

- [ ] **WS-B-003** `P2` `ponytail:shrink` One shared scene math module instead of per-edition clamp, damp, spring, approach, degree and motion-flag copies.
  - Where (this partition): `clamp` at `flavors/drawing-set/components/scene/world.tsx:70`, `flavors/press/components/scene/world.tsx:63`, `flavors/press/components/scene/views/kit.tsx:27`, `flavors/survey/lib/relief.ts:144`, plus inline `Math.min(1, Math.max(0, x))` at `flavors/press/components/scene/views/plates.tsx:49`, `years.tsx:66`, `signatures.tsx:69`, `flavors/survey/components/scene/glyphs/layers.ts:60`, `flavors/survey/lib/scene/poses.ts:263`, `flavors/survey/lib/ridge-block.ts:156`, `flavors/survey/lib/sound/voices.ts:137,145`, `flavors/survey/components/relief/sheet-map.tsx:166`. Damp `1 - (1 - rate) ** (dt * 60)` at `flavors/calibre/components/scene/world.tsx:64`, `flavors/press/components/scene/world.tsx:79`, `flavors/press/components/scene/views/kit.tsx:263`, `flavors/jacquard/components/scene/world.ts:65`, `flavors/mission/components/scene/world.ts:49`. Fixed-step spring (k 380, c 32, 1/120 substeps) at `flavors/survey/components/scene/props.ts:158`, `flavors/survey/components/scene/glyphs/kit.ts:30`, inlined at `flavors/survey/components/scene/overprint.ts:188`. Linear approach (`target > v ? min : max`) at `overprint.ts:182,226` and `glyphs/layers.ts:107`. Degrees to radians written six times at `flavors/survey/lib/ridge-block.ts:93,98,184-187` while `glyphs/kit.ts:23` exports `DEG`. The `dataset.motion === "on"` check at `flavors/survey/components/scene/world.ts:284,313,322`, `glyphs/kit.ts:25`, `lib/loupe.ts:15`, `lib/sound/benchmark.ts:59` although `motionOn` is already imported from `@/lib/scene/clock` at `world.ts:30`.
  - Incidental copies outside this partition: `lib/scene/dom.ts:10`, `lib/scene/session.tsx:42`, `lib/scene/inspect.ts:76`, `flavors/minimal/lib/scene/poses.ts:62`, darkroom, timetable, maquette. `lib/scene/inspect.ts:81` uses an exp-decay spring and is not a duplicate.
  - Evidence: confirmed by grep and side-by-side reads. Not byte-equal: the rest epsilon is 1e-3 in survey `props.ts`/`overprint.ts`, 0.05 in `glyphs/kit.ts`, and `press` `createDamp` snaps under 5e-4 and when motion is off while the others use 1e-4.
  - Cut / replace: add `lib/scene/math.ts` with `clamp`, `damp(value, target, rate, dt)`, `spring(state, target, dt, { k, c, eps })`, `approach(v, target, d)` and `DEG`; use `motionOn()` from `lib/scene/clock` everywhere. Keep each edition's epsilon and motion-off snap as an argument or thin wrapper. net: -55..-100.
  - Preserved: per-site epsilon and motion-off behaviour; the pre-paint script is not touched.
  - Accept: unit tests for `math.ts` cover clamp bounds, damp at dt 0 and 1/60, spring settling to the target within 1e-3; existing scene tests still pass; grep for `Math.min(1, Math.max(0` in the listed files returns nothing.

- [ ] **WS-B-004** `P3` `ponytail:stdlib` `pad2` defined five times, plus about 14 inline `String(x).padStart(2, "0")`.
  - Where: `flavors/calibre/lib/movement.ts:32`, `flavors/jacquard/lib/weave.ts:201`, `flavors/mission/lib/flight.ts:27`, `flavors/press/lib/proof.ts:60`, `flavors/press/lib/scene/poses.ts:161`; inline at `flavors/press/components/home/latest-proof.tsx:36`, `flavors/press/components/site/nav-links.tsx:26`, `app/f/press/now/page.tsx:78`, `flavors/survey/lib/relief.ts:160,290,360`, `flavors/survey/components/relief/sheet-map.tsx:482`.
  - Evidence: confirmed by grep. `lib/format.ts:59` already has a private `pad` used for dates; `darkroom/roll.ts:10`, `maquette/model.ts:7`, `surface/seg.tsx:82` repeat it outside this partition.
  - Cut / replace: export one `pad2` from `lib/format.ts` (it owns `pad`) and import it. net: -8..-14.
  - Preserved: identical output for all inputs.
  - Accept: `rg "padStart\(2" flavors/{calibre,jacquard,mission,press,survey}` is empty apart from a deliberate non-date use; a small unit test for `pad2(5)` and `pad2(12)` exists in `lib/`.

- [ ] **WS-B-005** `P3` `ponytail:stdlib` Local `visitorName` copies of the shared export.
  - Where: `flavors/calibre/components/ask/labels.ts:5`, `flavors/jacquard/components/ask/labels.ts:5`, `flavors/mission/components/ask/labels.ts:5`, `flavors/press/components/ask/labels.ts:5`, `flavors/survey/components/ask/chat-bubble.tsx:28`, and the re-export at `flavors/drawing-set/components/ask/chat-bubble.tsx:31`; also the inline `"Anonymous"` fallback at `flavors/drawing-set/components/home/current-revision.tsx:53`.
  - Evidence: each is byte-equal to `lib/ask/format.ts:17` (`authorName ?? "Anonymous"`). Outside the partition: darkroom, maquette `labels.ts:5`, timetable `chat-bubble.tsx:28`.
  - Cut / replace: delete the local exports and import `visitorName` from `@/lib/ask/format` at the consumers (`moderation-queue.tsx`, `pending.tsx`, `thread.tsx` and their siblings). If `labels.ts` then holds nothing, delete it. net: -10..-14.
  - Preserved: same value.
  - Accept: `rg "visitorName =" flavors` finds only `lib/ask/format.ts`.

- [ ] **WS-B-006** `P3` `ponytail:shrink` The resume date span helper is copied eight times.
  - Where: `flavors/calibre|jacquard|mission/components/resume/resume-document.tsx:15`, `flavors/press/components/resume/resume-document.tsx:19`, `flavors/survey/components/resume/resume-document.tsx:29` (`dates = (start, end?) => formatMonthYear(start) + " to " + (end ? formatMonthYear(end) : "now")`), and the same expression inline at `flavors/jacquard/components/work/threads.tsx:57-60` and `flavors/press/components/work/press-log.tsx:92-93`.
  - Evidence: confirmed by grep. `lib/format.ts:124` `formatDateRange` renders `A – B` and `Present`, so it is not a drop-in. Outside the partition: darkroom, maquette and timetable `network-section.tsx:17`.
  - Cut / replace: give `formatDateRange` an options argument (`{ separator: " to ", open: "now" }`) or add a sibling `formatRoleSpan`, and call it from all sites. net: -6..-12.
  - Preserved: output strings are unchanged for each caller.
  - Accept: a unit test for the new option; resume pages render the same text.

- [ ] **WS-B-007** `P3` `ponytail:shrink` `isActive` pathname helper repeated in six editions.
  - Where: `flavors/calibre/components/site/nav-links.tsx:11`, `flavors/drawing-set/.../nav-links.tsx:9`, `flavors/jacquard/.../nav-links.tsx:9`, `flavors/mission/.../nav-links.tsx:9`, `flavors/press/.../nav-links.tsx:9`, `flavors/survey/.../nav-links.tsx:9` (`pathname === href || pathname.startsWith(`${href}/`)`).
  - Evidence: confirmed; also in darkroom, maquette, timetable, and `minimal` calls it `isActivePath`. `docs/flavors/README.md:95` says routing logic is shared.
  - Cut / replace: one `isActivePath(pathname, href)` in `lib/public-pathname.ts` and import it. net: -14..-18.
  - Preserved: same predicate. Accept: a unit test with `/`, `/work`, `/work/x`, `/workshop`.

- [ ] **WS-B-008** `P4` `ponytail:native` `Object.prototype.hasOwnProperty.call` where `Object.hasOwn` exists.
  - Where: `flavors/calibre/lib/scene/poses.ts:29`, `flavors/calibre/lib/sound/voices.ts:145`, `flavors/drawing-set/lib/prefs.ts:81`. Jacquard, mission and `flavors/drawing-set/lib/sound/voices.ts:135` already use `Object.hasOwn`. Also `lib/prefs/standard.ts:65` outside the partition.
  - Cut / replace: swap to `Object.hasOwn`. net: 0.
  - Caveat: `drawing-set/lib/prefs.ts` `migrateStoredPrefs` is embedded in the pre-paint script via `toString()` and must stay self-contained, so confirm the target browsers support `Object.hasOwn` before touching that one, or skip that site.
  - Accept: pre-paint script still evaluates; migration tests pass.

- [ ] **WS-B-009** `P3` `deslop:cast` `asSceneRoute` narrows with `in` plus a cast.
  - Where: `flavors/press/lib/scene/poses.ts:140-141`, `flavors/drawing-set/lib/scene/poses.ts:287` (also `flavors/timetable/lib/scene/poses.ts:202` outside the partition).
  - Evidence: `route in poses` is true for inherited keys such as `constructor` or `toString`, and the `as SceneRoute` cast then hides it. `flavors/jacquard|mission/lib/scene/poses.ts:54-58` use `Object.hasOwn` with a type guard for the same job.
  - Cut / replace: copy the `isSceneRoute` guard from jacquard or mission and drop the cast. net: +2..+4.
  - Preserved: every real route; inherited-key inputs now fall back correctly.
  - Accept: unit test that `asSceneRoute("constructor")` returns the fallback.

- [ ] **WS-B-010** `P4` `deslop:style` Hand-typed `rel="noopener noreferrer"` where `EXTERNAL_REL` exists.
  - Where: `flavors/calibre/components/resume/resume-document.tsx:69`, `flavors/drawing-set/components/home/current-revision.tsx:32`, `flavors/jacquard/.../resume-document.tsx:67`, `flavors/mission/.../resume-document.tsx:67`, `flavors/press/.../resume-document.tsx:71`, `flavors/survey/.../resume-document.tsx:94`, `flavors/survey/components/work/role-transect.tsx:104`. `flavors/survey/components/site/site-footer.tsx:54` already uses the constant.
  - Cut / replace: use `EXTERNAL_REL` (`lib/safe-href.ts:15`) or `hrefProps` (`lib/safe-href.ts:101`). net: 0.
  - Preserved: same attribute value. Accept: `rg 'rel="noopener noreferrer"' flavors` is empty in this partition.

- [ ] **WS-B-011** `P3` `ponytail:stdlib` Drawing Set REV stamp formatters duplicate `formatRevision`.
  - Where: `flavors/drawing-set/components/site/site-footer.tsx:28-33` (`revision`) and `flavors/drawing-set/components/projects/sheet.ts:11-14` (`revOf`).
  - Evidence: both format `2026-09-14` as `26.09`; only the empty fallback differs (`"--"` vs `""`). `lib/format.ts:76` `formatRevision(date)` is already used by `app/f/drawing-set/now/page.tsx` and `about/page.tsx`. It throws on an invalid ISO and takes no `undefined`.
  - Cut / replace: `date ? formatRevision(date) : "--"` at the call sites; delete both helpers. net: -10..-12.
  - Accept: footer and sheet pages show the same stamp; empty date still shows the fallback.

- [ ] **WS-B-012** `P2` `ponytail:yagni` Drawing Set `DeferredShell` re-implements `useIdleReady`.
  - Where: `flavors/drawing-set/components/site/deferred-shell.tsx:3-26`.
  - Evidence: hand-rolled `requestIdleCallback` ready-state, the same 2000 ms timeout and 300 ms fallback as `components/semantic/use-idle-ready.ts`; calibre, jacquard, mission, press and survey call `useIdleReady()` in about 15 lines.
  - Cut / replace: replace the `useState/useEffect` body with `useIdleReady()`. net: -9..-12.
  - Preserved: same timing. Accept: the deferred layers still mount after idle in a browser smoke check (one smoke test is enough).

- [ ] **WS-B-013** `P2` `ponytail:yagni` Drawing Set contact block re-implements the shared copy-email hook.
  - Where: `flavors/drawing-set/components/about/contact-block.tsx:16-40`.
  - Evidence: hand-rolled clipboard state (copied flag, reset timer, mailto fallback, haptic success) duplicates `components/semantic/copy-email/use-copy-email.ts`; only `playStamp()` is edition-specific.
  - Cut / replace: `useCopyEmail(email, 1800)` and call `playStamp()` when `copy()` resolves true; drop the local state, ref, effect and haptic import. net: -12..-16.
  - Preserved: copy, fallback and confirmation behaviour. Accept: copy still works and the stamp sounds once.

- [ ] **WS-B-014** `P4` `ponytail:shrink` Survey small cleanups (confirmed, one PR).
  - Where and what: `flavors/survey/lib/scene/poses.ts:158` `summits.map((s) => ({ ...s, h: s.h }))` copies every summit to no effect; `:144-145` calls `trialPoints(relief)` twice; `:406` `THEODOLITE` is a function with a constant-style name used at `:324` before its declaration; `flavors/survey/lib/relief.ts:290` builds the grid ref inline instead of reusing `gridRef` (`:159-162`); `relief.ts:420-421` and `flavors/survey/components/scene/world.ts:41-42` both declare `P_MIN/P_MAX = -80/540`; `0.436` appears at `scene/overprint.ts:115,214`, `scene/props.ts:59`, `scene/world.ts:39`; `LOUPE_RADIUS = 80` at `props.ts:61` and `world.ts:40`; ring radii 80/72 at `relief/sheet-map.tsx:279-286` vs `LOUPE` (`relief.ts:391`, 84/76); `flavors/survey/lib/ridge-block.ts` degree conversions (see WS-B-003).
  - Cut / replace: pass `summits` directly; compute `trialPoints` once; export `P_MIN/P_MAX`, `LOUPE_RADIUS` and a `SHEET.TILT`/`Y_SCALE` constant from `lib/relief.ts`; rename `THEODOLITE` to `theodoliteAt`. net: -8..-14.
  - Preserved: the GLSL mirror of the 0.9 ellipse factor (`scene/shaders.ts:52`, `props.ts:321`) is justified and stays.
  - Accept: scene tests and the survey poster still render the same board JSON (`encodeBoard` output unchanged).

- [ ] **WS-B-015** `P3` `ponytail:shrink` Press scene views repeat the same tint and keyed-damp boilerplate.
  - Where: `colours()` tint callback plus `instanceColor.needsUpdate` in `flavors/press/components/scene/views/books.tsx:49-57`, `colour-bar.tsx:42-45`, `flags.tsx:55-63`, `signatures.tsx:45-58`, `tins.tsx:54-62`, `years.tsx:44-52`, `pile.tsx:66-72`, `owner.tsx:107-110`, `spoiled.tsx:207-211`; `createDamp(Object.fromEntries(items.map((x) => [key, 0])))` at `books.tsx:60-62`, `flags.tsx:66-68`, `pile.tsx:77`, `signatures.tsx:43`, `tins.tsx:65`, `spoiled.tsx:222-231`.
  - Evidence: confirmed by reading all nine. Also `world.tsx:63-81` and `views/kit.tsx:251-275` hold two implementations of the same damped step in one edition (see WS-B-003).
  - Cut / replace: `tintInstances(mesh, count, pickInk)` in `views/kit.tsx` that returns the callback and registers `onTheme`; `createDampFor(keys, initial = 0)`. net: -25..-50.
  - Preserved: per-view ink choice, theme re-tint, and motion-off snap. Accept: press view tests pass and each view recolours on a theme flip.

- [ ] **WS-B-016** `P4` `ponytail:yagni` Dead CSS and duplicate print blocks.
  - Where: `flavors/survey/styles.css:90` (`--radius-lg` unused: no `rounded-lg` under `flavors/survey` or `app/f/survey`), `styles.css:399-408` and `:411-419` (two `@media print` blocks). Per-edition repeats are WS-B-029.
  - Cut / replace: delete the token; merge the print blocks. net: -3..-5.
  - Preserved: print output. Accept: grep for `radius-lg` shows no consumer before removal; print preview unchanged.

- [ ] **WS-B-017** `P4` `ponytail:shrink` Small single-edition re-exports and shims.
  - Where: `flavors/survey/components/command/items.ts:1-11` (shim that re-exports `lib/command/items`; calibre, jacquard and mission import it directly), `flavors/calibre/components/site/scene-slot.tsx:10` and `flavors/drawing-set/components/site/scene-slot.tsx:7` plus `site/index.ts:6` (type re-exports), `flavors/drawing-set/components/ask/chat-bubble.tsx:31`, `flavors/calibre/components/ask/message-menu.tsx:1-22`.
  - Cut / replace: import from the origin module and delete the re-export after grepping consumers. net: -8..-14.
  - Dedup: the open "Optional barrel cleanup" item covers `command/` and `customize/` `index.ts` only; this item does not touch those.
  - Accept: type-check passes; no consumer left on the removed path.

- [ ] **WS-B-018** `P3` `ponytail:shrink` Drawing Set local tidy-ups (one PR; each sub-bullet is separately checkable; sub-bullets marked hypothesis are NOT in the Bucket A total and are counted in Bucket B).
  - `flavors/drawing-set/lib/dates.ts:13-34`: `toCalendarDate` and the inclusive months formula copy the private helpers at `lib/format.ts:60-68,136-142` (hypothesis on exact parity; `docs/flavors/README.md:95` says date maths is shared). Hypothesis, est (bucket B): -8..-12.
  - `flavors/drawing-set/components/home/current-revision.tsx:13-18`: local `excerpt()` hard-cuts at 160 characters; `lib/ask/format.ts` `excerpt(text, max)` cuts at a word boundary, so the output changes slightly (a behavior change, decide first). Hypothesis, est (bucket B): -5.
  - `flavors/drawing-set/components/ask/chat-feed.tsx:38-44` and `components/home/selected-sheets.tsx:33`: nested ternary maps 0 and 1 to `"a"` and `"b"`; use `(["a", "b"] as const)[i]`. net: -4.
  - `flavors/drawing-set/components/about/education-volume.tsx:8` and `skills-case.tsx:6`: identical `String.fromCharCode(65 + index % 26)` helper twice. net: -3.
  - `flavors/drawing-set/components/scene/world.tsx:975-979,991-998` repeats `props.ts:110-114,422-426` `hitOf`: export `hitOf` and use it. net: -8.
  - `flavors/drawing-set/components/scene/world.tsx:182-215` `place()` re-implements `views/kit.tsx:107-124` `compose()` with its own scratch objects. net: -10.
  - `flavors/drawing-set/lib/sound/voices.ts:65-101`: three voices call `noise()` then override the filter to add `Q`, so the helper's filter argument is discarded; give `noise()` an optional `Q`. net: -6.
  - `flavors/drawing-set/components/scene/views/parts.ts:47-50` `unitBox()` and `scene/models.ts:294-297` `rod()` are both `box(1,1,1)` wrappers. net: -4.
  - `flavors/drawing-set/components/work/experience-timeline.tsx:24-29,50,83-85,104`: a fragment wrapping a single `<ol>`, and `tenureMonths(tenure(...))` computed twice (a `monthsOf(role)` helper). net: -4.
  - `flavors/drawing-set/components/now/category-filter.tsx:21-48` repeats the "All" and per-category button markup; map over `[null, ...categories]`. net: -12. Related hypothesis, est (bucket B): a shared chip group with `components/projects/project-register.tsx:64-110` (-20..-25).
  - `flavors/drawing-set/components/home/current-revision.tsx:20-38` repeats the internal-or-external link branch that `components/now/item-link.tsx:8-16` already does (hypothesis: reuse `ItemLink`). Hypothesis, est (bucket B): -10.
  - Preserved: output and markup of every sub-bullet except the `excerpt()` one, which changes truncation at a word boundary. Accept: each touched page renders identically (one smoke check per area is enough); for `excerpt()`, record the accepted new output.

#### Bucket B: structural consolidation (all hypotheses; verify the first step before committing)

- [ ] **WS-B-019** `P2` `ponytail:shrink` hypothesis. The ask composer logic is cloned four times.
  - Where: `flavors/{calibre,jacquard,mission,press}/components/ask/composer.tsx` (277-282 lines each).
  - Evidence: after normalising only the flavor import path and stripping `className` attributes, calibre vs jacquard differs by 43 of 279 lines and calibre vs press by 38; the differences are copy text, the voice import, `handle` prop vs `useSiteIdentity()`, a `data-voice` attribute and a sound call. Submit, draft, collapse and error handling are the same.
  - Cut / replace: move the stateful body into a headless hook in `components/semantic/ask/` (per `docs/flavors/README.md:96`, a shared headless hook is allowed); each edition keeps its markup, classes, copy and sound call. Do not move class names into `semantic`. net: -100..-400.
  - Preserved: markup and classes stay per edition.
  - Accept: each edition's composer renders the same DOM; a hook test covers submit, empty draft, error and collapsed states; keep one smoke test for the happy path.

- [ ] **WS-B-020** `P3` `ponytail:shrink` hypothesis. Command row derivation is cloned.
  - Where: `flavors/{calibre,jacquard,mission,press}/components/command/command-row.tsx` (131-134 lines), `drawing-set` and `survey` variants.
  - Evidence: calibre vs mission differ by 10 lines after normalising (one doc comment, `strokeWidth` 1.75 vs 1.5); press 13. `groupIcons`, `actionIcons`, the `Title` query highlighter and the checked/icon/goKey/subtitle derivation are identical.
  - Cut / replace: `components/semantic/command/row-parts.ts` exporting the icon maps, the highlighter and a `useRowModel(item, search, copied)`; each edition keeps its row markup, classes and `strokeWidth`. net: -80..-200.
  - Accept: command palette rows look the same in each edition; unit test for the highlighter and the model.

- [ ] **WS-B-021** `P3` `ponytail:shrink` hypothesis. Resume document data shaping is cloned.
  - Where: `flavors/{calibre,jacquard,mission}/components/resume/resume-document.tsx` (211 lines each, 21 differing lines after normalising), press (about 34), survey (about 81). Includes `plain()`, the contact list and the filtered links at `survey/.../resume-document.tsx:32-81`.
  - Cut / replace: shared pure helper for the contact list, plain-text bio and the section lists (with WS-B-006 and WS-B-010); markup stays per edition. net: -60..-150.
  - Accept: printed resume text identical per edition.

- [ ] **WS-B-022** `P3` `ponytail:shrink` hypothesis. Customize controls logic is cloned.
  - Where: `flavors/{calibre,jacquard,mission,press}/components/customize/customize-controls.tsx` (128-130 lines, 28 differing lines vs calibre after normalising).
  - Cut / replace: a shared hook for the pref wiring (setters, sound-on-change) taking the edition's voice; keep the markup. net: -50..-150.
  - Fold in `deslop:cast` sub-item (hypothesis): `theme as Theme` and `scene as SceneLevel` at `flavors/press/components/customize/customize-controls.tsx:69,77`, `flavors/survey/.../customize-controls.tsx:71,104` and `flavors/drawing-set/.../customize-controls.tsx:108,146`, while calibre, jacquard and mission pass the value straight to `setPrefs` without casts. The cause is probably the `SegmentedControl` prop typing in an excluded `components/ui` file, which was deliberately not read. Acceptance: remove the casts and `bun run type-check` passes; otherwise make the control generic in that file.

- [ ] **WS-B-023** `P4` `ponytail:yagni` hypothesis. Thin layers and wrappers cloned across editions.
  - Where: `flavors/{calibre,jacquard,mission,press}/components/link-preview/link-preview-layer.tsx` (identical after normalising class strings; `linkPreviewsOn` at `:10` repeated), `flavors/{calibre,jacquard,mission}/components/ask/moderation-strip.tsx` (16-line owner-gated `dynamic()` wrappers, 3 differing lines), `flavors/{calibre,jacquard,mission,press}/components/visitor-counter/visitor-counter.tsx` (4 changed lines of 44), `flavors/jacquard|mission/components/site/copy-email.tsx` (0 changed vs calibre), `flavors/{drawing-set,press,survey}/components/interaction/interaction-layer.tsx` (2 changed lines of 23; only the `Cursor` differs).
  - Cut / replace: only where the file is logic with no markup. The interaction layer can take its `Cursor` as a prop in a shared file; the rest are mostly Base UI or markup wiring and are not worth sharing unless a change is already planned. net: -50..-150. Prefer to do the interaction layer and `linkPreviewsOn` only.
  - Accept: no behavior change; each edition still passes its own Cursor.

- [ ] **WS-B-024** `P2` `ponytail:yagni` hypothesis (verify first). Drawing Set ⌘K dialog is a pre-migration controller.
  - Where: `flavors/drawing-set/components/command/command-dialog.tsx:34-190` and `flavors/drawing-set/components/command/items.ts:1-116`.
  - Evidence: announcement timers, a `runAction` switch, copy-email clipboard, a `newTab` ref and `goStartedAt`, which `components/semantic/command/use-command-dialog.ts` (205 lines) already implements and calibre, press and others use.
  - Cut / replace: adopt `useCommandDialog`, `buildStandardActions` and `copy.ts`; keep only `revealTheme` (`lib/interaction/theme-reveal.ts`) as the edition-specific bit. net: -100..-200.
  - Accept: ⌘K opens, runs each action type, announces, and the theme reveal still plays; existing command tests pass.

- [ ] **WS-B-025** `P3` `ponytail:shrink` hypothesis (bundle effect unmeasured). Press, survey and drawing-set import the moderation queue statically.
  - Where: `flavors/press/components/ask/moderation-strip.tsx:24-27`, `flavors/survey/components/ask/moderation-strip.tsx:25-29`, `flavors/drawing-set/components/ask/moderation-strip.tsx:26`.
  - Evidence: confirmed by reading: the queue UI (about 120 lines) is bundled into the always-rendered strip, while calibre, jacquard and mission lazy-load `moderation-queue` with `dynamic()` after `useOwner()` is true.
  - Cut / replace: split into `moderation-queue.tsx` plus `dynamic()` exactly like `flavors/calibre/components/ask/moderation-strip.tsx`. net: about 0 lines. Success is measured by the route's client bundle, not lines.
  - Accept: the budget script (`bun run budget`) is not worse, and the owner still sees the queue.

- [ ] **WS-B-026** `P3` `ponytail:yagni` hypothesis. Drawing Set and Calibre one-entry lab tables.
  - Where: `flavors/calibre/components/lab/experiments.tsx:1-10` and `experiment-stage.tsx:18-23` (byte-identical copy of `experiments.tsx` in jacquard, mission and press), `flavors/drawing-set/components/lab/poster.tsx:14-30` and `experiment-stage.tsx:13-28`.
  - Evidence: slug-keyed maps with exactly one entry (`LabSlug` has one member per `content/lab.ts`); `poster.tsx` is a pass-through to `SignatureFieldFallback`.
  - Cut / replace: keep until a second experiment is planned; otherwise render the component directly and drop the maps. net: -10..-20.
  - Preserved: rendered posters and stages are unchanged. Accept: with the maps removed, `bun run type-check` still passes and the lab pages render the same stage; do not start before a second experiment is ruled out.

- [ ] **WS-B-027** `P3` `ponytail:yagni` hypothesis. Drawing Set prefs re-implement the standard migrate and apply.
  - Where: `flavors/drawing-set/lib/prefs.ts:55-146` vs `lib/prefs/standard.ts` (`migrateStandardPrefs`, `applyStandardPrefs`), for two extra keys (`accentHue`, `cursor`).
  - Cut / replace: let `standard.ts` accept an extension schema. Constraint: the pre-paint script embeds the functions via `toString()` (`flavors/drawing-set/lib/prefs-script.ts:17`, `lib/prefs/standard.ts:113`), so any extension must stay self-contained. This may be the reason it was kept; confirm before starting. net: -40..-80.
  - Accept: the pre-paint script still runs without module imports; prefs tests pass.

- [ ] **WS-B-028** `P3` `ponytail:yagni` hypothesis. Per-edition prefs alias wrappers.
  - Where: `flavors/calibre/lib/prefs.ts:10-20` (`defaultPrefs = standardDefaults`, `applyPrefs = applyStandardPrefs`, `Prefs = StandardPrefs`), the same shape in jacquard, mission, press and survey (`flavors/survey/lib/prefs.ts:14-19`), and `PREFS_VERSION` exported only for a test at `flavors/jacquard/lib/prefs.ts:16` and `flavors/mission/lib/prefs.ts:16`.
  - Cut / replace: keep `PREFS_KEY` and the migrate wrapper, inline the pure aliases at call sites; point the tests at `STANDARD_PREFS_VERSION`. net: -6 per edition, about -25. Low value; only if touching prefs anyway.
  - Preserved: the storage key and migration behaviour. Accept: prefs tests pass; the pre-paint script still builds from `standardPrefsScript(PREFS_KEY)`.

- [ ] **WS-B-029** `P3` `ponytail:yagni` hypothesis. Shared CSS blocks repeated per edition.
  - Where: `flavors/calibre/styles.css:10-13,319-335,459-467`, `flavors/drawing-set/styles.css:10-13,245-261,389-399,615-624` (also two separate `@media print` blocks and two `@layer base` sections there), and the survey equivalents (`flavors/survey/styles.css:10-13,305-325,399-419`).
  - Evidence: the custom variants for `dark`, `motion` and `fine`, the `[data-motion="off"]` and reduced-motion blocks, print-hide and the 3D-layer print rules are verbatim in each file.
  - Cut / replace: move the shared blocks into `components/semantic/**/*.css` next to `color-scheme.css` and `shortcut-label.css`, which every edition already imports. net: -60..-150.
  - Accept: each edition's built CSS is unchanged for these rules (compare computed output once).

- [ ] **WS-B-030** `P3` `ponytail:yagni` hypothesis. Generated `cn-tables.ts` is committed per edition.
  - Where: `flavors/*/lib/cn-tables.ts:1` (header: generated by `bun run cn:tables`, do not edit; 13 copies in the repo, 6 in this partition, about 14 KB each; jacquard and mission are byte-identical).
  - Evidence: configs differ per edition, so per-edition output is justified. The question is only whether these could be generated in a prebuild step and gitignored.
  - Cut / replace: owner decision; do not hand-edit generated files. Not counted in net lines.
  - Preserved: the generated output bytes per edition. Accept: `bun run cn:tables` produces the same files from the same configs, so a prebuild step would be a no-op diff before the files are ignored.

- [ ] **WS-B-031** `P4` `ponytail:shrink` hypothesis. Scene root mount skeleton is cloned.
  - Where: `flavors/jacquard/components/scene/scene-root.ts` (104 lines) and `flavors/mission/components/scene/scene-root.ts` (99 lines) differ only by comments, one `INSPECT` pitch range and one `input.movedAt` line after normalising; `flavors/survey/components/scene/scene-root.ts:1-110` has the same `ensureRenderer` / `bindInput` / `mountScene` skeleton (not diffed line by line).
  - Cut / replace: a mount factory in `lib/scene/` taking the inspect range and extra input fields. Per-edition input fields are the risk. net: -60..-120.
  - Preserved: per-edition inspect ranges and input fields. Accept: both editions mount, the canvas appears and a context-loss still falls back to the poster (one smoke check each).

- [ ] **WS-B-032** `P4` `ponytail:shrink` hypothesis. Survey monument and site symbol re-declare shared kits.
  - Where: `flavors/survey/components/scene/glyphs/monument.ts:23-32,45-96,131-151` re-declares the ink and sheet fills and edges with the same polygon-offset block as `glyphs/kit.ts:59-132` (`createInks`), a second two-member `Ink` type, a hand-built `OrthographicCamera` (`glyphCamera`, `kit.ts:164-182`) and `PER_PX = 1.4`, `FRICTION = 0.92`, `LEAN = 8` equal to the `createTurntable` defaults (`kit.ts:203-209`). Also `flavors/survey/components/relief/sheet-map.tsx:58-100` (local `SiteSymbol`, map coordinates) vs `flavors/survey/components/projects/site-symbol.tsx` (exported `SiteSymbol`, same status-to-shape mapping at another scale).
  - Cut / replace: build the monument on `glyphInks()`, `glyphCamera()` and the turntable defaults, keeping only the dashed material, the pad and the solid cache; check the camera look-at (4.5 vs `lookY`). For the symbol, derive both from one path table with a size parameter. net: -25..-60.
  - Accept: monument and map symbols render pixel-equivalent in a browser check.

#### Deslop findings (not complexity)

- [ ] **WS-B-033** `P4` `deslop:comment` hypothesis. `flavors/mission/components/lab/use-accent.ts:5-11`.
  - Evidence: the comment says "Madder" and the server fallback colour `rgb(155,45,59)` / hue 10 equals Jacquard's madder, while the live accent is `var(--color-signal)` (`:13`). Looks like copy-paste residue; whether the SSR fallback differs from the real `--color-signal` light value is unverified.
  - Cut / replace: fix the comment; align the server accent to the `--color-signal` light value if they differ. net: 0.
  - Accept: the server-rendered accent equals the live one on first paint.
  - Preserved: the live accent after hydration.

- [ ] **WS-B-034** `P4` `deslop:style` confirmed. `flavors/press/components/command/command-trigger.tsx:8-9` is missing the one-line doc comment every sibling edition's trigger carries and has no blank line between `preloadDialog` and the component. Add them. net: +1. Preserved: runtime behaviour (comment and whitespace only). Accept: `bun run lint` and `bun run fmt:check` pass.

- [ ] **WS-B-035** `P4` `ponytail:shrink` confirmed. Same-meaning helpers written once elsewhere: `flavors/jacquard/components/work/threads.tsx:7` and `flavors/press/components/work/press-log.tsx:10` define identical `pct`, and `flavors/press/components/site/scene-poster.tsx:25,55` writes the sheet path `M0 0H260V150L190 230H0Z` twice. Hoist the path to a const (net: -1). Leave `pct` alone unless a third caller appears (two copies is below the threshold). Preserved: the drawn sheet outline and the percentage strings. Accept: the poster and the log render identically; `rg "M0 0H260V150L190 230H0Z" flavors/press` shows one literal.

- [ ] **WS-B-036** `P4` `ponytail:shrink` hypothesis. Theme resolution is re-derived.
  - Where: `flavors/press/lib/interaction/plate-swap.ts:7-12`, `flavors/drawing-set/lib/interaction/theme-reveal.ts:10`, `lib/command/standard-actions.ts:41`, `lib/lab/accent.ts:37` (and minimal, surface, timetable). Each maps `system` to `light|dark` with `matchMedia`.
  - Cut / replace: export `resolveTheme(theme)` from a non-script module under `lib/prefs/`. Do not touch the pre-paint path (`lib/prefs/standard.ts:99`), which must stay self-contained. net: -8..-14.
  - Preserved: resolved theme values for each caller. Accept: a unit test of `resolveTheme` for `light`, `dark` and `system` with both OS settings; plate swap and theme reveal still choose the same target.

- [ ] **WS-B-037** `P4` `ponytail:shrink` hypothesis. `flavors/mission/lib/trajectory.ts:66-67` (`plotFor`'s local `X(t)`) repeats `xAt(plot, t)` at `:114-118`. Reuse it by building the plot header first. Covered by the existing trajectory tests (not read). net: -4. Preserved: plotted trajectory coordinates. Accept: the existing trajectory tests pass unmodified.

- [ ] **WS-B-038** `P4` `ponytail:shrink` hypothesis. `flavors/press/components/home/hero.tsx:22-28` and `flavors/press/components/site/sheet-frame.tsx:26-32` hold two module-scope `Intl.DateTimeFormat("en-GB").format(new Date()).replaceAll("/", ".")` constants that differ only in year width. Merge into one helper in `flavors/press/lib/proof.ts`. net: -6. Separate question, unverified: a module-scope `new Date()` is evaluated at server start or build, not per render; confirm the route's caching and move it inside the component only if per-render is intended. Preserved: the displayed date strings. Accept: both places show the same text for the same date; if the staleness question is confirmed, a test or build note records the intended behaviour.

#### Incidental (out of the reviewed code's complexity scope, with evidence)

- [ ] **WS-B-I01** `incidental` Copy typo: `flavors/calibre/components/ask/composer.tsx:279` reads "goes in a engraving"; should be "an engraving" (grep shows no other site).
- [ ] **WS-B-I02** `incidental` Stale existing TODO claim: the open item at `docs/TODO.md:94` ("SceneMonitor logic copied") says Drawing Set / Timetable `world.tsx` duplicate the shared `SceneMonitor`. Both files now import and render it (`flavors/drawing-set/components/scene/world.tsx:57,1055`, `flavors/timetable/components/scene/world.tsx:46,435`), so the item looks done; the existing item was not edited here, a maintainer should confirm and tick it.
- [ ] **WS-B-I03** `incidental` Stale docs: `docs/flavors/README.md:148` says "the Drawing Set wires drei's `PerformanceMonitor` in its own `world.tsx`", but `flavors/drawing-set/components/scene/world.tsx` has no `PerformanceMonitor` reference and renders the shared `SceneMonitor` (`:57,1055`), whose file `components/semantic/scene/scene-monitor.tsx:29` is the only drei `PerformanceMonitor` user in the code searched. Update the README sentence.

#### Considered and left alone (no item)

- `flavors/*/lib/cn-tables.ts` content is generated; no line-level findings.
- The 0.9 ellipse factor in `flavors/survey/components/scene/shaders.ts:52` mirrors `props.ts:321` on purpose (GLSL and JS must agree).
- `flavors/drawing-set/lib/prefs-script.ts` builds its own pre-paint script because of the accent keys; the self-contained constraint justifies it.
- Security checks (`safeHref`, `isExternalHref`, `EXTERNAL_REL` usage, owner gates) were kept as justified; the one smoke test per area suggested above is the minimum, and no test removal is proposed.
- `lib/scene/inspect.ts:81` spring (exp-decay form) is not a duplicate of WS-B-003's fixed-step spring.

## Needs the owner

- [ ] Seed the new Sanity project (`mfx2gwza`) with the seed script from the cloud session, or allow `*.api.sanity.io` in the environment's network settings so an agent can.
- [ ] Device checks: Safari after clearing the site's HSTS once; iPhone haptics on toggles (iOS 18 or later, System Haptics on); command menu scrolling on iPhone; Timetable, Drawing Set and Survey 3D on a real GPU.
- [ ] Minimal's texture picker stays at None by default (every texture animates forever); say if you want one on.
- [ ] The final gate before merging `portfolio-3d` to `master`.

## Done recently (for context)

Editions Maquette, Flight Plan and Calibre went live; shared dialog, scroll and switch fixes; link hardening; edition e2e and axe coverage; Drawing Set flicker fixes and destination tags; Timetable and Drawing Set on the shared viewport canvas; blit engine fixes and Survey glyphs; iOS switch haptics; identity from the profile with the `NEXT_PUBLIC_OWNER_BRANDING` flag; `NEXT_PUBLIC_FLAVOR` single-edition mode; every Customize option on by default; the Press 3D identity fix.

## Completed (completion remarks, verification evidence summaries, caveats)

- **Wave 4 Minimal (M-S4 to M-S8):** landed. Glyph kit, home, projects, work, now, changelog, ask, resume, owner, 404, lab. Evidence: `docs/flavors/minimal.md` last verified `fb140d3`; scene tier `auto` works; no binary evidence in repo.
- **Wave 4 Drawing Set (slices 7 to 9):** landed. Six tracked views, seven glyph kinds. Caveat: `/ask` scene slot partly under dock at mobile scrollY 0 (P2, unverified, needs phone-width pass).
- **Wave 4 Timetable (slices 8 and 9):** landed. Caveat: 3D not fully built; deferred slice 7 slot extras (P2).
- **Wave 4 Press (P-5 set A and P-6 set B):** landed. Caveat: paginated `/ask/page/[page]` has no press slot; thread loupe/corrected sheet only checked without published queries.
- **Wave 4 Surface (slices 7 to 10):** landed. Bench refactor, 14-part library, 13 placement pages. Caveat: trim-pot row not built; `/ask/[slug]` 3D lamp only on permalink page.
- **Wave 4 Survey (slices 9 to 11):** landed. Blit glyph set P2, J2, W2, N2, K2/E2, R2, O1, L2, H2/A2, T2 grid. Caveat: runtime tier step-down missing (no `PerformanceMonitor` or `SceneMonitor`); docs not re-verified since 2026-09-27.
- **Inspect wiring (all editions):** done. Caveat: small slots (< 100px) not wired; need owner decision (P2-P3).
- **Wave 5 final pass:** budget, accessibility, print hides, CLS ~0, axe 396 run 387 passed. Caveat: SwiftShader (no GPU) so performance scores below real device; Lighthouse CI still open; three desktop-survey timeouts; Survey home at 3 fps under SwiftShader; font-swap CLS residuals up to 0.0057 on Survey and Calibre home at 1440.
- **Identity / docs refresh (2026-09-27, `b50faeb`):** `docs/flavors/README.md` verified; `docs/architecture/architecture.md`, `docs/guides/ask.md`, `docs/guides/sanity.md`, `docs/guides/m2-scene-spec.md`, `docs/reference/prose-notes.md`, `docs/flavors/press.md`, `docs/flavors/surface.md`, `docs/flavors/timetable.md`, root `README.md` verified. Caveat: `docs/flavors/design.md` and `docs/flavors/survey.md` not re-verified (other lanes editing); `docs/flavors/minimal.md` and `docs/flavors/drawing-set.md` not explicitly mentioned as re-verified in archive.
- **Shared motion / scene fixes:** font stand-ins (`lib/fonts.ts`, `styles.css`) fixed `/work` reduced-motion shift; 404 double header fixed (Minimal no longer renders its own header/footer). Caveat: GSAP ScrollTrigger idle ticker still running (needs sleep check); hidden-ancestor 0x0 view may stay blank (workaround in Timetable ask validator).

Evidence is text-only; binary evidence (screenshots, recordings) is stored outside the repo under `/Users/rajput-hemant/Desktop/firstmate/data/` per the captain's authorization and is not committed. No binary evidence exists in this repository; if any appears it must be removed with `git rm` and an ignore rule added.

## Documents ready to archive once confirmed in TODO.md

These verification/review documents have every item demonstrably captured in this TODO.md; once the owner confirms each open item is recorded above, they may move to `docs/archive/` in a future pass:

- `docs/archive/reviews/improvements-audit-2026-09-27.md` (all backlog items captured in open items above; M5/M6 remain open but are listed)
- `docs/archive/reviews/performance-audit-2026-09-27.md` (budget failures, AVIF posters, cache-components preflight captured in open items and budget notes)
- `docs/archive/reviews/redundancy-audit-2026-09-27.md` (shared vs edition rules restated in `docs/flavors/README.md`)
- `docs/archive/reviews/shared-code-review-2026-09-26.md` (19 steps in code; remaining items captured in open items)
- `docs/archive/plans/plan-2026-09-26.md` (milestones M0-M2 built; M3-M6 open but captured in open items above)
- `docs/archive/plans/redundancy-plan-2026-09-27.md` (landed in `2a5f42a..b71fb63`; remaining items captured)
- `docs/archive/plans/m1-conventions-2026-09-26.md` and `m1b-drawing-set-2026-09-26.md` (superseded by `docs/flavors/README.md` and edition docs)
- `docs/archive/handoff/portfolio-3d-handoff-2026-09-26.md` and `edition-refactor-handoff-2026-09-27.md` (superseded by `docs/handoff/open-items-2026-09-27.md` and this TODO)
- `docs/handoff/cloud-handoff-2026-09-27.md` (current open rules restated in `docs/flavors/README.md` and this TODO)
- `docs/handoff/open-items-2026-09-27.md` (all open/deferred items carried forward are listed above)

Not archived now: verification/review ledgers (`docs/verification/verification-issues.md`) and current handoffs (`docs/handoff/open-items-2026-09-27.md`, `docs/handoff/cloud-handoff-2026-09-27.md`) because open verification gaps and owner decisions remain open.
