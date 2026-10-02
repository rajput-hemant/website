# Website verification issues

Status: DRAFT ledger, 2026-10-02, base `e271043` on `portfolio-3d`, branch `fm/website-pstack-verification`. This is the one issue ledger for the website's verification. The skill at [.agents/skills/verify](../../.agents/skills/verify/SKILL.md) and its [feature map](../../.agents/skills/verify/features/README.md) link here and do not repeat it. The product backlog stays in [docs/handoff/todo.md](../handoff/todo.md); entries below only restate a todo item when verification needs a ruling on it.

No browser, Playwright, `next dev` or `next-dev-loop` run has happened (browser hold, captain's rule 2026-10-02). Nothing below is a live PASS. A feature with no live run is a GAP, never PASS. Every feature file carries `Last live proof: none`.

## Rules

- CONFIRMED needs a command or `file:line` a reader can re-run. Anything inferred from source only is a HYPOTHESIS. A feature with no live run is a GAP.
- Fields per entry: Class, Severity (blocker, high, medium, low), Surface, Evidence, Repro, Expected, Actual, Verification gap, Follow-up, Status (open, fixed with commit, wontfix).
- When a live run happens, add its evidence path to the entry and to the feature file's `Last live proof:` line; never edit an entry to say "verified" without that path.

## Non-browser checks run for this ledger

| Check              | Command                                                                  | Result                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Identity hygiene   | `bun run check:identity`                                                 | exit 0, "No hardcoded identity leaks found." Proves source hygiene only.                                                                                     |
| Formatting of docs | `bunx prettier --check docs/handoff docs/redundancy-audit-2026-09-27.md` | warns on `docs/handoff/improvements-audit-2026-09-27.md`, `docs/handoff/performance-audit-2026-09-27.md`, `docs/redundancy-audit-2026-09-27.md` (see WEB-C6) |
| Helper syntax      | `bash -n` on both scripts under `.agents/skills/verify/scripts`          | clean; the scripts have never been run against a server (WEB-G11)                                                                                            |

Not run, and why: `bun run lint`, `bun run type-check`, `bun run test` (not needed to write the draft; baseline at `e271043` is unknown, WEB-G10), `bun run build` and `bun run test:e2e` (build is part of the launch recipe and e2e is browser automation).

## Confirmed

## WEB-C1 Docs disagree on the Sanity project

Class: CONFIRMED
Severity: low Surface: docs, CMS prerequisites
Evidence: `grep -n "y9f5m131\|mfx2gwza" docs/sanity.md docs/flavors.md docs/handoff/todo.md` returns `docs/sanity.md:11` and `docs/flavors.md:91` naming `y9f5m131`, and `docs/handoff/todo.md:70` naming a new project `mfx2gwza` that "needs seeding".
Repro: 1) run the grep above.
Expected: one project id across the live docs.
Actual: two ids; which one the owner means to use is not recorded.
Verification gap: which project holds the real content, and whether it is seeded, cannot be checked without credentials and is out of scope.
Follow-up: owner confirms the id; then fix the other docs. Until then no run may use either project.
Status: open

## WEB-C2 TypeScript is pinned to 6.0.3 on `portfolio-3d`

Class: CONFIRMED
Severity: low Surface: tooling
Evidence: `package.json:59` has `"typescript": "6.0.3"`; `docs/handoff/todo.md` (Tooling follow-up) says `master` carries TypeScript 7 with a red ESLint until typescript-eslint supports 7.
Repro: 1) `grep -n '"typescript"' package.json`.
Expected: n/a (a deliberate pin).
Actual: type-check and lint results from this branch do not transfer to `master`.
Verification gap: none for the pin itself.
Follow-up: unpin when typescript-eslint supports 7 (owner item).
Status: open

## WEB-C3 The Playwright config reuses any server on port 3020

