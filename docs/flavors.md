# Flavors: one site, several editions

Last verified: 2026-09-27 at `b50faeb`.

A flavor (edition) is a complete visual version of the portfolio: tokens, fonts, page layouts, motion, sound and 3D. Every edition shares the same content, URLs, data layer, APIs and accessibility contract. This doc holds the architecture, the rules, the performance and accessibility contracts, and the recipe for adding an edition. The contracts that used to live in the 2026-09-26 plan and the M1 briefs (now in `docs/archive/`) are restated here, so nothing that still holds lives only in the archive.

## Principles

1. **Clean, shared URLs.** `/projects` is `/projects` in every edition. The edition is a visitor preference, never part of the public URL.
2. **Static stays static.** Pages never read cookies, headers or `searchParams`. The edition is resolved before rendering, by a proxy rewrite.
3. **Pay only for the edition you see.** An edition's page code, fonts and scene live in its own route tree and chunks. Nothing from another edition loads until you switch.
4. **Semantics shared, presentation owned.** Data, metadata, markdown mirrors, `/ask` logic, ⌘K data and the prefs mechanics are shared. Each edition owns only how things look, sound and move.
5. **Additive.** Adding an edition means adding folders and one registry entry. No edits to other editions.

## The editions

`flavors/registry.ts` is the single list: id, name, tagline, picker swatch and `status`. `DEFAULT_FLAVOR` is `minimal`. The picker lists `future` editions as coming later, and the proxy never routes to them.

| Id            | Name            | Status | Design doc                                       | 3D                                                 |
| ------------- | --------------- | ------ | ------------------------------------------------ | -------------------------------------------------- |
| `minimal`     | Minimal         | live   | `architecture.md` sections 3, 4, 9; `minimal.md` | glyphs on every route (`minimal.md`); `/lab` stage |
| `drawing-set` | Drawing Set     | live   | `design.md`, `m2-scene-spec.md`                  | R3F linework plan chest                            |
| `surface`     | Control Surface | live   | `surface.md`                                     | Plain three.js knob                                |
| `timetable`   | Timetable       | live   | `timetable.md`                                   | R3F split-flap indicator                           |
| `survey`      | Field Survey    | live   | `survey.md`                                      | Plain three.js relief                              |
| `press`       | Press Proof     | live   | `press.md`                                       | R3F press                                          |
| `darkroom`    | Darkroom        | future | `mocks/darkroom.md`                              | Being built now, not yet on `portfolio-3d`         |
| `jacquard`    | Jacquard        | future | `mocks/jacquard.md`                              | Being built now, not yet on `portfolio-3d`         |
| `maquette`    | Maquette        | future | `mocks/maquette.md`                              | Not scheduled                                      |
| `mission`     | Flight Plan     | live   | `mission.md`                                     | Plain three.js orthographic globe                  |
| `calibre`     | Calibre         | live   | `calibre.md`                                     | R3F watch movement                                 |

## Routing (as built)

```
app/
  api/**  md/**  ask/feed.xml  sitemap.ts  robots.ts  llms.txt  search.json
  link-previews.json  manifest.ts  icon  apple-icon  opengraph-image  twitter-image
                     shared, never rewritten
  studio/            Sanity Studio, own bare root layout
  flavors/           the edition picker, own root layout
  f/<id>/            one static tree and root layout per live edition
  global-not-found.tsx
proxy.ts             markdown mirrors first, then routeFlavor (lib/flavor-routing.ts)
flavors/
  registry.ts        every edition: status, name, tagline, swatch; liveFlavors, isLiveFlavor
  <id>/              components/, lib/, content.ts, styles.css
  picker/            the picker's styles, fonts and specimens
```

There is no `app/layout.tsx`. Every edition, the picker and the Studio have their own root layout, which is why `experimental.globalNotFound` is on in `next.config.ts`.

