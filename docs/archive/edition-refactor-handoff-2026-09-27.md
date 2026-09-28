# Portfolio edition refactor handoff

> **Archived 2026-09-27.** Kept for history; paths and state below may be out of date. Superseded by `docs/handoff/cloud-handoff-2026-09-27.md` and `docs/handoff/open-items-2026-09-27.md`; the refactor landed as `2a5f42a..b71fb63`. See `docs/archive/README.md`.

## Objective and authority

Continue the redundancy refactor in the `website` repository workspace on `refactor/edition-sharing-audit`. The owner's original requirements are in this conversation and the working architecture/audit are in `docs/redundancy-plan.md`, `docs/redundancy-audit.md`, `docs/redundancy-inventory.tsv`, and `docs/shared-code-review.md`. Read `docs/flavors.md`, `docs/architecture.md`, and the relevant edition docs before source edits. Preserve every edition's visuals and behavior. The owner clarified that `cmdk` and its transitive Radix dependencies are allowed; direct Radix use/declarations should be replaced by Base UI. Local commits are authorized, with conventional lowercase messages, `--no-gpg-sign --no-verify`, no attribution trailers. Never push or touch `fm/portfolio-no-radix` or the accepted `THREE.Clock` warning. Keep one heavy job at a time; unit tests use `--maxWorkers=2`.

The owner later specified that the coordinator should plan and review while other agent sessions implement fixes. The most recent request before this handoff was to have existing sessions peer-review their work and free their worktrees, without creating new sessions. That cleanup is complete. Resume implementation only in line with subsequent user direction.

## Current state

- Progress estimate given to owner: **55%** of the original definition of done.
- `refactor/edition-sharing-audit` is at `b8b5484` and has five reviewed foundation commits after `b66c5a7`: F3 routing, F6 continuity, F5 ask/project loaders, F2 Minimal Base UI dialog, F1 T3Env. The last full integration gate before partial F4 was green: lint, type check, 836 unit tests.
- The root worktree has **uncommitted partial F4 command localization** in shared command files and five edition dialogs, plus uncommitted `docs/redundancy-audit.md`, `docs/redundancy-plan.md`, and `docs/redundancy-inventory.tsv`. Minimal's `hrefForUpdate` call is still missing in root, so current root type checking is expected to fail until that reviewed adapter lands. Do not discard these changes.
- `git worktree list` shows only the root checkout. All temporary agent worktrees were removed without force after checks/reviews; original uncommitted agent states were either already integrated or preserved in named Git stashes. All implementation branches remain local. Nothing was pushed or merged into `portfolio-3d`.
- One agent used `git reset --hard` on the disposable Survey worktree's seeded loader copies during cleanup, contrary to the no-force instruction. The Survey commit/branch and root were verified intact. A different cleanup command was initially rejected by automatic approval review as destructive; a reversible named stash then succeeded.

## Reviewed implementation branches awaiting integration

Each package passed isolated lint, type check, full unit tests and a peer review. They are not yet integrated into root. Review the actual diffs and contracts before integration.

| Branch | Tip | Scope / caveat |
| --- | --- | --- |
| `refactor/edition-final-adapters` | `d3dd73e` | Minimal F4 callback and two Timetable ask OG wrappers. For Minimal, integrate only the callback delta against root's existing Base UI dialog. |
| `refactor/edition-cmdk-deps` | `87e9ed5` | Remove direct Radix declaration; retain `cmdk` and transitive Radix. Its commit also contains seeded F1 package/lock and F2 dialog context, so integrate only the `package.json` and `bun.lock` delta against current root. |
| `refactor/edition-route-bundle` | `f20596e` | Nine Drawing Set, Press, Surface ask/project route files. Includes the corrected Surface `ASK_PAGE_SIZE` import missed by the original surface agent. |
| `refactor/minimal-ask-loader` | `191746a` | Two Minimal ask list routes. |
| `refactor/survey-route-loaders` | `05bdd0e` | Three Survey ask/project routes; relief-backed project body/navigation remains local. |
| `refactor/timetable-route-loaders` | `f233492` | Three Timetable ask/project routes. |
| `refactor/shared-command-menu-hook` | `02de20f` | New headless command-menu hook/test and six local wrapper migrations; local lazy imports and JSX remain. |

The older `refactor/edition-command-localization` branch itself has no commit; its full work is represented by the root's uncommitted F4 files plus Minimal callback in `d3dd73e`. A scoped patch backup exists at `/private/tmp/edition-command-localization-scoped.patch`, but root files are the primary state. The dependency branch commit originally had an automatic Cursor co-author trailer; the listed `87e9ed5` tip has the trailer removed. The other listed tips were likewise checked or rewritten to remove trailers.

## Next work in dependency order

1. Finish F4 by applying the Minimal callback from `d3dd73e`, review the root F4 diff, then commit F4. Integrate Timetable OG wrappers separately. This unblocks root type checking.
2. Integrate the direct Radix `package.json`/`bun.lock` delta and the seven reviewed packages in small logical commits, preserving the above scope caveats. Run lint, type check and full unit tests after each integration, serially. Do not cherry-pick a branch commit that bundles seeded dependencies into an unrelated package.
3. Complete `docs/flavors.md`'s short "How to add a new edition" section, refresh audit/plan/inventory against final code, and verify remaining copies are intentional edition design or required Next route glue. Check unused direct dependencies with evidence before removal; `tw-animate-css` is used by Minimal CSS.
4. Run final lint, type check, unit suite, production build, Playwright e2e, then browser comparison at 390 and 1440 widths in light/dark/reduced-motion across six editions, with browser/server consoles clean. Recreate a temporary checkout of original `portfolio-3d` at `348d13e` for baseline visuals if needed; the earlier baseline worktree was removed as requested.

Do not claim the original definition of done until final checks and visual comparisons pass. The current integration branch is not ready for review or merge.

## Suggested skills

Call the Skill tool for `codebase-design` when reviewing shared-module boundaries, `ponytail:ponytail` for minimal extraction and dependency choices, `vercel-react-best-practices` for React/Next route and hook changes, and `next-dev-loop` for the final runtime pass. `resolving-merge-conflicts` applies only if integration produces an in-progress conflict. Follow `AGENTS.md` and the Next 16 guides in `node_modules/next/dist/docs/` before writing Next code.