Class: CONFIRMED
Severity: low Surface: e2e harness, launch
Evidence: `playwright.config.ts:118` `reuseExistingServer: !isCI`; the same file builds and starts on port 3020 (`PORT = 3020`).
Repro: 1) start any server on 3020 outside CI; 2) run `bun run test:e2e` after the hold lifts.
Expected: the suite tests the build under verification.
Actual: it silently tests whatever answers on 3020, including a stale or env-configured server.
Verification gap: not exercised (browser hold).
Follow-up: `serve.sh` refuses ports 3000 and 3020; when e2e is allowed, confirm 3020 is free first.
Status: open

## WEB-C4 Nine editions run only three specs

Class: CONFIRMED
Severity: medium Surface: e2e coverage, reduced motion, keyboard, layout
Evidence: `playwright.config.ts:17-21` (`EDITION_SPECS` is `editions`, `a11y`, `command-dialog`) and `playwright.config.ts:24-26` (`sharedShellEditions` is every live edition except Minimal and Drawing Set). Minimal-only specs skip other editions through `editionFromTestInfo(testInfo) !== "minimal"` (for example `e2e/motion.spec.ts:12`, `e2e/lab.spec.ts:10`, `e2e/ask.spec.ts:13`, `e2e/print.spec.ts:6`).
Repro: 1) read the two ranges above; 2) `grep -n 'editionFromTestInfo(testInfo) !== "minimal"' e2e/*.spec.ts`.
Expected: reduced-motion, lab isolation, ask, print, overflow and scene behavior asserted for every edition, or recorded as uncovered.
Actual: Surface, Timetable, Survey, Press, Darkroom, Jacquard, Maquette, Flight Plan and Calibre are asserted only for routes with one h1, the edition 404, the command menu, Customize theme, the header theme toggle, and axe (light and dark, reduced motion on). Drawing Set has its own deeper spec.
Verification gap: the live behavior of everything outside those assertions is unproven (WEB-G1 to WEB-G4).
Follow-up: the feature map drives those paths per edition once the browser skill is supplied.
Status: open

## WEB-C5 Ten editions enable the visitor counter on a weaker condition than Minimal

Class: CONFIRMED
Severity: low Surface: visitor counter, `/api/visits`
Evidence: `flavors/minimal/components/site/site-footer.tsx:61` passes `enabled={isVisitCounterConfigured()}` (project id, Editor token and `ASK_COOKIE_SECRET`, `lib/visits/store.ts:59`). The other ten footers pass `enabled={isSanityConfigured}` (project id only), for example `flavors/calibre/components/site/site-footer.tsx:76` and `flavors/surface/components/site/site-footer.tsx:66`.
Repro: 1) `grep -rn "enabled={isSanityConfigured}" flavors/*/components/site/site-footer.tsx`.
Expected: the client never calls an endpoint that can only answer 503 (the stated purpose of `isVisitCounterConfigured`).
Actual: with a project id but no Editor token, ten editions request `/api/visits` and get 503; Minimal does not.
Verification gap: not observed live. On fallback content (no project id) all eleven stay off, which is the run this skill prescribes.
Follow-up: owner or a code lane aligns the condition; not a verification task.
Status: open

## WEB-C6 Docs fail `fmt:check`

Class: CONFIRMED
Severity: low Surface: docs formatting
Evidence: `bunx prettier --check docs/handoff docs/redundancy-audit-2026-09-27.md` warns on three files (table above); `docs/handoff/todo.md` follow-up "Documentation formatting" already records it.
Repro: 1) run the command above.
Expected: clean.
Actual: three warnings.
Verification gap: none.
Follow-up: todo item 10 (repo-wide Prettier pass).
Status: open

## Hypotheses

## WEB-H1 `/work` at 390 under reduced motion shifts layout by 0.122

Class: HYPOTHESIS
Severity: medium Surface: Minimal `/work`, mobile, reduced motion
Evidence: `docs/handoff/todo.md:60` (shifts at about 150 ms, timeline text moves down 20 px, likely the font swap, with or without WebGL). Not reproduced here.
Repro: 1) Pixel 7 profile, `prefers-reduced-motion: reduce`; 2) load `/work`; 3) read layout-shift entries.
Expected: CLS at or under 0.05 (`docs/flavors.md` budget).
Actual: reported 0.122.
Verification gap: needs a browser; the cause is unknown.
Follow-up: feature file `motion-and-a11y.md`, "Overflow and CLS".
Status: open

