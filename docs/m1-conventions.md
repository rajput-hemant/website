# M1 conventions (read before writing any M1 code)

Full plan: `docs/plan.md` (concept "The Night Archive"; sections 1, 2, 5, 8 matter for M1). M1 = the complete site as finished DOM designs with NO 3D (the 3D scene arrives in M2 behind `<SceneSlot/>`). The no-3D site must already look award-level: editorial, precise, calm, nocturnal, tactile.

Reference implementation for behaviour/data (NOT for visuals): branch `claude/serene-hawking-jxyjn0`, read with
`git -C /Users/rajput-hemant/Projects/NextJS/website show "claude/serene-hawking-jxyjn0:<path>"` (always quote `"branch:path"`; zsh breaks otherwise). Port logic, redesign visuals.

## Hard rules for every agent

- Write ONLY inside `/Users/rajput-hemant/Projects/NextJS/website-3d`, ONLY in the folders you own (below). Use absolute paths. Never write to `/Users/rajput-hemant/Projects/NextJS/website`.
- Do NOT run `bun install/add`, `next dev`, `next build`, `tsc`, `vitest` or any server. The only allowed command is `bunx eslint <your files>` and `bunx prettier --write <your files>`, one at a time. A verifier agent runs the full checks after everyone finishes. If you need a new dependency, list it in your report instead of installing it.
- No git commits, no stash, no branch changes.
- Never use em dashes. Minimal comments (only non-obvious "why"). `bunx` not `npx`.
- Prefer existing libraries over hand-rolled code (installed: gsap 3.15 incl. ScrollTrigger/SplitText/CustomEase, @gsap/react, lenis, zustand, cmdk, tinykeys, @base-ui/react 1.8, @number-flow/react, @portabletext/react, lucide-react, clsx, tailwind-merge, zod, web-vitals).
- Server components by default. `"use client"` only for interactive leaves. Pages never read cookies/headers/searchParams (they are static).
- Data only through `@/lib/data` accessors (`getProfile`, `getExperience`, `getProjects`, `getNow`, `getChangelog`, `getSkills`, `getEducation`, `getQuestions`). Types in `lib/data/types.ts`. Page copy/descriptions from `content/site.ts` `pages`/`sitePage()`; metadata via `pageMetadata()` from `lib/metadata.ts`.
- Accessibility is non-negotiable: semantic landmarks, one h1 per page, real links/buttons, visible `:focus-visible`, 44px touch targets, no hover-only information, WCAG AA contrast, `prefers-reduced-motion` via `data-motion`.

## Tokens (app/globals.css, Tailwind v4 `@theme`)

Colours (auto light/dark): `ink` (ground), `ink-raised`, `ink-sunken`, `paper` (primary text), `graphite` (secondary text, AA), `pencil` (tertiary, large text/meta only), `rule`, `hairline`, `lamp` (warm highlight), `moon` (cool), `accent`, `accent-soft`, `accent-contrast`, `danger`. Use as `bg-ink text-paper border-rule text-graphite text-accent` etc.
Fonts: `font-display` (Fraunces, headings), `font-sans` (Geist, body/UI), `font-mono` (Geist Mono, catalogue labels/meta/dates/kbd).
Type: `text-mono-xs text-sm text-base text-lg text-xl text-2xl text-3xl text-display`.
Spacing: `px-gutter`, `py-section`. Radius: `rounded-sm|md|lg`. Shadow: `shadow-lift`. Easing: `ease-glide ease-enter ease-exit ease-flick`. Durations (CSS vars): `--duration-press|ui|route-out|route-in`.
Variants: `dark:`, `motion:` (only when motion on), `fine:` (hover-capable fine pointer; put every hover effect behind it).

## Visual language ("catalogue")

- Editorial 12-col grid on desktop (`max-w-[88rem] mx-auto px-gutter`), prose measure 62-68ch, generous whitespace, left-aligned. Mobile single column.
- Motifs: catalogue numbers in mono (`No. 014`, `A-03`), dates as `2026.09` in mono tabular, hairline rules (`border-hairline`), "label holder" chips (mono xs uppercase tracking-[0.14em] in a hairline box), index cards (ink-raised surface, a thin accent top rule), margin notes on desktop (right column, graphite, sm).
- Headings: Fraunces, weight ~420, tight tracking on display (`tracking-[-0.02em]`). Body Geist 17px. Never bold beyond 600.
- Colour restraint: ink + paper + graphite; accent only for focus, active nav, small rules, links on hover. No gradients except the tilt glare.
- Motion: first paint is final (never hide above-the-fold text waiting for JS). Reveals only for content entering on scroll or after client navigation, transform/opacity only, 220-320ms `ease-enter`.

## Interaction contract (already implemented by InteractionLayer, just use the attributes)

