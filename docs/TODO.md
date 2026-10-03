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

## DeSlop and Ponytail Review Findings

Lean already. Ship.
