# M1b: rebuild every page as the Drawing Set (read before writing code)

The user chose the **Drawing Set** direction. Read these first, in this order:

1. `docs/design.md`: the design system (thesis, tokens, type, layout, page patterns, motion, voice). It is the source of truth for visuals.
2. `docs/mocks/drawing-set.html`: the approved mock (header, frame, hero, register table, title block, three.js linework chest). Match its craft: exact type settings, hairlines, spacing and restraint. Open the file and read the CSS; don't guess.
3. `docs/m1-conventions.md`: the hard rules, data accessors, accessibility rules, interaction attributes and folder ownership still apply. Its "Tokens" and "Visual language" sections are **replaced** by this file and `docs/design.md`.

The existing M1 components work (data, a11y, behaviour) but look generic. Keep their behaviour and data wiring; **rewrite their markup and styling** to the Drawing Set. Delete components that no longer have a place, and grep for their imports.

## Hard rules (in addition to m1-conventions)

- Write only in the folders you own (table below). Absolute paths. Never touch `/Users/rajput-hemant/Projects/NextJS/website`.
- Allowed commands: `bunx eslint <files>` and `bunx prettier --write <files>`, one at a time. No `tsc`, installs, dev servers, builds, git, or tests. The coordinator runs the full checks.
- No em dashes anywhere (code, copy, comments). Minimal comments. Server components by default.
- Text is real DOM from first paint. Nothing above the fold waits for JS. Every hover effect sits behind `fine:`; every movement sits behind `motion:` or `motionOn()`.

## Tokens (already in `app/globals.css`; do not edit tokens)

Colours (auto light/dark via `light-dark()`): `ground`, `sheet`, `sheet-deep`, `ink`, `ink-soft`, `ink-faint`, `line`, `line-strong`, `accent` (the redline, visitor hue), `accent-soft`, `accent-contrast`, `danger`. Use as `bg-ground text-ink border-line text-ink-soft text-accent`.

**Removed names:** `paper`, `graphite`, `pencil`, `rule`, `hairline`, `lamp`, `moon`, `ink-raised`, `ink-sunken`. `ink` now means the text/linework colour (it used to be the ground). Grep your files for the old names and replace them all: Tailwind silently ignores unknown classes.

Fonts:

- `font-display`: Archivo, variable `wdth` 62-125. Condensed caps titles use `font-stretch: 62%-75%` (Tailwind: `[font-stretch:66%]`), weight 500-620, `uppercase`.
- `font-text`: Newsreader, the body default. Prose, leads, statements.
- `font-mono`: Azeret Mono, for labels, sheet numbers, dates, table heads and kbd. Uppercase, `tracking-[0.08em]`, tabular numerals.
- `font-sans` is aliased to `font-text`. There is no geometric sans.

Type steps: `text-mono-xs` (11), `text-mono-sm` (12), `text-mono` (13), `text-sm` (15), `text-base` (18), `text-lead` (22), `text-h3` (24), `text-h2` (36), `text-statement`, `text-display` (the h1).

Other tokens: `rounded-sm|md|lg` are 2-4px (drawings are square). `px-gutter`, `py-section`, `ease-glide|enter|exit|flick`, `shadow-lift` (use sparingly). The `--frame-inset` CSS var is 12px (8px on mobile, set by the shell).

## The shared Drawing Set primitives

These are owned by the UI agent. Import them from `@/components/ui` exactly like this:

| Component                                                                                                                                                                                                                                 | API                                                                                                                       | Renders                                                                                                                                                                                                                                                                                                                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PageHeader`                                                                                                                                                                                                                              | `{ sheet: string; eyebrow?: string; title: string; lede?: ReactNode; meta?: {label,value}[] }`                            | The sheet title. A mono row (`SHEET 02 · EXPERIENCE`), then the h1 in condensed caps (`text-display`, `SplitHeading`), an optional Newsreader lede, and an optional right-hand `MetaList`.                                                                                                                              |
| `SheetHeading`                                                                                                                                                                                                                            | `{ n?: string; title: string; aside?: ReactNode; as?: "h2"\|"h3"; id?: string }`                                          | The mock's `.sh` section head: a 120px mono number column, a condensed-caps h2 (56px desktop, 36px mobile), a right-hand mono aside, and a `line-strong` bottom rule.                                                                                                                                                   |
| `Dimension`                                                                                                                                                                                                                               | `{ label: string; start?: string; end?: string; orientation?: "h"\|"v"; className? }`                                     | A dimension line: arrowheads, end ticks and a centred mono label on a `ground` knockout, in `line-strong`. It plots in (stroke-dashoffset, 400ms) when it scrolls into view with motion on, and is fully drawn otherwise. `aria-hidden` lines, with the label also as visually hidden text. Only for true measurements. |
| `Callout`                                                                                                                                                                                                                                 | `{ letter: string; label: string; meta?: string; href?: Route; active?: boolean }`                                        | A letter bubble (26px circle, mono), a condensed-caps label and a mono meta line. It goes redline on hover, focus or `active`.                                                                                                                                                                                          |
| `Stamp`                                                                                                                                                                                                                                   | `{ children: string; meaning: string; tone?: "accent"\|"ink" }`                                                           | The rotated (-2.5deg) mono stamp with a 1.5px border, wrapped in `<abbr title={meaning}>`. `meaning` is also rendered visually hidden.                                                                                                                                                                                  |
| `TitleBlock`                                                                                                                                                                                                                              | `{ rows: {label,value}[]; sheet: string; total: string; rev: string; className? }`                                        | The boxed title block from the mock (`.tb`): a dl on the left, and SHEET and REV cells on the right.                                                                                                                                                                                                                    |
| `Schedule`                                                                                                                                                                                                                                | `{ caption: string; columns: {key,label,align?,className?}[]; rows: Record<string,ReactNode>[]; rowHref?: (row)=>Route }` | A real `<table>` styled like the mock's register: mono heads, hairline rows, and a redline margin tick on row hover. With `rowHref`, the first cell holds the link and the row is clickable.                                                                                                                            |
| `Button`                                                                                                                                                                                                                                  | as before (`variant primary\|ghost\|quiet`, `size`, `asChild`, `magnetic`)                                                | Restyled to the mock's `.cta`: condensed caps with an underline. Primary has a redline underline and arrow. No filled pills.                                                                                                                                                                                            |
| `ArrowLink`, `ExternalLink`, `Tag`, `Kbd`, `MetaList`, `DateStamp`, `CatalogueNumber`, `RichText`, `Disclosure`, `Dialog`, `Popover`, `Switch`, `SegmentedControl`, `Slider`, `Tooltip`, `Container`, `Section`, `SplitHeading`, `Reveal` | APIs unchanged                                                                                                            | Restyled to the Drawing Set. `CatalogueNumber` renders `DWG 014` by default (prefix prop). `Tag` is a mono label with a hairline box.                                                                                                                                                                                   |

The shell agent owns these, and pages don't render them: the drawing frame, header, dock, footer (the page-end title block and links), the cursor, and `<SceneSlot>`.

## Sheet numbers (the set index)

`00` Home, `01` Projects, `02` Experience (/work), `03` Lab, `04` About, `05` Now, `06` Ask (RFI), `07` Resume. The shell exports them as `sheets` in `content/site.ts`, as `{ href, label, sheet }[]` extending the nav. Pages read `sheets` for their `sheet` prop, never hardcode it.

## Page patterns

Follow `docs/design.md` "Page patterns" exactly.

- **Home:** hero as in the mock. Selected sheets. Current revision.
- **Projects:** the drawing register table with stamps and a legend; featured projects first as large sheets.
- **Project:** the case study sheet.
- **Experience:** the chain dimension.
- **About:** schedules and general notes.
- **Now:** revisions.
- **Ask:** the RFI log.
- **Resume:** Sheet A4.
- **Lab:** studies.
- **404:** "Sheet not found in set".

Status stamps map to project status. `ISSUED` means active, `AS BUILT` means maintained, `SUPERSEDED` means archived and `IN PROGRESS` means wip. Check `lib/data/types.ts` for the real status values and map every one.

## Motion (docs/design.md "Motion")

- **Plotting:** the one orchestrated moment. The first load in a session draws the frame, ticks, title block rules and hero dimension line (the shell does this).
- **Client navigation:** only the new sheet's dimension lines re-plot (the `Dimension` primitive does it).
- **Hover:** redline leaders and margin ticks, 200ms.
- **Tilt:** only on large sheet previews, max 4deg (`data-tilt`).
- **Reduced motion:** everything present, nothing moves.

## Performance (the JS budget is failing: about 290KB against 180KB)

- The shell agent owns the fix. Defer the whole motion stack (Lenis, the GSAP ticker bootstrap, the cursor, and link previews) until after first paint and idle, via `next/dynamic` with `ssr:false` or `import()` in an idle callback. It must not be in the initial chunks.
- `SplitHeading` (UI agent) must lazy-import `gsap/SplitText` only when a split is actually needed. It is needed on client navigation or scroll-in, never on first paint.
- Nobody imports `gsap` at module top level in a component that renders on first paint. Use the `motionOn()` and `import()` pattern.

## Folder ownership (write only in yours)

| Agent    | Owns                                                                                                                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shell    | `app/layout.tsx`, `app/(site)/layout.tsx`, `app/not-found.tsx`, `app/(site)/not-found.tsx`, `components/site/**`, `components/interaction/**`, `components/motion/smooth-scroll.tsx`, `components/prefs/**`, `lib/motion/**`, `lib/interaction/**`, `app/globals.css` (utilities and the base layer only, never the tokens), `content/site.ts`, `next.config.ts`, `scripts/check-budget.ts` |
| UI       | `components/ui/**`, `components/motion/split-heading.tsx`, `components/motion/reveal.tsx`                                                                                                                                                                                                                                                                                                   |
| Pages A  | `app/(site)/page.tsx`, `app/(site)/projects/**`, `components/home/**`, `components/projects/**`                                                                                                                                                                                                                                                                                             |
| Pages B  | `app/(site)/work/**`, `app/(site)/about/**`, `app/(site)/now/**`, `app/(site)/resume/**`, `components/work/**`, `components/about/**`, `components/now/**`, `components/resume/**`                                                                                                                                                                                                          |
| Features | `app/(site)/ask/**` (not `_lib`, `feed.xml` or `opengraph-image.tsx`), `app/(site)/owner/**`, `components/ask/**`, `components/command/**`, `components/customize/**`, `components/visitor-counter/**`, `components/link-preview/**`, `app/(site)/lab/**`, `components/lab/**`                                                                                                              |
| Scene    | `components/scene/**`, `lib/scene/**`, `docs/m2-scene-spec.md`                                                                                                                                                                                                                                                                                                                              |

If you need something in another agent's folder, don't write it. Put it in your final report under "Needs from others".

## Final report (every agent)

- Files changed, created and deleted.
- Anything you couldn't finish.
- "Needs from others".
