# Handoff: 3D portfolio with multiple editions ("flavors")

> **Archived 2026-09-27.** Kept for history; paths and state below may be out of date. Superseded by `docs/handoff/cloud-handoff-2026-09-27.md` and `docs/handoff/open-items-2026-09-27.md`. See `docs/archive/README.md`.

Consolidated 2026-09-26 from two lead sessions:
- session 1: design exploration, Drawing Set, the editions architecture, up to `2002cf5`
- session 2: Drawing Set polish, Ask slug hardening and the Sanity cleanup, up to `daead55`

This file lives in `~/Documents/portfolio-3d-handoff/` so nothing cleans it up automatically. All 10 design mocks (HTML plus notes plus `BRIEF.md`) are copied next to it in `./mocks/`. They're also committed in the repo at `docs/mocks/`.

Everything below is committed, except one untracked file noted in section 1.

---

## 1. Where things are

| What | Where / state |
|---|---|
| Main checkout | `/Users/rajput-hemant/Projects/NextJS/website`, **branch `portfolio-3d` checked out here**, HEAD `daead55` |
| Old worktree | `/Users/rajput-hemant/Projects/NextJS/website-3d`, detached HEAD at `2002cf5` (detached on purpose to free the branch). It may run the owner's `next dev` on **port 3000: don't kill it**. |
| MonoCode worker worktrees | `/Users/rajput-hemant/Projects/NextJS/website-worktrees/mc-orch-{66261c68f78c,5bbe0a0b8cc0,e73d0dc38b64,1b3eea41cef9}`. Their work is already integrated and committed. Delete them only when the owner says so. |
| Untracked in the main checkout | `docs/handoff-2026-09-26.md`, session 2's handoff, fully merged into this file |
| Base branch | `master`. `portfolio-3d` is ahead: `git -C <main checkout> log --oneline master..portfolio-3d` |
| Reference branch (source of Minimal, read only) | `claude/serene-hawking-jxyjn0`, read with `git show "claude/serene-hawking-jxyjn0:<path>"` |
| Sanity | project `y9f5m131`, dataset `production`, shared by every edition and **by other local branches** (see section 7). Schema changes must be additive. |
| Agent memory | `~/.claude/projects/-Users-rajput-hemant-Projects-NextJS-website/memory/`: `MEMORY.md` indexes `portfolio-3d-status.md`, `portfolio-3d-project.md`, `portfolio-3d-commit-freely.md`, `ask-via-ask-tool-research-design.md`, `model-routing.md`, `monocode-worker-gotchas.md`. Note that `portfolio-3d-status.md` is partly stale: this file is newer. |

### Read these in-repo docs first (they aren't duplicated here)
1. `AGENTS.md` / `CLAUDE.md`: "This is NOT the Next.js you know". Read `node_modules/next/dist/docs/` before writing Next code (Next 16.3.6, React 19.3, Tailwind v4, Bun).
2. `docs/flavors/README.md`: **the editions architecture as built**, the rules every edition follows, and "Adding a flavor later". The most important doc.
3. `docs/flavors/design.md`: the Drawing Set design system.
4. `docs/guides/m2-scene-spec.md`: the Drawing Set 3D scene contract (loader, one clock, store, poses with `frame`, prop stages, narrow fit, tiers, `data-scene-*` attributes). One stale bullet is noted in section 6.
5. `docs/archive/plans/m1b-drawing-set-2026-09-26.md`: the primitives' APIs and conventions used to build Drawing Set. Its folder paths predate the move into `flavors/drawing-set/`.
6. `docs/archive/reviews/shared-code-review-2026-09-26.md`: the plan for extracting duplicated headless logic from the two editions. Plan only, nothing executed.
7. `docs/mocks/BRIEF.md`: the shared brief and real content used by every mock.
8. Background: `docs/archive/plans/plan-2026-09-26.md` (Phase 2 plan: performance, a11y, IA), `docs/archive/plans/m1-conventions-2026-09-26.md`, `docs/architecture/architecture.md`, `docs/guides/ask.md`, `docs/guides/sanity.md`, `docs/reference/prose-notes.md`.

