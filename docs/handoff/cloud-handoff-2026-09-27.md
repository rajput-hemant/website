# Portfolio 3D: cloud handoff (2026-09-27, evening IST)

Repo: https://github.com/rajput-hemant/website (public). Work branch: `portfolio-3d`, tip `f66f32a`. Base branch `master` (`d1c8975`) is an ancestor, and `portfolio-3d` is 119 commits ahead. The merge to `master` is a fast-forward, and only the owner decides it.

## Read first (all on `portfolio-3d`)
- `AGENTS.md` / `CLAUDE.md`: Next 16 notes. Read `node_modules/next/dist/docs/` before writing Next code.
- `docs/flavors.md`: the editions architecture and its rules. It's the most important doc.
- `docs/handoff/`:
  - `improvements-audit.md`: the design, animation, sound and 3D plan for all six editions, with a ranked backlog in section 3, slices and waves in section 4, and a per-edition appendix A–F with each palette's recipe in section 5.
  - `performance-audit.md`: today's performance findings.
  - `portfolio-3d-handoff-2026-09-26.md`: the older project handoff; parts of it are stale, see "Stale docs" below.
  - `edition-refactor-handoff.md`
- `docs/mocks/`: the 10 design mocks (HTML + md) plus `BRIEF.md`.
- `docs/redundancy-audit.md`, `docs/redundancy-plan.md`: the shared-code rules. Shared code never imports `flavors/*` and never switches on edition identity.

## Owner rules (non-negotiable)
- **Commits:** conventional, lowercase, no co-author or AI trailers, no em dashes.
  - Commit with `--no-gpg-sign --no-verify`.
  - Push only `portfolio-3d`. Never open PRs; never merge to `master` without the owner's word.
- **Gates:**
  - Never silence one: no disabling or downgrading lint rules, no casts or non-null assertions to pass, no `ignoreBuildErrors`.
  - A genuinely wrong rule is disabled inline, one at a time, with a reason.
- **Next.js:**
  - React Compiler on, strict TS, typedRoutes OFF (plain string hrefs), T3Env for env vars, and the build must succeed with no env values.
- **UI:**
  - shadcn/ui components and their CSS variables are never edited; restyle at call sites or in app-owned wrappers.
  - No Radix, except `cmdk` and its transitive Radix.
  - Every edition keeps its custom edition-styled scrollbars.
  - Light/dark only, following the OS; an explicit choice wins.
- **Reviews:**
  - Every change gets an independent review (a bug pass and a security pass) before it lands.
  - Reviewers report and never fix.
  - A bug fix goes at the root cause, with a test wherever an executable contract exists.
- **Sound:**
  - Opt-in, off by default, synthesized via the shared engine (no samples unless a listening test fails).
  - Per-edition recipes live in `flavors/<id>/lib/sound/voices.ts`.
  - Stamp and pencil sounds are exclusive: see audit section 2.2.
- **Dependencies:** prefer a widely used lightweight package over hand-rolled code.

## Done today (on `portfolio-3d`)

| Commit | What |
|---|---|
| `2a5f42a..b71fb63` | The edition redundancy refactor, squashed into 5 commits. Visual parity with the original site was restored and scrollbars came back on Minimal, Drawing Set and Surface. |
| `e23a4dc`, `f250b8d` | The shadcn `cn` package replaces clsx + tailwind-merge in all 6 editions, with behaviour identical. |
| `857aea3`, `0f5ed48` | Wave 0 for Surface and Press. |
| `36160ea` | The shared voice engine S1: `Voice`/`playVoice`, limiter, compressor, hidden-tab suspend, `voiceFor`/`onToggle`/`data-voice`. Today's tick sound is kept. |
| `4d066fd..f26f631` | Wave 0 for Survey and Minimal. |
| `2dd02ee`, `5f547a8` | Wave 0 for Drawing Set and Timetable. The shared `use-command-menu.ts` now carries both `onWillOpen` and `instant`. |
| `f66f32a` | The docs in `docs/handoff/`. |

What Wave 0 covered in each edition:
- **Surface:** sound suspends on mute and hidden tab; the knob spring is frame-rate independent via `frame-loop.ts`; the keyboard-opened ⌘K opens without animation.
- **Press:** the peel page turn is gated on motion; button press scale fixed.
- **Survey:** the theme crossfade lands in step with the 3D; frame-rate-independent springs; flight timing fixed.
- **Minimal:** a `scene` preference with a Customize "3D" row; motion-token drift fixed.
- **Drawing Set and Timetable:** hover, slot, map, popover, ⌘K and theme-reveal fixes.