- **One static tree per edition**, each with its own root layout, fonts, CSS and prefs key, and `data-flavor="<id>"` on `<html>`. No component or file contains more than one edition. Moving between editions is a full page load (different root layouts), which switching needs anyway.
- **`proxy.ts`** does two jobs, in order: markdown mirrors (`/<page>.md`, `/md/*`, or a page URL whose `Accept` prefers `text/markdown`), then editions. Its matcher skips `_next/`, `api/`, `studio`, the root icon and OG routes, and any path with a file extension.
- **`routeFlavor`** (`lib/flavor-routing.ts`, pure, tested in `lib/__tests__/flavor-routing.test.ts`) imports no edition file. `proxy.ts` passes it `DEFAULT_FLAVOR` and `isLiveFlavor` from the registry.
  - `?flavor=<live id>` sets the `hr_flavor` cookie (one year, `SameSite=Lax`, readable by the page) and 307s to the same URL without the parameter. This is how the picker works without JS.
  - `/flavors` and `/f/*` pass through untouched.
  - `/` with no valid cookie is rewritten to `/flavors` (the picker). This applies to first visits only.
  - Every other path is rewritten to `/f/<cookie edition>/<path>`, or to the default edition, so deep links and crawlers always get a real page.
- **`X-Robots-Tag: noindex`** on `/f/*` comes from the `next.config.ts` headers, not from the proxy.
- **Pages one edition lacks** `permanentRedirect` (308) inside that edition:
  - Minimal: `/about` goes to `/work`, and `/projects/<slug>` goes to `/projects`.
  - Drawing Set, Control Surface, Timetable, Field Survey and Press Proof: `/changelog` goes to `/now#log`.
- **Not found.** Unknown paths inside an edition hit its `[...missing]` catch-all, which calls `notFound()`, so the edition's own `not-found.tsx` renders. URLs outside every edition get `app/global-not-found.tsx`.
- **Canonical and sitemap.** Canonical URLs are always the clean path. The sitemap lists `content/site.ts` `pages`, skipping any page whose `only` names an edition other than the default.
- **Switching.** Every edition's footer links to `/flavors` ("Change edition"), wrapped in `EditionChoice` (`components/semantic/edition-choice.tsx`) so a pinned deploy drops it.

## Pinned edition

Set `NEXT_PUBLIC_FLAVOR=<live id>` (for example `press`) to deploy one edition only. Unset or empty keeps the picker and switching exactly as above.

- **Validation.** `lib/env.server.ts` (T3Env, run by `next.config.ts` on every build and boot) rejects any value that is not a live id in `flavors/registry.ts`, listing the valid ids. `lib/env.ts` exposes `env.pinnedFlavor` and `isEditionPinned`; the registry exposes the typed `pinnedFlavor` and `siteFlavor` (pinned or `DEFAULT_FLAVOR`).
- **Build time.** Like every `NEXT_PUBLIC_*` value it is inlined by `next build`, proxy included, so changing it needs a rebuild.
- **Routing** (`routeFlavor` with `pinnedFlavor`, tested in `lib/__tests__/flavor-routing.test.ts` and `lib/__tests__/proxy.test.ts`):

| Request                     | Unpinned                                    | Pinned to `press`                   |
| --------------------------- | ------------------------------------------- | ----------------------------------- |
| `/`, no cookie              | the picker                                  | `/f/press`                          |
| `/<path>`, any cookie       | the cookie's edition, else `DEFAULT_FLAVOR` | `/f/press/<path>`, cookie ignored   |
| `/<path>?flavor=<id>`       | sets `hr_flavor`, 307 to the clean URL      | ignored, no cookie set              |
| `/flavors`                  | the picker                                  | 404, the Press not-found page       |
| `/f/press/<path>`           | passes through                              | passes through                      |
| `/f/<other>/<path>?<query>` | passes through                              | 307 to `/<path>?<query>`, no cookie |

- **Why a redirect for other editions and a 404 for the picker.** Old or shared `/f/<id>/...` links name a real page, so they land on the same page in the pinned edition; a temporary 307 because the pin is a deploy setting that can change. The picker has no equivalent page, so it gets the edition's own 404 (the proxy rewrites it into the pinned tree, where the `[...missing]` catch-all calls `notFound()`).
- **No switcher.** `EditionChoice` renders nothing, so no footer shows "Change edition". No edition has a ⌘K command, Customize section or shortcut for switching, so there is nothing else to hide. A new edition wraps its picker link in `EditionChoice`.
- **Not yet pruned** (follow-ups): the sitemap filters by `DEFAULT_FLAVOR`, and llms.txt, markdown mirrors and link previews list every `content/site.ts` page; none of them names an edition, but pages the pinned edition redirects away from (for example `/changelog` outside Minimal) are still listed. Other editions' trees are still prerendered.