---

## 2. The project in one paragraph

This is an award-level, immersive, 3D-capable portfolio for Hemant Rajput, a fullstack engineer. It's a separate project from the live site, living in the same repo on branch `portfolio-3d`. The site ships as several complete **editions** of one portfolio:
- same content, URLs, Sanity data, APIs and markdown mirrors
- a different visual edition each

**Minimal** is the default: the UI from `claude/serene-hawking-jxyjn0`, ported as is. **Drawing Set** is the second live edition: blueprint and engineering-drawing language with a persistent React Three Fiber linework scene. Nine more editions are designed as mocks and listed as `future` in the registry.

On a first visit, `/` shows an edition picker. After a choice, a cookie (`hr_flavor`) routes every URL to that edition.

---

## 3. Architecture as built (full detail: `docs/flavors/README.md`)

```
app/
  api/** md/** ask/feed.xml sitemap.ts robots.ts llms.txt search.json link-previews.json
  manifest.ts icon* opengraph-image twitter-image          shared, never rewritten
  studio/                  bare root layout (Sanity Studio)
  flavors/                 the edition picker (own root layout); "/" rewrites here on a first visit
  f/minimal/               Minimal: root layout, pages, not-found, [...missing] catch-all, redirects
  f/drawing-set/           Drawing Set: same structure
  global-not-found.tsx     experimental.globalNotFound (needed with multiple root layouts)
proxy.ts                   markdown mirrors first, then routeFlavor()
lib/flavor-routing.ts      pure routing rules (tested in lib/__tests__/flavor-routing.test.ts)
lib/public-pathname.ts     usePublicPathname(): strips /f/<id>; ALWAYS use it, never raw usePathname
flavors/
  registry.ts              live + future editions; DEFAULT_FLAVOR="minimal"; FLAVOR_COOKIE="hr_flavor"
  minimal/                 components/ lib/ content.ts styles.css
  drawing-set/             components/ lib/ (motion, interaction, scene, prefs, fonts, utils, dates, hooks) content.ts styles.css
  picker/                  styles.css fonts.ts specimens.tsx
content/site.ts            shared identity plus `pages` (union; `only` marks edition-only pages)
```

**Routing (`routeFlavor`):**
- `?flavor=<live id>` sets the cookie and 307s to the clean URL. The picker uses this, so it works without JS.
- `/` with no valid cookie rewrites to `/flavors`.
- Every other page path rewrites to `/f/<cookie or minimal>/<path>`, so deep links and crawlers always get a real page.
- `/f/*` and `/flavors` pass through, and `/f/*` gets `X-Robots-Tag: noindex`.

**Per-edition redirects:**

| Edition | From | To |
|---|---|---|
| Minimal | `/about` | `/work` |
| Minimal | `/projects/<slug>` | `/projects` (static slugs) |
| Drawing Set | `/changelog` | `/now#log` |

The sitemap lists only the default edition's pages.

**Separation the owner insists on:**
- Each edition's code lives in its own folders. **Never put code for multiple editions in one component or file.**
- Shared code is flavor-neutral only: data, APIs, markdown, registry, routing, pure `lib/` logic.
- Each edition has its own root layout, fonts, CSS, cn/tailwind-merge config and prefs key (Minimal `hr.prefs`, Drawing Set `hr.ds.prefs`).
- Each `styles.css` uses `@import "tailwindcss" source(none)` plus `@source` for its own folders.
- `.prettierrc` has per-folder `tailwindStylesheet` overrides.

**Rules every edition follows** (listed in `docs/flavors/README.md`):
- same Sanity data
- the home page shows experience (projects optional, after it)
- 3D and interactive animation where the edition calls for it
- designs stay open to refinement
- clean code, with logic in tested shared `lib/` modules

---

## 4. The editions

### Live
1. **Minimal** (default): fonts are Bricolage Grotesque, Fraunces and Martian Mono.
   - Paper and ink palette, visitor-picked accent, customize panel with textures, ⌘K.
   - Only Fraunces is preloaded (font budget).
   - The e2e suite in `e2e/` targets this edition.