## WEB-H2 Minimal's 404 renders two site headers

Class: HYPOTHESIS
Severity: low Surface: Minimal edition 404
Evidence: `docs/handoff/todo.md:61`; source comment in `app/f/minimal/not-found.tsx` ("Renders outside the (site) group, so it brings its own header and footer") while the root layout adds one.
Repro: 1) load `/does-not-exist` in Minimal; 2) count banner landmarks.
Expected: one header.
Actual: two, per the todo note.
Verification gap: needs a browser; `e2e/editions.spec.ts` asserts the edition 404 but covers the nine shared editions, not Minimal.
Follow-up: `edition-minimal.md`, "Edition 404".
Status: open

## WEB-H3 The e2e note about `/api/visits` and `networkidle` may be stale

Class: HYPOTHESIS
Severity: low Surface: e2e helper, visitor counter
Evidence: `e2e/support/site.ts` (comment on `gotoSettled`) says the 503 keeps `networkidle` unreachable on every page; the footers send no request when Sanity is unset (`enabled` is false, WEB-C5).
Repro: 1) on the fallback build, record network requests on any edition page and look for `/api/visits`.
Expected: none made.
Actual: unknown.
Verification gap: needs a browser.
Follow-up: if confirmed, the bounded wait in `gotoSettled` hides nothing and the comment can be corrected by its owner.
Status: open

## WEB-H4 The command menu dialog has no `aria-modal`

Class: HYPOTHESIS
Severity: low Surface: command menu, accessibility
Evidence: `docs/handoff/todo.md:53` (Base UI's modal Dialog sets none; scroll containment relies on the body lock).
Repro: 1) open the command menu; 2) read the dialog's attributes and the screen reader's modal behavior.
Expected: background content is inert to assistive tech while the dialog is open.
Actual: unknown.
Verification gap: needs a browser and a screen reader or accessibility tree read.
Follow-up: `motion-and-a11y.md`.
Status: open

## WEB-H5 Surface and Survey scene claims may describe unfinished slices

Class: HYPOTHESIS
Severity: medium Surface: Control Surface and Field Survey 3D
Evidence: `docs/handoff/todo.md` items 6 and 7 (`lane/w4-surface` in progress, `lane/w4-survey` paused with a `wip` commit; "three React hosts" pending). Those lanes' code is preserved and untouched by this task.
Repro: 1) after the lanes land, re-read the two edition files and `scene-states.md`.
Expected: the map matches shipped scene code.
Actual: the map was written against code that is still moving.
Verification gap: everything about both scenes.
Follow-up: refresh `edition-surface.md` and `edition-survey.md` when their lanes land.
Status: open

## WEB-H6 A lost WebGL context leaves the scene off until reload

Class: HYPOTHESIS
Severity: low Surface: scenes on the shared session and plain-three roots
Evidence: `lib/scene/session.tsx:333` registers `fail`, which sets `tier` and `maxTier` to 0 (`session.tsx:320`); `flavors/jacquard/components/scene/scene-root.ts:28`, `flavors/mission/components/scene/scene-root.ts:28` and `flavors/survey/components/scene/scene-root.ts:25` do the same; the blit engine (`lib/scene/blit.ts:147`) restores on `webglcontextrestored`.
Repro: 1) on a live scene call `WEBGL_lose_context.loseContext()`; 2) watch the poster and `html[data-scene]`; 3) call `restoreContext()`.
Expected: the poster returns without an error overlay (source agrees); whether the scene may come back without a reload is a product choice.
Actual: per source, off until reload on those paths; unobserved.
Verification gap: needs a WebGL2 browser.
Follow-up: `scene-states.md`, "Failure".
Status: open