## Rules every edition follows

- **One data source.** Every edition reads the same Sanity project (`y9f5m131`, dataset `production`) through the shared `lib/data` accessors. No edition has its own schema, queries or content copies. The dataset is shared with other branches, so schema changes stay additive.
- **Home shows experience.** Every home page presents the experience (roles, dates, tenure) above the fold or directly below the hero. Featured projects may follow.
- **3D where the edition calls for it,** always as progressive enhancement: every route works fully at T0 (poster plus DOM). See "3D" below for who shares what.
- **Designs evolve.** A mock in `docs/mocks/` is a starting point, not a frozen spec.
- **Clean code.** Editions own presentation only. Logic (dates, tenure, data shaping, routing, loaders) lives in shared pure modules under `lib/` with unit tests, never copied into an edition.
- **Shared code is edition-neutral.** A shared file may hold data loading, state, events, pure transformation, a headless hook or an unstyled primitive. It never imports `flavors/*`, never switches on edition identity, and never picks an edition's labels, tokens or classes. If a behaviour should change for every edition and can be written without knowing the edition, it goes in `lib/` or `components/semantic/`. A design choice, label, storage schema, route availability, scene content or CSS stays in `flavors/<id>/`. A small duplicated JSX wrapper is cheaper than a prop-heavy shared component. The full audit is `docs/redundancy-audit-2026-09-27.md`.
- **Scrollbars.** Every edition keeps its own edition-styled scrollbars.
- **Themes.** Light and dark only, following the OS; an explicit choice in the edition's prefs wins in both directions.
- **Customize defaults.** Every switch in an edition's Customize panel is on by default (owner rule, 2026-09-28): motion, 3D, sound, haptics, link previews and any edition extras. A choice the visitor saved still wins, so changing a default never bumps a prefs version. The motion default still yields to the OS: with `prefers-reduced-motion: reduce`, `data-motion` is `off` and each edition falls back to its gentler reduced-motion path, never to zero.
- **Sound.** On by default, synthesized through the shared engine in `lib/sound.ts`, with no samples unless a listening test fails. Browsers block audio until the first gesture, so the engine creates no context and plays nothing before one (`navigator.userActivation.hasBeenActive`), and the first click is what starts it. Per-edition palettes go in `flavors/<id>/lib/sound/voices.ts`.
- **Haptics.** On by default (only touch devices feel them), through the shared layer in `lib/haptics.ts`. Taps on touch only, never mouse or keyboard; a Haptics switch sits next to Sound in Customize on coarse pointers. On iPhone and iPad only toggles tick (switches and the header theme toggle): iOS offers no script-driven haptic, see below. A theme toggle opts in with `data-haptic-switch`; every `role="switch"` gets it without asking.
- **UI libraries.** shadcn/ui components and their CSS variables are never edited; restyle at call sites or in app-owned wrappers. No Radix, except `cmdk` and its transitive Radix dependencies. Dialogs, popovers and switches use `@base-ui/react`.

## Conventions that still hold

These come from the M1 briefs and the session handoffs and are still true in the code.

