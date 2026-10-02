---
name: verify
description: Launch, check and drive the portfolio website (Next.js 16, eleven switchable editions, R3F scenes, optional Sanity CMS) to prove a change works in the running site. DRAFT, written from source only and never run live; use it as the verification plan for the web UI, and read docs/checks/verification-issues.md first.
---

# Verify the portfolio website

Status: DRAFT, not live-verified. Last live proof: none. Written 2026-10-02 at base `e271043` from source and the existing Playwright harness. Nothing in this skill has been run in a browser. Do not report any feature as verified because this file describes it.

Browser hold (captain's rule, 2026-10-02): do not start any browser automation (Playwright, chrome-devtools-axi, agent-browser, next-dev-loop, `bun run test:e2e`, `bun run visual-baseline capture`) until the captain supplies the chosen browser skill. The Drive recipes below are written as user actions and observable results, so they run unchanged under whichever skill is supplied. Until then only the non-browser steps (Doctor, Launch readiness over HTTP, gates) may run.

Every open problem, hypothesis and live-proof gap lives in one ledger: [docs/checks/verification-issues.md](../../../docs/checks/verification-issues.md). Feature files link to it and do not repeat it. Read [features/README.md](features/README.md) for the map before driving anything.

## What the surface is

One Next.js 16 app (App Router, `proxy.ts`, static prerendering, React Compiler). Eleven live editions share one content model and one route set; the visitor's edition decides the look. The proxy rewrites `/<path>` to `/f/<edition>/<path>`; `/` shows the picker (`/flavors`) until the `hr_flavor` cookie holds a live edition id. `NEXT_PUBLIC_FLAVOR=<id>` pins a build to one edition. The edition list is `flavors/registry.ts`. The route list per edition is `content/site.ts` `pages` plus `/owner`, `/projects/<slug>`, `/lab/<slug>`, `/ask/<slug>`, `/ask/page/<n>`, `/md/*` mirrors, `/llms.txt`, `/sitemap.xml`, `/robots.txt`.

This is a Next.js with breaking changes. Before touching app code read the matching guide in `node_modules/next/dist/docs/` (the repo's AGENTS.md says so).

## Existing harness (reuse, do not duplicate)

`playwright.config.ts` and `e2e/*.spec.ts` already cover most shell behavior. A verification run drives the live site for what they do not prove and cites them for what they do. Never copy an e2e assertion into a feature file as a second suite.

| Existing coverage               | Where                                                                                                                                                                 | What it proves                                                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Build output is prerendered     | `e2e/static-routes.spec.ts` (project `build`)                                                                                                                         | no public route is rendered per request, no time-based revalidation                                                                                                                  |
| Minimal bespoke suite           | `home`, `navigation`, `ask`, `lab`, `motion`, `preferences`, `print`, `disclosure`, `command-menu`, `link-preview`, `markdown` specs, projects `desktop` and `mobile` | Minimal only (cookie `hr_flavor=minimal`)                                                                                                                                            |
| Drawing Set bespoke suite       | `e2e/drawing-set.spec.ts`, projects `desktop-drawing-set`, `mobile-drawing-set`                                                                                       | sheet index, command menu, Customize persistence, `/now` log, no overflow at 768                                                                                                     |
| Shared shell for the other nine | `editions.spec.ts`, `a11y.spec.ts`, `command-dialog.spec.ts`, projects `desktop-<id>` and `mobile-<id>`                                                               | every route 200 with one h1, edition 404, command menu, Customize theme, header theme toggle, axe in light and dark with reduced motion, command dialog wheel and keyboard contracts |

Those suites run with `bun run test:e2e` and start their own `bun run build && bun run start -p 3020` (`reuseExistingServer: true` outside CI, so any process already on 3020 is silently reused). They are browser automation, so they are on hold too. Their pass or fail is not a proof of anything this map marks as a gap (see the ledger).

Non-browser gates that exist: `bun run lint`, `bun run type-check`, `bun run test` (vitest), `bun run fmt:check`, `bun run check:identity`, `bun run budget` (after a build). Running them is allowed and says nothing about UI behavior.

## Launch

One server per task, on a task-specific port, started from a production build because that is what the e2e config and `static-routes.spec.ts` assume (`next dev` is not part of this plan; `next-dev-loop` drives a browser and is on hold).

```sh
.agents/skills/verify/scripts/doctor.sh                    # env and tree hygiene, no server needed
.agents/skills/verify/scripts/serve.sh start 3071          # build, start, wait for readiness, write PID file
.agents/skills/verify/scripts/doctor.sh 3071               # now also probes the running instance
```

`serve.sh start` does exactly this: refuses if the port is busy, runs `bun run build` and `bun run start -p <port>` with every Sanity, ask and flavor variable unset (so the site renders the bundled fallback content and makes no CMS call), records the server PID in `$RUN_DIR/server.pid`, and waits until `GET /flavors` answers 200. Ports 3000 and 3020 are refused (3020 belongs to the Playwright config). A build overwrites `.next`; do not start two runs in one checkout.

Ready means all of: `serve.sh` printed `ready`, `GET /flavors` is 200, and `GET /` with the cookie `hr_flavor=minimal` is 200 and contains one `<h1>`. Do not drive anything that has not met all three.

Teardown: `.agents/skills/verify/scripts/serve.sh stop 3071` (see Cleanup).

## Doctor

`.agents/skills/verify/scripts/doctor.sh [port]` is read-only. It answers "is this instance worth driving, and is it safe". It fails (exit 1) when any of these hold:

- A `.env`, `.env.local`, `.env.development*`, `.env.production*` file exists in the repo root (Next would load Sanity or ask secrets and the drive could write to a real dataset).
- Any of `NEXT_PUBLIC_SANITY_PROJECT_ID`, `SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET`, `ASK_COOKIE_SECRET`, `ASK_OWNER_PASSPHRASE`, `NEXT_PUBLIC_FLAVOR` is set in the calling shell.
- `HEAD` is not the commit the run claims, or the tree is dirty (it prints both).
- With a port: the port is not owned by the PID in `$RUN_DIR/server.pid`, `/flavors` is not 200, `/api/visits` is not 503 (it must be 503: that is how the fallback build proves the visitor counter cannot write to a CMS), or `/` with `hr_flavor=minimal` has no `<h1>`.

Run it first whenever anything looks off.

## Prerequisites a run must state

- Content: bundled fallback (`content/fallback/`), the default. A run against a configured Sanity project is a different run with owner approval, a disposable dataset and a read-only token; see [features/cms-prerequisites.md](features/cms-prerequisites.md). No run may write to a CMS, change owner content, deploy, or touch credentials.
- Viewports: desktop 1440x900 and phone (Playwright's "Pixel 7" profile: touch, coarse pointer, no hover), the two the e2e config uses. Light and dark. Motion on and `prefers-reduced-motion: reduce`.
- Storage: start every flavor drive from an empty profile with only the cookie `hr_flavor=<id>` (what the e2e `storageState` does). Never use a shared authenticated browser session.
- Scene tier: the scene tier follows WebGL2, `Save-Data`, `prefers-reduced-data`, `deviceMemory` and pointer (`lib/scene/tier.ts`). Record the browser's tier signals with each scene proof. A headless browser without a GPU proves T0 and the poster, not the 3D.

## Drive

Recipes pending the chosen browser skill. Each feature file under `features/` lists the actions, stable handles and observable end state. Handles in order of preference: ARIA role and accessible name, route path, `html[data-theme]`, `html[data-motion]`, `html[data-scene]`, `[data-scene-poster]`, the `hr.*.prefs` localStorage key per edition (`e2e/support/site.ts` `prefsKeyFor`). No coordinates.

Proof standards:

- Exercise the real route and control, not a store setter. Prefer the visible control over `localStorage` edits; use storage only to set up a starting state the feature file names.
- Capture the action and the state after it: an ARIA snapshot and a screenshot for UI, the response status and headers for HTTP checks, the console and failed-request log for every drive.
- A passing unit test or e2e spec is not proof of an unexercised flow. Mark the feature `Last live proof:` only after the real flow ran, with date, commit and evidence path.
- Report an unreachable path with the attempted step and the unmet precondition. Do not report a skipped entry point as verified through another one.

## Evidence

Directory: `$EVIDENCE_DIR`, default `$HOME/.verify-evidence/website/<run-id>/` where `<run-id>` is `<UTC timestamp>-<short HEAD>`. Layout: `doctor.txt`, `server.log` (copied from `$RUN_DIR`), then `<feature-id>/<step>.aria.txt`, `<step>.png`, `console.txt`, `network.txt`. After a drive, add one line to the feature file's `Last live proof:` (date, commit, evidence path) and one row to the ledger. Copy `$RUN_DIR/server.log` into the evidence directory before `stop`, because `stop` removes `$RUN_DIR`. Evidence outlives cleanup and is never deleted by this skill.

## Cleanup

`.agents/skills/verify/scripts/serve.sh stop <port>` kills only the PID in `$RUN_DIR/server.pid` (and the children it started), then removes `$RUN_DIR`. It never kills by process name and never touches a process it did not start. It leaves `.next` (a build artifact the checkout already ignores) and `$EVIDENCE_DIR` alone. If the PID file is missing it reports that and kills nothing. After a failed run, run it before retrying so no port stays taken.

`$RUN_DIR` is `${TMPDIR:-/tmp}/website-verify-<port>`; it holds only the PID file and the server log.

## Helpers

- `scripts/doctor.sh [port]`: the read-only check above. Exit 0 healthy, 1 not worth driving.
- `scripts/serve.sh start <port>` and `scripts/serve.sh stop <port>`: launch and teardown above.

Both are executable and use only `bash`, `curl`, `lsof`, `git` and `bun`.
