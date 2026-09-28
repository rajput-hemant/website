# Flavors: one site, several editions

A flavor is a complete visual edition of the portfolio: tokens, fonts, page layouts, motion and 3D scene. Every flavor shares the same content, URLs, data layer, APIs and accessibility contract. We ship one flagship first; the architecture lets more be added without touching the others.

## Principles

1. **Clean, shared URLs.** `/projects` is `/projects` in every flavor. The flavor is a visitor preference, never part of the public URL.
2. **Static stays static.** Pages never read cookies. The flavor is resolved before rendering, by a rewrite.
3. **Pay only for the flavor you see.** A flavor's page code, fonts and scene live in its own route tree and chunks. Nothing from another flavor loads until you switch.
4. **Semantics shared, presentation owned.** Data, metadata, markdown mirrors, JSON-LD, /ask logic, ⌘K and prefs are shared. Each flavor owns only how things look and move.
5. **Additive.** Adding a flavor means adding a folder and one registry entry. No edits to other flavors.

## Routing (as built)

```
app/
  api/**  md/**  ask/feed.xml  sitemap.ts  robots.ts  llms.txt  search.json   shared, never rewritten
  studio/            own bare root layout
  flavors/           the edition picker (own root layout)
  f/minimal/         Minimal's static tree and root layout (the default edition)
  f/drawing-set/     Drawing Set's static tree and root layout
  f/surface/         Control Surface's static tree and root layout
  f/timetable/       Timetable's static tree and root layout
  f/survey/          Field Survey's static tree and root layout
  global-not-found.tsx
proxy.ts             markdown mirrors, then routeFlavor (lib/flavor-routing.ts)
flavors/
  registry.ts        every edition: live or future, name, tagline, swatch
  minimal/           components/, lib/, content.ts, styles.css
  drawing-set/       components/, lib/, content.ts, styles.css
  surface/           components/, lib/, content.ts, styles.css
  timetable/         components/, lib/, content.ts, styles.css
  survey/            components/, lib/, content.ts, styles.css
  picker/            the picker's styles and components
```

- **One static tree per edition**, each with its own root layout, fonts, CSS and prefs key. No component or file contains more than one edition. Moving between editions is a full page load (different root layouts), which switching needs anyway.
- **`routeFlavor`** (pure, unit tested):
  - `?flavor=<id>` sets the `hr_flavor` cookie and 307s to the clean URL. This is how the picker works without JS.
  - `/` with no valid cookie is rewritten to `/flavors` (the picker). This applies to first visits only.
  - Every other path goes to the cookie's edition, or to the default (`minimal`), so deep links and crawlers always get a real page.
  - `/f/*` and `/flavors` pass through untouched. `/f/*` sends `X-Robots-Tag: noindex`.
- **Pages one edition lacks** redirect inside that edition:
  - Minimal: `/about` goes to `/work`, and `/projects/<slug>` goes to `/projects`.
  - Drawing Set, Control Surface, Timetable and Field Survey: `/changelog` goes to `/now#log`.
- **Not found.** Unknown paths hit a `[...missing]` catch-all in the edition, so its own 404 renders. URLs outside every edition get `global-not-found`.
- **Canonical and sitemap.** Canonical URLs are always the clean path. The sitemap lists the default edition's pages (`only` in `content/site.ts`).
- **Switching.** The footer of each edition links to `/flavors` ("Change edition").

## Rules every flavor follows

- **One data source.** Every flavor reads the same Sanity project (`y9f5m131`, dataset `production`) through the shared `lib/data` accessors. No flavor has its own schema, queries or content copies. Schema changes stay additive.
- **Home shows experience.** Every flavor's home page presents the experience (roles, dates, tenure) above the fold or directly below the hero. Featured projects may appear too, after it.
- **3D where the edition calls for it.** Drawing Set, Control Surface, Timetable and Field Survey keep a persistent WebGL canvas. Drawing Set, Timetable and Field Survey share the scene store, clock, tiers and DOM contract in `lib/scene/` and the loader hook in `components/semantic/scene/`; each keeps its own poses and world in its `lib/scene/` and `components/scene/`. Minimal uses WebGL only on `/lab` experiments. Every route still works fully at T0 (poster plus DOM).
- **Designs evolve.** A flavor's mock is a starting point, not a frozen spec. Pages are refined as they are built.
- **Clean code.** Flavors own presentation only. Logic (dates, tenure, data shaping) lives in shared pure modules under `lib/` with unit tests, never copied into a flavor.

## Shared layer (flavor-agnostic)

These don't change per flavor:

- `lib/data`, `lib/ask`, `lib/visits`, `lib/markdown`, `lib/command`, `lib/metadata`, `lib/prefs` (including `lib/prefs/standard.ts`, the theme, motion, scene, sound and link-preview schema an edition can adopt with only its own key)
- API routes, sitemap, robots, OG images. OG cards stay neutral, or use the default flavor's look.
- `components/semantic/*`: accessible behaviour without visual opinion, for example:
  - `use-copy-email`, `use-command-data` and `use-command-shortcuts`, ask hooks (`use-composer`, `use-thread-reply`, `use-moderation`, `owner-provider`), `use-visitor-count`, lab canvas helpers (`canvas-stage`, `signature-field-scene`), prefs pre-paint helpers
  - Edition-specific chrome still owns headings, reveals and motion styling; shared hooks stay presentation-agnostic
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

1. Build it in `flavors/<id>/` (components, lib, content, styles.css scoped with `source(none)` and `@source`) and `app/f/<id>/` (root layout, every public path, a `[...missing]` catch-all, redirects for pages it doesn't have).
2. Set its registry entry's `status` to `"live"`. The proxy, picker, e2e static-routes check and budget script pick it up.
3. Add a Prettier override pointing `tailwindStylesheet` at its styles.