- **Server components by default.** `"use client"` only for interactive leaves.
- **Data and copy.** Data only through the `@/lib/data` accessors (types in `lib/data/types.ts`). Page descriptions come from `content/site.ts` `pages`, and metadata from `pageMetadata()` in `lib/metadata.ts`.
- **Paths.** Use `usePublicPathname()` (or `publicPath()`) from `lib/public-pathname.ts`, never raw `usePathname()`. Under the rewrite the raw hook returns `/f/<id>/...` during static render, which caused React #418 hydration errors.
- **Pre-paint.** Theme and prefs are applied by a raw inline `<script>` in each root layout's `<head>` (`components/semantic/prefs/pre-paint-script.tsx`), because `next/script` `beforeInteractive` runs too late. The functions it embeds via `toString()` must stay self-contained.
- **Stores.** `useSyncExternalStore` snapshots must be primitives or stable references, or React loops. Prefs stores return the defaults during SSR and hydration, so the server HTML is identical for every visitor.
- **Class merging.** Each edition's `cn()` lives in `flavors/<id>/lib/utils.ts`, built on the `cn` package (`clsx` and `extendTailwindMerge` from `cn/config`). It must be taught the edition's custom text sizes, or tailwind-merge silently drops them.
- **First paint is final.** Nothing above the fold waits for JS; text is real DOM from the first byte. Hover effects sit behind the `fine:` variant (a fine pointer that can hover), and movement sits behind `motion:` or the `data-motion="on"` root attribute.
- **Defer the motion stack.** Lenis, pointer effects, the cursor, sound and link previews load after idle through each edition's `deferred-shell.tsx` and `deferred-layers.tsx` (Minimal: `interaction-layer.tsx`, one dynamic import per preference). Nothing imports `gsap` at module top level in a component that renders on first paint.
- **Keyboard shortcuts.** tinykeys skips input fields by default; the shared shortcuts pass `{ ignore: () => false }` so ⌘K works inside fields.
- **Writing.** No em dashes anywhere (code, copy, comments, docs). Minimal comments, only for a non-obvious why. `bunx`, not `npx`.
- **Imports.** React is imported as `import * as React from "react"` (a lint rule enforces it), and object types use `type`, not `interface`.

## Toolchain

On `portfolio-3d` since `87286a4` and `86d0a41`:

- **React Compiler** is on (`reactCompiler: true` in `next.config.ts`, with `babel-plugin-react-compiler`).
- **Strict TypeScript** (`tsconfig.json`): `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` and `verbatimModuleSyntax`. With `exactOptionalPropertyTypes`, an optional prop that may receive `undefined` is typed `prop?: T | undefined`.
- **Type-aware ESLint**: `typescript-eslint` `recommendedTypeChecked` on every TS file with `projectService`, on top of `eslint-config-next`.
- **Environment through T3Env**: public values in `lib/env.ts`, server values in `lib/env.server.ts` (server-only). `process.env` appears only at those boundaries. The build succeeds with no env values at all, on the fallback content.
- **typedRoutes stays off**: hrefs are plain strings.
- **Gates are never silenced.** No disabling or downgrading lint rules, no casts or non-null assertions to pass, no `ignoreBuildErrors`. A genuinely wrong rule is disabled inline, one at a time, with a reason.
- **Checks**: `bun run type-check` (`next typegen && tsc --noEmit`), `bun run lint`, `bun run fmt:check`, `bun run test` (Vitest; add `-- --maxWorkers=2` on a shared machine), `bun run build`, `bun run budget` and `bun run test:e2e`. CI (`.github/workflows/ci.yml`) runs all of them except e2e.

## Shared layer