## WEB-H7 Edition follow-ups in `todo.md` are unverified reports

Class: HYPOTHESIS
Severity: low Surface: per edition
Evidence: the Follow-ups section of `docs/handoff/todo.md` (Timetable DPR and sharpness, Calibre jewel hover and crowded tags, Darkroom frame-tag flicker, Maquette filled Ask card, Press thread loupe, Minimal thread glyphs, Drawing Set DPR and MSAA, others).
Repro: each edition file's Gotchas line names the item that applies.
Expected: each is either reproduced and fixed or closed.
Actual: none re-checked here.
Verification gap: all need a browser, several need a real GPU or real questions.
Follow-up: owner decides which to verify first; the todo stays the backlog.
Status: open

## Live-proof gaps

Every gap below has the same reason: no browser run is allowed yet. The feature files name the exact recipe.

## WEB-G1 Edition shell, per edition, at both viewports

Class: GAP
Severity: medium Surface: all eleven editions
Evidence: none live. Cited e2e (`editions`, `a11y`, `command-dialog`, plus the Minimal and Drawing Set specs) was not run for this ledger.
Repro: `features/edition-<id>.md`, Entry through Command menu.
Expected: entry, routes, 404, theme, Customize and command menu behave as the specs assert, on desktop 1440 and Pixel 7.
Actual: unproven by this task.
Verification gap: live run of eleven editions times two profiles.
Follow-up: first run after the browser skill arrives; flip a feature's status only with evidence.
Status: open

## WEB-G2 Scenes, loading and error states

Class: GAP
Severity: medium Surface: `scene-states.md`, every 3D edition
Evidence: none live. Unit tests exist for tiers, store, clock and loader; no e2e asserts a live frame (WEB-C4); Control Surface has its own knob loop.
Repro: `features/scene-states.md`.
Expected: poster, lazy load, live handoff, step-down, tier 0 and failure as described.
Actual: unproven.
Verification gap: needs WebGL2 hardware for tier 1 and 2, and a no-WebGL profile for tier 0; real GPU checks are also owner items in `todo.md` ("Needs the owner").
Follow-up: record tier signals with each proof.
Status: open

## WEB-G3 Reduced motion across the nine shared-shell editions

Class: GAP
Severity: medium Surface: reduced motion
Evidence: WEB-C4. Only axe runs with reduced motion on for those editions.
Repro: `features/motion-and-a11y.md`, "Reduced motion".
Expected: `html[data-motion]` is `off`, nothing endless, content visible, scene on its reduced path.
Actual: unproven.
Verification gap: live run per edition.
Follow-up: see the feature file.
Status: open

## WEB-G4 Keyboard operation, focus and accessibility names

Class: GAP
Severity: medium Surface: all editions
Evidence: none live. The skip-link spec is Minimal-only (`e2e/navigation.spec.ts`).
Repro: `features/motion-and-a11y.md`, "Skip link" and "Keyboard tour".
Expected: skip link first, visible focus, Escape returns focus, no traps.
Actual: unproven; axe passing is not a keyboard test.
Verification gap: live run.
Follow-up: see the feature file.
Status: open

## WEB-G5 Identity in scenes and metadata

Class: GAP
Severity: medium Surface: `identity-profile.md`
Evidence: unit tests (`lib/data/__tests__/identity.test.ts`) and `bun run check:identity` (passed, table above) cover resolution and source hygiene only.
Repro: `features/identity-profile.md`.
Expected: the same identity in DOM text, live scenes, posters, titles, OG images and mirrors.
Actual: unproven. Renaming the whole site through another person's profile has no fixture and cannot be driven without changing owner content.
Verification gap: a disposable fixture profile does not exist.
Follow-up: needs a decision on how to supply a fixture (not owner content, not a CMS write).
Status: open

## WEB-G6 CMS-backed behavior

