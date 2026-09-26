# Flavors: one site, several editions

A flavor is a complete visual edition of the portfolio: tokens, fonts, page layouts, motion and 3D scene. Every flavor shares the same content, URLs, data layer, APIs and accessibility contract. We ship one flagship first; the architecture lets more be added without touching the others.

## Principles

1. **Clean, shared URLs.** `/projects` is `/projects` in every flavor. The flavor is a visitor preference, never part of the public URL.
2. **Static stays static.** Pages never read cookies. The flavor is resolved before rendering, by a rewrite.
3. **Pay only for the flavor you see.** A flavor's page code, fonts and scene live in its own route tree and chunks. Nothing from another flavor loads until you switch.
4. **Semantics shared, presentation owned.** Data, metadata, markdown mirrors, JSON-LD, /ask logic, ⌘K and prefs are shared. Each flavor owns only how things look and move.
5. **Additive.** Adding a flavor means adding a folder and one registry entry. No edits to other flavors.

## Routing

```
app/
  (shared)/                      not flavor-specific, never rewritten
    api/**  md/**  llms.txt  sitemap.ts  robots.ts  search.json  studio/**  ask/feed.xml
  f/[flavor]/                    one static tree per flavor (generateStaticParams over the registry)
    layout.tsx                   loads the flavor's shell (fonts, tokens, header, scene loader)
    page.tsx  projects/  projects/[slug]/  work/  about/  now/  ask/  lab/  resume/  owner/
    not-found.tsx
proxy.ts                         rewrites /<path> -> /f/<flavor>/<path>
```

- **`proxy.ts`**
  - Reads the `hr_flavor` cookie. The value is validated against the registry: an unknown value falls back to the default.
  - Rewrites page requests to `/f/<flavor>/<path>`.
  - The matcher excludes `/_next`, `/api`, `/md`, `/studio`, static files and `.md`, `.xml` and `.txt`. The existing markdown-mirror rewrite is folded in.
  - A visitor with no cookie gets the default flavor. That includes crawlers, so the default is what gets indexed.
- **Static pages.** The pages under `f/[flavor]/` are statically generated per flavor, and each segment is a cached HTML file on the CDN. `dynamicParams = false` on `[flavor]`, so direct hits to `/f/unknown/...` return 404.
- **Canonical URLs.** `alternates.canonical` always points at the clean path (`/projects`). `/f/*` is disallowed in `robots.txt` and sends `X-Robots-Tag: noindex` from the proxy/headers, so internal paths never compete in search.
- **Switching.**
  1. The Customize panel, the ⌘K "Edition" group and the footer "Edition" link write the cookie (`SameSite=Lax`, 1 year, not httpOnly: it's a preference, not a secret) and mirror it in localStorage.
  2. They then call `router.refresh()` plus a hard navigation to the current path, so the proxy serves the new tree.
  3. A View Transition crossfades the whole document; the new flavor's fonts and scene load at that point.
- **Share links.** `?flavor=<id>` on any URL sets the cookie in the proxy, then 307-redirects to the clean URL. That makes an edition shareable.
- **Editions page** (later). `/editions` previews every flavor with its poster image and switches on click.

## The flavor contract

```ts
// flavors/registry.ts  (the only file every flavor touches)
export const flavors = {
  "drawing-set": {
    name: "Drawing Set",
    tagline: "...",
    default: true,
    poster: "/flavors/drawing-set.avif",
  },
  // "field-survey": { ... },
} as const satisfies Record<string, FlavorMeta>;
export type FlavorId = keyof typeof flavors;
```

```
flavors/<id>/
  tokens.css        CSS variables (colour, type, radii, motion), scoped under [data-flavor="<id>"]
  fonts.ts          next/font instances; loaded only by this flavor's layout
  shell.tsx         header, nav, footer, dock, cursor style (server + small client leaves)
  pages/            one component per route: HomePage, ProjectsPage, WorkPage, AboutPage, NowPage,
                    AskPage, LabPage, ResumePage, NotFoundPage, ProjectPage
  scene/            this flavor's 3D scene (lazy chunk) + static poster fallback
  components/       anything private to the flavor
```

- `app/f/[flavor]/<route>/page.tsx` stays tiny:
  1. fetch the data once through the shared accessors
  2. `const Page = pages[flavor].ProjectsPage` from a registry map of dynamic imports
  3. render it inside the shared `<Page>` transition wrapper
- Each flavor page component receives typed props (`ProjectsPageProps`, and so on) defined in `flavors/contract.ts`. Every flavor gets the same data and must render the same required content, which keeps markdown mirrors, SEO and tests flavor-agnostic.
- **Contract test.** A single test renders every registered flavor's pages with fixture data and asserts:
  - one h1, the landmarks, all required content present
  - links to every nav route
  - no text rendered only in canvas

## Shared layer (flavor-agnostic)

These don't change per flavor:

- `lib/data`, `lib/ask`, `lib/visits`, `lib/markdown`, `lib/command`, `lib/metadata`, `lib/prefs`
- API routes, sitemap, robots, OG images. OG cards stay neutral, or use the default flavor's look.
- `components/semantic/*`: accessible behaviour without visual opinion, for example:
  - `CopyEmail`, `Disclosure` (headless), `CommandMenu` logic, the ask chat state machine (`useAskThread`), `VisitorCount` (data hook), link-preview logic
  - `SplitHeading`/`Reveal` motion primitives, parameterised by flavor tokens
- Motion core: the single GSAP clock, Lenis, the pointer source, View Transitions and the reduced-motion policy.
- The scene loader, quality tiers and the frame-loop contract (`docs/m2-scene-spec.md`). Only the scene content is per flavor.

## Budgets per flavor

The same caps apply to every flavor, enforced by `scripts/check-budget.ts` iterating over `/f/<flavor>/*`:

| Item         | Cap                                   |
| ------------ | ------------------------------------- |
| Text-page JS | ≤ 180 KB gz (/ask ≤ 240)              |
| Scene chunk  | ≤ 300 KB gz, deferred until after LCP |
| Fonts        | ≤ 3 preloads, ≤ 120 KB                |

- Shared eager code (the motion core) is counted once and must not grow per flavor.
- Lighthouse CI runs on the default flavor for every route, plus each flavor's home and projects pages.

## Adding a flavor later

1. Copy `flavors/_template`: stub pages that satisfy the contract.
2. Fill in tokens, fonts, shell, pages and scene.
3. Add the registry entry. The contract test, budget script and visual-regression suite pick it up automatically.
4. Generate its posters (`scripts/posters.ts --flavor <id>`).

## What changes in the current codebase

- **Moves:**
  - `app/(site)/*` → `app/f/[flavor]/*`
  - the current visual components → `flavors/<flagship>/`
  - the generic behaviour pieces (ask state, copy email, command logic) → `components/semantic/`
- **New files:** `proxy.ts` rewrite logic plus its unit tests, `flavors/registry.ts`, `flavors/contract.ts`, the contract test, and an Edition control in Customize and ⌘K.
- **Prefs:** `lib/prefs.ts` stays per-visitor UI prefs. The flavor lives in its own cookie because the proxy needs it server-side; prefs can stay in localStorage.