2. **Drawing Set** (spec `docs/flavors/design.md`, mock `mocks/drawing-set.html`):
   - **Look:** cyanotype (dark) and whiteprint (light) themes with a redline accent. Fonts are Archivo, Newsreader and Azeret Mono.
   - **Chrome:** a drawing frame with grid ticks, a sheet index nav, a title-block footer, and a reticle cursor with a grid-reference readout.
   - **Pages:** a drawing register, chain-dimension experience, schedules, revisions, an RFI log, and case-study sheets with VIEW A/B media placeholders (the owner has no project media yet).
   - **3D:** one persistent R3F linework scene (plan chest plus drafting table) with a state per route.
     - Camera: each pose declares a world `frame`, fitted with `fitDistance`.
     - Home: shifts via `setViewOffset`, so drag pivots on the group centre.
     - Props: per-route **prop stages** scale props up without cropping.
     - Narrow slots: `NARROW = { fit: 0.85, shift: -0.1 }` plus per-pose `narrowShift`.
     - Budget: zero frames when idle.

### Future (designed only; each has `mocks/<id>.html` + `mocks/<id>.md`)

| Registry id | Name | One line | Planned wave |
|---|---|---|---|
| surface | Control Surface | A precision instrument faceplate; every control and number is real | next (wave 1) |
| timetable | Timetable | Six overlapping roles as a transit network plus a departures board | next (wave 1) |
| survey | Field Survey | A topographic survey sheet of the career, with a loupe cursor | wave 2 |
| press | Press Proof | A print proof in two plates (interface, systems) | wave 2 |
| darkroom | Darkroom | A contact sheet of 14 frames under safelight; a 3D developer tray | wave 3 |
| jacquard | Jacquard | A weaving draft: warp = technologies, weft = projects | wave 3 |
| maquette | Maquette | An architect's study model with a real sun-path shadow study | wave 3 |
| mission | Flight Plan | Roles as transfer arcs, an orbit globe, a mission clock | wave 3 |
| calibre | Calibre | A watch movement: 14 jewels = 14 projects, ticking balance wheel | wave 3 |

Known nit: the calibre mock's readout says "11 projects" while its movement has 14 jewels.

To build an edition:
1. Follow "Adding a flavor later" in `docs/flavors/README.md`, using Drawing Set as the reference implementation.
2. Flip its registry `status` to `"live"`.
3. Add a Prettier override.

The mocks are a starting point; the owner says designs aren't final and each screen should get 3D and interactive animation.

To view the mocks:
```
python3 -m http.server 8765 --bind 127.0.0.1 --directory ~/Documents/portfolio-3d-handoff/mocks
```
Then open `http://127.0.0.1:8765/<name>.html`. They load Google Fonts and three.js from a CDN.

---

## 5. Validation state

**At `daead55` with live Sanity creds (`.env.local` present in the main checkout):**

| Check | Result |
|---|---|
| type-check, lint | pass |
| Unit tests | 618 pass |
| Build | 77 pages |
| Budget | Drawing Set text pages 161 to 169 KB; `/ask` about 230 KB; picker 132 KB; preloaded fonts ≤ 120 KB |
| e2e | 223 passed, 67 skipped, **4 failed**. Two specs fail on both desktop and mobile because they assume the no-Sanity fallback: `e2e/home.spec.ts:47` expects no Resume link, but the live profile has `resumeUrl`; `e2e/navigation.spec.ts:48` expects `/api/visits` to 503, but live creds answer. Not regressions. |

**Without creds (fallback content):** e2e was 225 passed, 0 failed.

Commands (run from the main checkout; use absolute paths, see section 8):
```
bun run type-check && bun run lint && bun run test && bun run build && bun run budget
PLAYWRIGHT_CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" bunx playwright test --workers=2
```
- Playwright's own browsers aren't installed; use system Chrome as shown.
- The suite reuses a server on port 3020 (`bun run start -p 3020` after a build).
- It sets the cookie `hr_flavor=minimal` in `playwright.config.ts`.

A headless hydration check (visit every page of both editions and collect console errors) was clean at `2002cf5`. The script shape: Playwright `chromium.launch({ channel: "chrome" })`, add the `hr_flavor` cookie, visit each path, and collect `pageerror` and console errors.