Class: GAP
Severity: medium Surface: `cms-prerequisites.md`
Evidence: none. The fallback-only 503 behaviors are derived from source (`lib/visits/handler.ts`, `lib/ask/submission-route.ts`, `app/api/revalidate/route.ts`, `app/api/draft-mode/enable/route.ts`), not observed.
Repro: `features/cms-prerequisites.md`.
Expected: each Sanity-dependent route degrades as the source says.
Actual: unproven; real content, drafts, threads and moderation are out of scope (no CMS writes, no credentials).
Verification gap: a disposable dataset with a read-only token, supplied by the captain, would be needed for anything beyond fallback.
Follow-up: captain decision.
Status: open

## WEB-G7 Pinned single-edition build

Class: GAP
Severity: low Surface: `NEXT_PUBLIC_FLAVOR`
Evidence: `lib/flavor-routing.ts` `routePinned` and its unit tests; no build with the variable has run.
Repro: `features/editions-and-routing.md`, "Pinned build".
Expected: no picker, cookie ignored, other editions redirect 307, `/flavors` is the edition's 404.
Actual: unproven; the helpers do not build it.
Verification gap: a second build and checkout.
Follow-up: do it only if a pinned deploy is planned.
Status: open

## WEB-G8 Performance, CLS and print budgets

Class: GAP
Severity: low Surface: all editions
Evidence: `docs/flavors.md:172` ("Targets not yet enforced"); `bun run budget` covers initial JS and fonts only and needs a build.
Repro: Lighthouse on each edition's home and projects, layout shift on `/work`, print of `/resume` in every edition.
Expected: the documented targets, if the owner confirms they apply.
Actual: unmeasured; print is asserted for Minimal only.
Verification gap: live run; owner confirmation of the targets (todo.md item 9).
Follow-up: wave 5 audit.
Status: open

## WEB-G9 Phone layout and overflow

Class: GAP
Severity: medium Surface: all editions at 390 and 768
Evidence: `e2e/drawing-set.spec.ts` asserts no horizontal overflow at 768 for Drawing Set only.
Repro: `features/motion-and-a11y.md`, "Overflow and CLS".
Expected: `scrollWidth <= innerWidth` on `/`, `/work`, `/projects`, `/lab`.
Actual: unproven for every other edition and width.
Verification gap: live run; real devices (Safari, iPhone haptics, real GPU) are owner items in `todo.md`.
Follow-up: see the feature file.
Status: open

## WEB-G10 Baseline gates at `e271043` are unknown

Class: GAP
Severity: low Surface: `bun run lint`, `type-check`, `test`
Evidence: not run for this task (only `check:identity` and a docs prettier check ran).
Repro: run each on a clean checkout of this branch.
Expected: green, apart from WEB-C2 and WEB-C6.
Actual: unknown here.
Verification gap: serial runs, one Node-heavy job at a time.
Follow-up: run them before the first live drive so a failure is not blamed on a change.
Status: open

## WEB-G11 The launch and doctor helpers never ran against a server

Class: GAP
Severity: medium Surface: `scripts/serve.sh`, `scripts/doctor.sh`
Evidence: `bash -n` only (table above). Doctor ran once with no port; see "Doctor dry run" below.
Repro: `.agents/skills/verify/scripts/serve.sh start 3071`, then `doctor.sh 3071`, then `serve.sh stop 3071`.
Expected: readiness within 60 s, doctor green, stop leaves no listener and keeps evidence.
Actual: unproven, including the claims that `GET /api/visits` is 503 and `GET /` carries an `<h1>` on the fallback build (both from source).
Verification gap: a build and a start were deliberately not run (no server was authorized for this task).
Follow-up: first action of the first live run; fix the helpers there.
Status: open

## Doctor dry run

`.agents/skills/verify/scripts/doctor.sh` with no port, run read-only on the committed branch tree: it printed a clean `head:` line for `fm/website-pstack-verification` and `doctor: worth driving`, exit 0. That covers the tree, env-file and env-variable checks only. The port checks (listener ownership, `/flavors`, `/api/visits`, `<h1>`) have not run (WEB-G11).