- **Data and server loaders.** `lib/data` (`getProfile`, `getExperience`, `getProjects`, `getNow`, `getChangelog`, `getSkills`, `getEducation`, `getQuestions`), `lib/data/project-page.ts`, `lib/data/continuity-lanes.ts`, `lib/ask/pages/load.ts`, `lib/resume/load.ts`, `lib/metadata.ts` and `lib/format.ts`.
- **Backend.** `lib/ask`, `lib/visits`, `lib/markdown`, `lib/link-previews`, the API routes, sitemap, robots, feed, mirrors and `llms.txt`. OG cards (`components/og/`) stay neutral.
- **Command core.** `lib/command` (search index, matching, recents, go sequences, standard actions, `localizeSearchIndex`) and `components/semantic/command`.
- **Prefs.** `lib/prefs/store.ts` (`createPrefsStore`), `lib/prefs/standard.ts` (the theme, motion, scene, sound, haptics and link-preview schema, migration, `<html>` mapping and pre-paint script, which an edition adopts with only its own key), `lib/prefs/theme-color.ts` (browser chrome follows the resolved theme), and `components/semantic/prefs` (the pre-paint script, the sync hook and `color-scheme.css`).
- **Motion and interaction.** `lib/motion` (the GSAP export, pointer source, scroll and entrance), `components/semantic/motion` (Lenis `SmoothScroll`, `useReveal`, `useSplitReveal`) and `components/semantic/interaction` (pointer tracking and effects, cursor follow and label, cursor portal, tilt surface).
- **Sound.** `lib/sound.ts` (the voice engine: `Voice`, `playVoice`, `playTick`, the limiter, the first-gesture gate, hidden-tab suspend and resume on the next pointer or key gesture) and `components/semantic/click-sound.tsx` (`ClickSound`, with `voiceFor`, `onToggle` and `data-voice`).
- **Haptics.** `lib/haptics.ts` (`haptic(kind)` with `tap`, `select`, `success`, `error` and `nudge`, `preloadHaptics`, `cancelHaptics`, `switchHapticsOnly`, `hapticsWanted`) wraps `web-haptics` (pinned 0.0.6) for the Vibration API. The engine is a dynamic import on first use, so it is never in the initial JS, and a mouse-only visitor never fetches it. It stays still in a hidden tab, with `data-haptics="off"` on `<html>` (the `haptics` pref, on by default) and without any coarse pointer. `components/semantic/touch-haptics.tsx` (`TouchHaptics`, mounted beside `ClickSound` in each edition's late layers; Surface in `prefs-sync.tsx`, Minimal in `interaction-layer.tsx` on touch screens) listens in the capture phase for touch and pen clicks only (keyboard and scripted clicks carry `detail` 0 and are skipped): switches, radios and checkboxes play `select`, buttons, links and summaries `tap`; `data-haptic="<kind>|none"` on a control or an ancestor overrides, then the optional `hapticFor(el, event)`. `useCopyEmail`, the ⌘K copy action and `useAskComposer` play `success` on a copy or a send and `error` on a rejected send. Call `haptic()` synchronously in the gesture handler. `TouchHaptics` starts the import on the first touch `pointerdown`, so the first tap usually buzzes; when the engine lands later, the call still plays within a second, which Android honours (sticky activation).
- **Haptics on iOS.** Safari has no Vibration API. Its only haptic is the tick of a native `<input type=checkbox switch>` (Safari 17.4+) toggled by a trusted click during a user gesture (WebKit `CheckboxInputType::willDispatchClick`). The old trick of a scripted `label.click()` on a hidden switch (what `web-haptics` falls back to) worked from iOS 17.4 to 26.4 and stopped in iOS 26.5: WebKit commit [fc1ef83](https://github.com/WebKit/WebKit/commit/fc1ef83) (bug 309082) marks a click simulated under an untrusted event as untrusted, and an untrusted click never ticks ([web-haptics#38](https://github.com/lochie/web-haptics/issues/38), [#41](https://github.com/lochie/web-haptics/issues/41)). A switch with `display: none` has no renderer and cannot be tapped either. So on iOS (`switchHapticsOnly()`: an iPhone, iPod or iPad user agent, iPadOS by its touch points, and no `navigator.vibrate`) `haptic()` stays still and the engine is never fetched, and `TouchHaptics` instead lazy-loads `ios-haptics` (pinned 3.2.0, about 1 kB) and `lib/haptic-switches.ts` lays its transparent native switch (`opacity: 0`, absolutely placed over the host, `aria-hidden`, `tabIndex -1`) over every `[role=switch]` and `[data-haptic-switch]` outside `data-haptic="none"`, now and as more mount (a MutationObserver on `<body>`, iOS only). The finger toggles that switch, iOS ticks, and the click bubbles on to the real control, whose own state stays the source of truth (Base UI's switch cancels the overlay's click, which only reverts the overlay; the tick has already played). A Base UI switch inside a `<label>` also ticks from a tap on its text: the overlay is then the label's first labelable descendant, so the label forwards the real tap to it. `ios-haptics` makes a static host `position: relative`. A tap that would focus the overlay focuses its control instead. axe reports `nested-interactive` on each host while the overlay is in (iOS only, so CI never sees it): the overlay is a focusable widget inside a widget, though `aria-hidden` and `tabIndex -1` keep it out of the accessibility tree and the tab order, and no attribute can hide it from that rule while it stays tappable. Only toggles get one, because a native switch keeps a touch that starts on it from scrolling. Turning the pref off (or unmounting) removes every overlay. Links, buttons, copy and send confirmations stay still on iOS.
- **Checking haptics on an iPhone (owner).** Needs iOS 17.4 or later (iOS 26.5+ is the case this targets) and Settings > Sounds & Haptics > System Haptics on. In Safari open any edition, open Customize and make sure Haptics is on, then tap the Motion or Sound switch itself: each flip should give one light tick. Tap the header theme toggle (every edition except Drawing Set and Timetable, which have none; in Surface the Edition plate switch): one tick per flip. Tapping a link or a plain button gives nothing, by design. Turn Haptics off in Customize and flip Motion again: no tick. A tick on every flip means the overlay works; no tick anywhere with System Haptics on means iOS changed again, so check Safari's Web Inspector for an `input[data-haptic-trigger]` inside the switch.
- **Scene.** `lib/scene` (store, clock, tiers, DOM contract, session root, token colours) and `components/semantic/scene` (`useSceneMount`, `SceneMonitor`). The contract is `docs/m2-scene-spec.md`.
- **Headless hooks** in `components/semantic`: ask (`OwnerProvider`, `useOwner`, `useAskComposer`, `useThreadReply`, `usePendingThreads`, `usePendingReplies`, `useModerationQueue`, `useModerationItem`, `useMessageModeration`, `useOwnerSignIn`), `useLinkPreview`, `useVisitorCount` and `AnimatedCount`, `useCopyEmail`, `useHashOpen`, `useRowFilter`, `useIdleReady`, `useMediaQuery`, `usePrefersReducedMotion`, `useFinePointer`, `useRootData`, `useMotionOn`, and the lab `CanvasStage` and `SignatureFieldScene`.

## 3D

- **Drawing Set, Timetable and Press Proof** use R3F through the shared loader (`useSceneMount`), store, clock, tiers and DOM contract. Press and Timetable also use the shared session root (`lib/scene/session.tsx`, viewport mode) and `SceneMonitor`; the Drawing Set wires drei's `PerformanceMonitor` in its own `world.tsx`.
- **Field Survey** uses the shared loader, store, clock and tiers with a plain three.js world (no R3F).
- **Control Surface** shares only tier detection (`lib/scene/tier.ts`). Its knob is plain three.js with its own frame loop (`flavors/surface/lib/knob/frame-loop.ts`).
- **Minimal** uses WebGL only on `/lab` experiments, through `CanvasStage`.
- Each edition keeps its poses and world in `flavors/<id>/lib/scene/` and `flavors/<id>/components/scene/`. Idle renders zero frames. T0 (scene off, no WebGL2, Save-Data, reduced data) never downloads three.js and shows the poster.

## Performance budget

### Enforced

`scripts/check-budget.ts` (`bun run budget`, in CI) reads every prerendered HTML shell under `.next/server/app`, sums the gzipped `<script src="/_next/...">` files it loads, and counts its font preloads. `/f/<id>/<path>` is checked against the ceiling for the clean `/<path>`, so the same caps apply to every edition.

| Item                      | Cap                        |
| ------------------------- | -------------------------- |
| Text pages (initial JS)   | ≤ 180 KB gz                |
| `/ask` and `/ask/*`       | ≤ 240 KB gz                |
| `/projects/*`             | ≤ 180 KB gz                |
| `/lab/*` experiment pages | ≤ 170 KB gz                |
| Font preloads, per page   | ≤ 3, and ≤ 120 KB in total |

- Only initial chunks count. Deferred code (the motion stack, the ⌘K dialog, scene chunks) must never appear there; if it does, something imported it eagerly.
- A route without a ceiling is reported as `UNCHECKED`. A ceiling is never raised past its cap.
- Current state: the performance audit (`docs/handoff/performance-audit-2026-09-27.md`, at `f250b8d`) measured home-page failures on Minimal (276 KB), Drawing Set (187 KB) and Field Survey (183 KB). Fixes are in progress: server-only env validation, loading three.js only near the viewport, and the Press hover texture.

### Targets not yet enforced

From the plan's section 7. They still guide the work, but the owner has not re-confirmed them for the editions, and nothing checks them yet: there is no Lighthouse config and no draw-call or frame test.

| Metric                     | Target                                                                      |
| -------------------------- | --------------------------------------------------------------------------- |
| Scene chunk                | ≤ 300 KB gz, loaded after `load` and idle, never on T0                      |
| Postprocessing chunk       | ≤ 80 KB gz, top tier only (no edition uses postprocessing today)            |
| Scene assets               | ≤ 400 KB first view, ≤ 1.2 MB total; GPU memory < 100 MB                    |
| Draw calls                 | < 100 (< 50 at the low tier); the Drawing Set spec keeps its own < 60       |
| LCP (p75, mid Android, 4G) | ≤ 2.0 s; the LCP element is DOM text, never the canvas                      |
| INP                        | ≤ 150 ms                                                                    |
| CLS                        | ≤ 0.05; the poster reserves the canvas slot                                 |
| TBT (Lighthouse mobile)    | ≤ 150 ms                                                                    |
| Frame                      | JS ≤ 2 ms, GPU ≤ 8 ms at the tier's DPR; 60 fps desktop, ≥ 50 fps mid phone |
| Idle                       | 0 frames rendered when nothing moves                                        |
| Lighthouse (mobile)        | ≥ 95 in Performance, Accessibility, Best Practices and SEO                  |

Measure LCP, TBT and INP before and after each performance fix; the audit's trace section compared file sizes only.

## Accessibility and SEO contract

From the plan's section 8 and the M1 rules. It applies to every edition.

- **Real text.** All content is server-rendered DOM text, readable with JS off. 3D, cursors and sound are progressive enhancement. Canvases, posters and decorative chrome are `aria-hidden`, and no information exists only in a canvas.
- **Structure.** Semantic landmarks, one `h1` per page, a skip link, and `lang` on `<html>`.
- **Focus.** A visible `:focus-visible` ring at 3:1 contrast or better. Custom cursors never hide focus rings.
- **Keyboard.** Every control, including scene navs, knobs and the ⌘K menu, works from the keyboard. Esc closes overlays, and focus returns after dialogs.
- **Contrast.** WCAG 2.2 AA in both themes. axe runs in e2e (`e2e/a11y.spec.ts`) on every public path, `/owner` and a 404. Today the browser e2e projects cover Minimal and Drawing Set only.
- **Touch.** Targets of 44 px or more, and no hover-only information.
- **Reduced motion.** Honoured from the OS, plus a motion switch in each edition's prefs and in ⌘K. With motion off nothing moves, but colour and light feedback remain.
- **Metadata.** Per-page title and description, canonical, OG and Twitter images, sitemap, robots, the `/ask` RSS feed, markdown mirrors and `/llms.txt`. `/owner` is `noindex`. The plan's JSON-LD (`Person`, `QAPage`) is not built.
- **Names.** The header shows "Hemant Rajput"; elsewhere the site UI uses the handle `rajput-hemant` (`site.handle`). The resume, `<title>` and OG keep the real name.

## How to add a new edition

A new edition (`<id>`) owns its markup, CSS, motion, sound and scene, and reuses the shared loaders, hooks and accessors. Never import another edition, and never branch on edition identity in shared code. Press Proof and Field Survey are the leanest references: they use the standard prefs and the shared ⌘K controller.

### 1. Files to add

- **`flavors/<id>/`**:
  - `content.ts`: navigation, section copy and the page model.
  - `styles.css`: `@import "tailwindcss" source(none);` plus `@source` for `flavors/<id>` and `app/f/<id>` only. Tokens as `light-dark()` pairs or `[data-theme]` overrides, so an explicit theme choice wins; the edition's scrollbars.
  - `lib/fonts.ts`: `next/font` declarations, within the font budget.
  - `lib/prefs.ts` and `lib/prefs-store.ts`: its own `PREFS_KEY` (`hr.<xx>.prefs`), then either the standard schema (`lib/prefs/standard.ts`) or its own, bound with `createPrefsStore({ key, defaults, migrate })`.
  - `lib/utils.ts`: `cn()` on the `cn` package, taught the edition's text sizes.
  - `lib/sound/voices.ts` once the edition gets a sound palette.
  - Optional: `lib/scene/poses.ts` (no three.js imports) and other pure models, each with tests.
  - `components/`: chrome (`site/`, including `deferred-shell.tsx`), `command/`, `prefs/`, `ask/`, `resume/`, `work/`, `projects/`, `lab/`, `visitor-counter/`, `ui/`, and optionally `scene/`.
- **`app/f/<id>/`**:
  - `layout.tsx`, the root layout: `<html lang="en" data-flavor="<id>">` with the font variables; `<head>` with `PrePaintScript`; the `styles.css` import; metadata with `metadataBase`; a `viewport` with a `themeColor` per scheme; and the client singletons (prefs sync, command menu, deferred shell).
  - Pages: `page.tsx`, `work/`, `projects/`, `projects/[slug]/`, `now/`, `resume/`, `about/`, `changelog/`, `owner/` (with `robots: { index: false }`), `ask/`, `ask/page/[page]/`, `ask/[slug]/`, `lab/` and `lab/[slug]/`.
  - Shells: `not-found.tsx`, `[...missing]/page.tsx` (calls `notFound()`), and `ask/opengraph-image.tsx` plus `ask/[slug]/opengraph-image.tsx`, which re-export `components/og/ask`.
  - A page the edition omits is a `permanentRedirect`, for example `/changelog` to `/now#log`.

### 2. Shared code to reuse

- **Server loaders:** `loadProjectPage(slug, order?)`, `projectStaticParams()` and `projectMetadata(slug)` (`lib/data/project-page.ts`); `loadAskList(page)`, `askListStaticParams()`, `resolveAskPage(segment)`, `askListMetadata(segment)`, `questionStaticParams()` and `questionMetadata(slug)` (`lib/ask/pages/load.ts`, with `ASK_PAGE_SIZE` = 20); `loadResumeData()`; `computeContinuityLanes(roles)`; and `pageMetadata`. Keep `dynamicParams = true` on the ask routes that grow.
- **⌘K:** `useCommandMenu(goKeys, { onWillOpen })` in the edition's `command-menu.tsx` gives the open state, the shortcuts and an `instant` flag for keyboard opens; the dialog itself is a lazy import. Editions on the standard prefs use `useCommandDialog({ open, onOpenChange, prefs, setPrefs, copy, goSequence, hrefForUpdate })`; the others use `useCommandData({ open, search, makeActions, hrefForUpdate, ownerEntry })`. `hrefForUpdate` maps a changelog year to the edition's anchor (`/now#log-<year>`, or Minimal's `/changelog#<year>`). `goKeys` and `goSequence` wrap `lib/command/shortcuts.ts`.
- **Everything else:** the ask, link-preview, visitor-count, copy-email, reveal, pointer, cursor and scene-mount hooks listed under "Shared layer". The edition renders all markup.

### 3. Registration

1. Add or flip the edition in `flavors/registry.ts` to `status: "live"`. `liveFlavors` and `isLiveFlavor` derive from it, and the proxy starts routing the cookie to `/f/<id>/*`.
2. Add a `.prettierrc` override that points `tailwindStylesheet` at `flavors/<id>/styles.css` for `flavors/<id>/**` and `app/f/<id>/**`.
3. Add the edition's design doc to `docs/` and list it in `docs/README.md`.

### 4. Tests and gates

- Unit tests for the edition's pure code: `shortcuts.test.ts` for its `goKeys`, prefs tests if it has its own schema or migration, and tests for any local model (`utils.test.ts` for `cn`, scene poses, dates).
- `e2e/static-routes.spec.ts` checks that every live edition's routes are prerendered (it reads `liveFlavors`). The browser e2e and axe projects in `playwright.config.ts` cover Minimal and Drawing Set only; add a project for the new edition when it needs browser coverage.
- Run `bun run type-check`, `bun run lint`, `bun run test -- --maxWorkers=2`, `bun run build` and `bun run budget`, then a browser pass of the edition's home and one inner page with zero console errors or warnings.