---

## 6. Next steps (ranked)

1. **Make the 2 fallback-only e2e specs data-aware:** `e2e/home.spec.ts:47` and `e2e/navigation.spec.ts:48`. This is a small Sonnet task.
2. **Refresh the stale `Poses` bullet in `docs/guides/m2-scene-spec.md`.** It still describes the old `max(1, 1.35 / aspect)` pullback; the camera now uses `frame` plus `fitDistance`.
3. **Build wave 1: Control Surface and Timetable,** from `mocks/surface.*` and `mocks/timetable.*`.
   - Per edition: one page-UI agent and one 3D-scene agent.
   - Then one final validation task over the whole repo that flips both registry entries to `"live"` and runs every check plus e2e.
4. **Later waves:** Field Survey and Press Proof, then Darkroom, Jacquard, Maquette, Flight Plan and Calibre.
5. **Optional polish:**
   - Home-specific mobile fit (home could go larger than the shared 0.85).
   - On mobile at scrollY 0, the `/ask` scene slot sits partly under the dock.
   - Drawing Set `/now` lede: the shared `pages` description is Minimal's shorter one.
   - The search index links `/changelog#<year>`; Drawing Set's redirect to `/now#log` loses the year.
   - M2.5 AVIF posters (SVG posters stand in; see `flavors/drawing-set/components/site/scene-posters.tsx`).
6. **Shared-code extraction** per `docs/archive/reviews/shared-code-review-2026-09-26.md`: only when the owner asks, and route it to Codex. It must stay edition-neutral.
7. **Later milestones from `docs/archive/plans/plan-2026-09-26.md`:** M3 deep interaction, M4 case studies plus additive Sanity schema, M5 polish (postprocessing at T3 only), M6 hardening, and Lighthouse CI per edition.
8. **Delete the old `website-worktrees/mc-orch-*` worktrees** when the owner says so.

---

## 7. Sanity dataset notes (y9f5m131/production, shared with other branches)

- A local branch named `rebuild` has a different ask model: object `slug`, replies as separate question docs, and an `askAuthor` type. It wrote into this shared dataset, which broke the build here.
- The build is now hardened (`59978ae`):
  - The query uses `coalesce(slug.current, slug)`.
  - Documents without a usable slug are filtered out.
  - `isSlug` is checked in `mapQuestion` and in both editions' `generateStaticParams`.
  - If `rebuild` writes again, the build won't break, but those questions won't appear.
- The owner deleted all `question` docs with a script at `/tmp/delete-inbox.ts` (dry run by default; `--yes` deletes; it writes a backup to `/tmp/sanity-inbox-backup-*.json`). An earlier backup of the seeded docs is `/tmp/sanity-seed-backup-20260926T125651Z.json`, with analysis in `/tmp/sanity-cleanup-plan.md`. **These `/tmp` files may already be gone** (macOS cleans `/tmp`). Copy them somewhere permanent if they still exist and matter.
- Three `askAuthor` fixture docs from `rebuild` remain. They're harmless because nothing here queries them.
- **Agents may not delete dataset documents** (the permission classifier blocks it). The owner runs deletes.

---

## 8. Owner preferences and constraints (follow strictly)

**Git**
- **Commit freely on `portfolio-3d`** after each verified step.
  - Use Conventional Commits with a lowercase subject; commitlint enforces it.
  - No co-author trailers.
  - Suggest a commit message after a feature.
- **Never push**, and never open or update a PR, unless asked.
- Never commit to other branches.

**Asking and deciding**
- Ask questions with the AskUserQuestion tool (pick-and-choose), never an HTML questionnaire.
- For design and interactivity questions, research first (visit reference sites) and decide, rather than asking.

**Name rule**
- The header shows "Hemant Rajput". The site UI everywhere else uses `rajput-hemant` (`site.handle`).
- The Drawing Set hero shows no name: the headline is the h1.
- The resume document, `<title>`, OG and JSON-LD keep the real name (the owner confirmed).