- `data-magnetic` on a link/button: pulls toward the pointer (≤10px). Optional child `data-magnetic-inner` moves at half. Needs `display:inline-flex` or block.
- `data-tilt` on a card: sets CSS vars `--rx --ry` (deg) and `--mx --my` (% pointer position) while hovered, attribute `data-tilting` while active. Use utility class `tilt` (transform) and `tilt-glare` (glare overlay child), provided by the shell agent in globals.css.
- `data-cursor="Open"` (any label) on an element: the custom cursor shows that label on hover.
- `press` utility class: press-down on `:active` (scale .97 + shadow), also on keyboard activation.
- Shared state: `pointer` (`lib/interaction/pointer.ts`), `scroll` (`lib/motion/scroll.ts`), `motionOn()` and gsap exports (`lib/motion/gsap.ts`), `useMotionOn()` (`lib/motion/use-root-data.ts`), `usePrefs/setPrefs` (`lib/prefs-store.ts`), prefs model (`lib/prefs.ts`).

## Shared component APIs (implemented by the owners below; import them exactly like this)

`@/components/ui` barrel (owner: UI agent):

- `cn(...classes)` is in `@/lib/utils` (exists).
- `<Container className? as?>` max-width grid wrapper. `<Section id? label? title? className>` with an optional mono label holder and h2.
- `<PageHeader eyebrow? title lede? meta?>`: page h1 block. `eyebrow` = mono catalogue label (e.g. "Drawer 02 · Experience"). `title` string or node, rendered with `<SplitHeading as="h1">`.
- `<SplitHeading as="h1"|"h2"|"h3" className? children>`: client; SplitText line reveal ONLY on client navigations / scroll-in, never on first paint; nothing under reduced motion.
- `<Reveal as? delay? className>`: client; fade+rise on scroll-in (IntersectionObserver or ScrollTrigger), no-op when motion off, content visible without JS.
- `<Button variant="primary"|"ghost"|"quiet" size="sm"|"md" asChild?>` (press + optional magnetic prop `magnetic`), `<IconButton label>`, `<ArrowLink href external?>` (text link with arrow that nudges on hover, magnetic), `<ExternalLink href>`.
- `<Tag>` (label holder chip), `<Kbd>`, `<MetaList items={[{label, value}]}>` (mono dl), `<CatalogueNumber n prefix?>` ("No. 014"), `<DateStamp date="YYYY-MM-DD" precision="month"|"day">` (mono, `<time>`).
- `<RichText value>` Portable Text renderer (port behaviour from reference `components/ui/portable-text.tsx`).
- `<Disclosure summary children>` accessible expand (port behaviour from reference `components/ui/disclosure.tsx`).
- Base UI wrappers: `<Dialog>`, `<Popover>`, `<Switch>`, `<SegmentedControl>`, `<Slider>`, `<Tooltip>` styled to the tokens.

`@/components/site` (owner: shell agent):

- `<Page>` wraps each page's content in React `<ViewTransition enter="page-in" exit="page-out" default="none">` plus `<main id="main">`. EVERY page.tsx renders its content inside `<Page>`.
- `<SceneSlot route="home"|"projects"|"project"|"work"|"about"|"now"|"ask"|"lab"|"resume"|"notfound" size="hero"|"window"|"none">`: M1 renders a designed, static CSS/SVG placeholder of the archive (label holders, drawer fronts) sized for the route; M2 swaps in the canvas. Pages place it where the scene belongs.
- Header, mobile dock, footer, skip link, nav are in the layout; pages don't render them.

## Folder ownership (write only in yours)

| Agent    | Owns                                                                                                                                                                                                                                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell    | `app/layout.tsx`, `app/(site)/layout.tsx`, `app/not-found.tsx`, `app/(site)/not-found.tsx`, `components/site/**`, `components/interaction/cursor.tsx`, `components/interaction/*.css`, `next.config.ts`, `app/globals.css` (append utilities only; don't restructure tokens), `content/site.ts` |
| UI       | `components/ui/**`, `components/motion/split-heading.tsx`, `components/motion/reveal.tsx`                                                                                                                                                                                                       |
| Pages A  | `app/(site)/page.tsx`, `app/(site)/projects/**`, `components/home/**`, `components/projects/**`                                                                                                                                                                                                 |
| Pages B  | `app/(site)/work/**`, `app/(site)/about/**`, `app/(site)/now/**`, `app/(site)/resume/**`, `components/work/**`, `components/about/**`, `components/now/**`, `components/resume/**`                                                                                                              |
| Ask      | `app/(site)/ask/**` except the already-ported `_lib`, `feed.xml`, `opengraph-image.tsx` files; `app/(site)/owner/**`; `components/ask/**`                                                                                                                                                       |
| Features | `components/command/**`, `components/customize/**`, `components/visitor-counter/**`, `components/link-preview/**`, `app/(site)/lab/**`, `components/lab/**`                                                                                                                                     |

The existing placeholder `app/page.tsx` is deleted by the shell agent (home moves to `app/(site)/page.tsx`).

Information architecture (plan section 2): nav = Projects, Experience (`/work`), Lab, About; right side Resume + ⌘K. Footer: Now, Ask, RSS, Resume, email, GitHub, LinkedIn, visitor counter. `/changelog` 308-redirects to `/now#log`. `/about` is new (bio, skills, education, contact). `/owner` noindex.