## In flight: NOT on the remote
- **Strict Next config (`fm/portfolio-next-strict`):**
  - Where it is: a LOCAL branch on the owner's machine, being finished there by a worker; it is on no remote.
  - What it does: enables React Compiler, the strict TS flags (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`) and type-aware ESLint (`recommendedTypeChecked`); 4 commits across about 196 files.
  - Review findings already fixed:
    - a rename that corrupted the Minimal copy-email screen-reader text
    - one unjustified cast in `pending-messages.test.ts`
  - Remaining: fold the fixups, keep `.opencode/` out of all project config, rebase onto `f66f32a`, then a re-review.
  - If it has not landed on `portfolio-3d` when you start: check `git log origin/portfolio-3d` for commits "chore(portfolio): enable strict next and typescript toolchain" and "fix: satisfy exactOptionalPropertyTypes across portfolio". If they are absent, redo the task from scratch on the current tip, and grep your diff for identifiers leaking into string literals.

## Agreed but not started (owner-approved)
1. **Press sound palette:** audit appendix F section 5, six voices: platen kiss, rubber stamp, register pins, sheet feed, paper flex, plate swap. The owner stopped the first attempt before any code; start fresh.
2. **Timetable sound palette:** audit appendix D section 5 and slice 5: flutter synced to flap steps, enamel tap, validator clunk, relay, chime, ring. Reduced motion turns the flutter into one thunk. Start fresh.
3. **The other four palettes** (Minimal, Drawing Set, Surface, Survey): audit section 2.2 and appendices A, B, C and E section 5. They follow the audit plan's Wave 1 and weren't separately approved; confirm with the owner.
4. **Waves 2–5 of the audit:**
   - more than one interactive 3D element per page
   - the shared tracked-view engine S2
   - blit glyphs S3
   - motion polish
   - the owner's ask for per-page 3D and interactivity

   These are the "finalize the flavors" work. Go edition by edition using each appendix's section 7 slices.
5. **Performance: NOT complete.** The audit is done (`docs/handoff/performance-audit.md`), but no fixes have started. The measured JS budget failures (home, gzip, ceiling 180 KB) are Minimal 276 KB, Drawing Set 187 KB and Survey 183 KB.
   - Fixes in priority order:
     1. Move the Zod/T3Env validation to server-only (91 KB on Minimal).
     2. Load Three.js only when the scene nears the viewport (Drawing Set, Timetable, Survey).
     3. Drawing Set leader lines: update attributes instead of rewriting `innerHTML` every frame.
     4. Press hover texture re-upload.
     5. Surface relief mesh (about 95k vertices).
     6. Then the low-impact items in the report.
   - Caveat: the trace part of the audit is weak, since it compared trace file sizes. Measure LCP, TBT and INP before and after each fix.
6. **Owner device check:** iOS Safari tap sounds (`PointerEvent.pointerType` on touch).
7. **Doc fix:** `docs/m1-conventions.md` still names clsx and tailwind-merge; it should name `cn`.
8. **Before the owner merges to `master`:** a full `bun run build` plus `bun run budget` on the final tip, and a browser smoke test of every edition's home and one inner page (zero console errors or warnings).

## Stale docs: the next session's cleanup task
The owner wants outdated docs moved into an archive folder and every doc named with a date or version, so the newest version is obvious. Candidates to inspect, not yet verified:
- `docs/handoff/portfolio-3d-handoff-2026-09-26.md`: it describes the old checkout and worktrees, session-1/2 state, and MonoCode worktrees. Merge anything still true into a new dated handoff, then archive it.
- `docs/plan.md`, `docs/m1-conventions.md`, `docs/m1b-drawing-set.md`, `docs/m2-scene-spec.md`: milestone-era docs; check them against the code (`m2-scene-spec` has one known stale bullet).
- `docs/shared-code-review.md`, `docs/redundancy-plan.md` vs `docs/redundancy-audit.md`: check for overlap now that the refactor has landed.
- `docs/handoff/improvements-audit.md` quotes line numbers from `b71fb63`; mark its date and base commit rather than editing its content.

Before archiving any partial handoff, confirm every open item in it is either done (cite the commit) or carried into the new handoff.

## Other state
- **Removed branch:** `portfolio-no-radix`, an old separate branch; the owner said never review or merge it. The refactor already removed direct Radix.
- **Owner's local copy:** stale refactor stashes and the branch `refactor/edition-sharing-audit` were deleted. Five pre-refactor stashes (feat/v2, v/0.2.0, 2023) are kept pending the owner's word.
- **Deferred:** a `THREE.Clock` deprecation warning is accepted until @react-three/fiber 10 is stable (a held task).
- **Sanity:** project `y9f5m131`, dataset `production`, shared with other branches, so schema changes must be additive. Never copy `.env*` or secrets.

## Suggested skills
- `vercel-react-best-practices` and the Next.js skills (for example `next-cache-components-optimizer`) for all Next and React work.
- `find-animation-opportunities` for the Wave 5 motion polish.
- `review-bugbot` and `review-security`, or equivalent passes, for independent reviews.
- `chrome-devtools-axi` for browser confirmation and performance traces: headed, one instance, close it after.
- `ponytail`: the owner favours the smallest root-cause diff.
- `handoff` at session end.