**Quality bar**
- Award-level, professional, never generic. The owner rejected an early UI as "too ugly" and wants the work of a senior front-end designer.
- Prefer established, current libraries over hand-rolled code.
- No compromise on performance, security or accessibility:
  - green CWV on a mid-range phone, within the JS and font budgets
  - fallbacks for no WebGL, reduced motion and low power
  - real DOM text and keyboard navigation

**Writing**
- No em dashes anywhere: code, copy, comments, docs.
- Minimal comments.
- `bunx`, not `npx`.

**Model routing** (owner's rule, from memory `model-routing.md`):

| Task | Harness / model |
|---|---|
| UI and 3D polish | Claude Opus, at most one at a time |
| Validation and review | Claude Sonnet |
| Complex code review | Codex GPT-6-Sol |
| Bulk implementation and edition page UI | Codex or Cursor models, not Claude (save Claude quota) |

Use several harnesses and keep 3 to 4 agents running.

**Machine load:** at most 1 Node process per agent and at most 2 agents running Node at once. Workers only run `bunx eslint` and `bunx prettier` on their own files; the lead runs type-check, test, build, budget and e2e.

**Secrets:** never copy `.env.local` or secrets.

---

## 9. Gotchas learned the hard way

**Next.js and libraries**
- **`usePathname()` under rewrites** returns `/f/<id>/…` during static render and the public path in the browser, which caused React #418 hydration errors on every page. Always use `usePublicPathname()`.
- **tinykeys v4** skips key events from input fields by default. Pass `{ ignore: () => false }` so ⌘K works in fields; `whenNotTyping` guards the other shortcuts.
- **`next/script` `beforeInteractive`** inline scripts run late (`self.__next_s`), so they can't be used for pre-paint theme scripts. Keep raw `<script>` in each root layout's `<head>`.
- **`cn()` (tailwind-merge)** must be taught custom text sizes, or it silently drops them. Each edition has its own `lib/utils.ts`.
- **`useSyncExternalStore` snapshots** must be primitives, or React loops.

**Build scripts**
- **The budget script** strips `/f/<id>` to find a route's ceiling, and caps preloaded font bytes at 120 KB.

**Worker worktrees**
- Fresh worker worktrees have no `node_modules` and no `.env.local`, and workers may not install deps. The lead runs `bun install --cwd <worktree> --frozen-lockfile`.
- MonoCode can't accept a task whose changes came from `git apply` (no checkpoint), so have workers edit files directly.

**Shell and browser pane**
- **Shell:** `ls` is aliased to eza, so use `command ls`. `cd` trips a zshz plugin error and silently breaks `&&` chains, so use absolute paths, `git -C`, `bun --cwd` or `env -C`. Quote `"branch:path"` in git commands.
- **Browser pane screenshots:**
  - Screenshots are downscaled, so 1px lines look dashed. Check at a 1:1 emulated viewport before "fixing" linework.
  - Scrolling in emulation blanks captures, so use a tall viewport at scrollY 0.
  - The tab cap is reached, so reuse the existing tab.

---

## 10. Suggested skills for the next agent

Call these with the Skill tool when the task matches:

| Skill | Use for |
|---|---|
| `frontend-design` | any edition UI work (the owner demands distinctive, non-generic, award-level design) |
| `emil-design-eng`, `apple-design` | motion, interaction polish and gesture feel |
| `improve-animations`, `find-animation-opportunities` | auditing or planning motion (read-only planners) |
| `vercel-react-best-practices` | React and Next performance reviews |
| `next-dev-loop` | verifying runtime behaviour against a running `next dev` |
| `code-review` | reviewing a branch or wave "since `<commit>`" against standards and spec |
| `diagnosing-bugs` | hydration errors, build breaks, perf regressions |
| `tdd` | pure `lib/` logic (routing, fitting, data mappers) |
| `writing-for-agents` | edits to `AGENTS.md` or `CLAUDE.md`, or task prompts for workers |
| `workflow-authoring` | only if the owner explicitly asks for a multi-agent workflow |
| `handoff` | writing the next handoff; save it here in `~/Documents/portfolio-3d-handoff/`, not the OS temp folder |
