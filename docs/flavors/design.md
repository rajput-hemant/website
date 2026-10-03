# Design system: "The Drawing Set"

Last updated: 2026-09-26 at or before `977bb60` (shallow history boundary). Not re-verified in the 2026-09-27 docs cleanup.

This supersedes the visual sections of `docs/archive/plans/plan-2026-09-26.md` (1.3-1.5) and `docs/archive/plans/m1-conventions-2026-09-26.md` ("Visual language"). The IA, performance, accessibility and interaction contracts stay.

## Thesis

A plan chest's real job is to store engineering drawings. So the portfolio is presented as the engineer's **drawing set**: every page is a sheet, and the site borrows the real conventions of technical drawings to encode real facts.

| Drawing convention            | Carries                    |
| ----------------------------- | -------------------------- |
| Sheet number                  | Page order in the set      |
| Title block                   | Who, status, last revision |
| Drawing register              | The project index          |
| Revision table                | The changelog              |
| Dimension lines               | Real durations and years   |
| RFI (request for information) | /ask                       |

**Themes:** night is a **cyanotype** (Prussian-blue ground, cyan-white linework). Day is a **diazo whiteprint** (cool paper, blue-violet ink). Both are real historical reproduction processes for drawings, which is why the two themes exist.

**Accent:** the reviewer's **redline** pencil, used only for markup: focus, active state, annotations, the cursor, the live callout.

The 3D scene (M2) matches: the plan chest and drafting table are rendered as live linework (edges + flat fills), like a drawing that turns into perspective when you touch it. No PBR, no shadows. It's distinctive and cheap on the GPU.

**What this is not:** blueprint grid paper on every surface, Space Mono, cyan-on-navy neon. Restraint: one frame, one title block, dimension lines only where they state a fact.

## Tokens

| Role          | Night (cyanotype)                    | Day (whiteprint)                     | Notes                                |
| ------------- | ------------------------------------ | ------------------------------------ | ------------------------------------ |
| `ground`      | `#0E2542`                            | `#ECEEE9`                            | page                                 |
| `sheet`       | `#122D4F`                            | `#F4F5F1`                            | raised sheet, register rows          |
| `sheet-deep`  | `#0A1D36`                            | `#E2E5DF`                            | wells, code, inputs                  |
| `ink`         | `#DCE8F0`                            | `#1E2C74`                            | primary text and linework            |
| `ink-soft`    | `#9DB7CB`                            | `#4C5796`                            | secondary text (AA on ground)        |
| `ink-faint`   | `#819EB5`                            | `#55609B`                            | meta (AA on every surface)           |
| `line`        | `rgb(220 232 240 / 0.22)`            | `rgb(30 44 116 / 0.2)`               | rules, frame                         |
| `line-strong` | `rgb(220 232 240 / 0.5)`             | `rgb(30 44 116 / 0.5)`               | dimension lines                      |
| `redline`     | `oklch(0.72 0.17 var(--accent-hue))` | `oklch(0.46 0.17 var(--accent-hue))` | visitor hue, default 32 (red-orange) |

- Accent presets: redline 32, amber 70, verdigris 165, cobalt 255, violet 300, magenta 350.
- Texture: a static SVG turbulence mottling at 3-4% opacity on `ground` (the cyanotype wash) and 2% on day. Never animated, never on `sheet`.

## Type

- **Display: Archivo** (variable `wdth` 62-125, `wght` 100-900).
  - Sheet titles are set UPPERCASE, condensed (wdth 62-75), weight 500-600, tracking -0.01em. This is drawing-title lettering.
  - Large statements use wdth 100-112, weight 300, sentence case.
- **Text: Newsreader** (variable `opsz`, roman + italic).
  - Narrative prose reads like an engineer's notebook; the warmth against the technical frame is deliberate. 18px base, line-height 1.6, measure 60-66ch.
- **Utility: Azeret Mono**, for annotation and data: sheet numbers, dates, dimension labels, table heads, kbd, the cursor readout. 11-13px, uppercase for labels with tracking 0.08em; tabular numerals.
- **Scale** (px, fluid at the top):

| Step      | Size                                   |
| --------- | -------------------------------------- |
| mono      | 11 / 12 / 13                           |
| text-sm   | 15                                     |
| text      | 18                                     |
| lead      | 22                                     |
| h3        | 24                                     |
| h2        | 36                                     |
| h1        | `clamp(48, 9vw, 168)` (condensed caps) |
| statement | `clamp(28, 3.4vw, 52)`                 |

- **Loading:** preload Archivo and Newsreader roman only. The mono and the italic load with swap.

## Layout: the sheet

- **Drawing frame.** Fixed, inset 12px (mobile 8px), 1px `line`, with grid reference ticks: letters along the top, numbers down the left, every 1/8 of the viewport.
  - The tick labels are mono 10px `ink-faint`, shown on desktop only.
  - The frame is aria-hidden decoration, and it _is_ the coordinate system the cursor readout refers to.
- **Sheet header** (inside the frame, top):
  - Left: `H. RAJPUT` wordmark in Archivo condensed caps.
  - Centre, desktop: the sheet index, each item with its sheet number in mono: `01 PROJECTS  02 EXPERIENCE  03 LAB  04 ABOUT`. Current sheet in redline, with a small redline tick.
  - Right: `RESUME`, `⌘K`, the settings icon.
- **Grid.** 12 columns, 24px gutters, 64px outer margin inside the frame on desktop, 20px on mobile. Content is left-weighted; the right columns carry annotations and the title block.
- **Title block** (signature). Bottom right of the home hero and the footer of every page. A boxed table in the drawing-standard layout:

```
┌──────────────────────────────┬───────────┐
│ PROJECT  Portfolio / drawing │ SHEET     │
│ ENGINEER Hemant Rajput       │ 00 / 07   │
│ STATUS   Available for work  ├───────────┤
│ LOCATION Bengaluru, IN       │ REV 26.09 │
└──────────────────────────────┴───────────┘
```

Every value is real data: the profile, the sheet index, the latest changelog date.

- **Dimension lines** (`<Dimension>`). A horizontal or vertical line with arrowheads, end ticks and a mono label, drawn in `line-strong`. Used only for true measurements:
  - tenure per role on /work (`2Y 4M`)
  - the span of years across the experience chain
  - on home: `EST. 2020 ←→ 2026`, sized to the name.
- **Callouts** (`<Callout>`). A leader line from a letter bubble (A), (B) to an item. Used on home to label what the sheets contain, and on hover in lists (redline).
- **Mobile.** The frame stays, with a thinner inset. The sheet index becomes a bottom bar (sheet number over label). The title block stacks full width at the page end.

## Page patterns

Not final: refine while building. Every page has a scene region (`SceneSlot`) with its own 3D state and interaction (see `docs/guides/m2-scene-spec.md`).

- **Home.**
  - Hero: condensed-caps name across the full width, with a dimension line under it (years shipping). A one-paragraph Newsreader lead. The scene sits behind/right: the plan chest in linework, the M1 placeholder being an SVG line drawing of it.
  - The title block sits bottom right.
  - Directly below the hero: "Experience", a compact chain-dimension summary of every role (company, title, dates, tenure), linking to /work. The user asked for experience on the home page in every flavor.
  - Then "Selected sheets", 3 featured projects as large sheet previews (a frame with a title strip and drawing number).
  - Then "Current revision", the now summary as a revision entry, and the latest RFI.
- **Projects: "Drawing register".** A real table:

| DWG NO. | TITLE | DISCIPLINE (stack) | YEAR | STATUS |
| ------- | ----- | ------------------ | ---- | ------ |

- Status is shown as a drawing-stamp word: `ISSUED` (active), `AS BUILT` (maintained), `SUPERSEDED` (archived), `IN PROGRESS` (wip). The plain meaning sits in an `abbr`/tooltip, and the legend sits above the table.
- Featured projects first, as large sheets.
- Row hover draws a redline leader to a floating preview.
- **Experience: "Chain dimension".** A vertical dimension chain down the left, one segment per role, with a length label per segment (`2Y 4M`). Continuations join segments. The role's content sits beside its segment.
- **About: "Schedules".** Skills as drawing schedules (tables per group with item marks), education as a schedule, and the bio as the "General notes" block (numbered notes, because drawing notes are genuinely numbered).
- **Now: "Revisions".** The current state is "Current revision" (REV date + notes). Then the revision table (the changelog), grouped by year: REV / DATE / DESCRIPTION / CATEGORY.
- **Ask: "RFI log".** "Submit an RFI" (the button says "Send question"). Threads are shown as `RFI-014 · Question · Response`, with the engineer's response boxed and a redline "ANSWERED" stamp.
- **Resume: "Sheet A4".** The printable one-sheet in whiteprint colours on screen; pure black on white in print.
- **Lab: "Studies".** A grid of study sheets.
- **404: "Sheet not found in set".** Offer the register.

## Motion

- **The one orchestrated moment: plotting.**
  - On first load in a session, the frame, grid ticks, title block rules and the hero dimension line draw in like a pen plotter: SVG stroke-dashoffset, 900ms total, staggered, ease glide.
  - Text is present from first paint and never waits.
  - On client navigation, only the new sheet's dimension lines re-plot (400ms).
- **Hover.** Redline leader lines draw from the item to its label (200ms). Register rows get a redline tick in the margin. No card tilt on dense lists; tilt stays only on large sheet previews (max 4 degrees).
- **Cursor** (fine pointers only). A small crosshair reticle in redline with a mono readout of the frame grid reference under the pointer (`C4`). Over links, the readout becomes the `data-cursor` label (`OPEN`, `VIEW`).
- **Reduced motion.** No plotting (lines are present), no tilt, no Lenis. Hover leaders appear instantly.

## Scene props

Every route's pose also brings props that answer the page, all linework in the one slot (`flavors/drawing-set/components/scene/props.ts`). They are damped like the rest of the scene, so the clock still sleeps once they settle, and reduced motion snaps them to their resting state.

| Route    | Prop                                    | Responds to                                                                                           |
| -------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Home     | Drafting machine arm on the board       | Aims at the hovered drawer (an experience row counts as drawer 02); its head opens the register       |
| Projects | Drawing tubes, one per SUPERSEDED sheet | Hover rolls one in redline, click opens it; the stack filter sinks non-matching sheets into drawer 01 |
| Project  | T-square and set square                 | Slide down the board with the case study's scroll                                                     |
| Now      | Plotter gantry over the revision cloud  | Plots once per visit and again on a category change; filtered-out cards sink                          |
| RFI      | The thread's slip pinned to the board   | One slip per reply; hovering a reply lifts its slip                                                   |
| Lab      | Dividers on the chest top               | Open to the hovered study's footprint                                                                 |
| Resume   | Ruled blocks on the A4                  | One per section, sized by its entries; the section in view redlines; click scrolls to it              |
| 404      | Misfiled sheets and a loupe             | The nav's sheets lie on the floor (hover lifts, click opens); the loupe follows a fine pointer        |

Filters change only the DOM, so a page publishes its full list with a match flag through `flavors/drawing-set/lib/scene/page-state.ts`, and the scene keeps drawing what the filter hides, sunk back into its drawer.

## Sound: the drafting room (`lib/sound/`, tested)

On by default; nothing plays before the first click. Every voice is synthesized by the shared engine (`lib/sound.ts`); there are no samples. Drawing Set owns the pencil and graphite family (audit §2.2). The recipes and the click mapping live in `flavors/drawing-set/lib/sound/voices.ts`; the scene-driven helpers (drawer, sheet, plot, the reduced-motion thunk) in `lib/sound/scene.ts`, so scene files only hold one-line calls.

| Voice    | Where it plays                                                                                                                | Recipe                                                                                                                                                                                                |
| -------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lead`   | Links                                                                                                                         | 14ms of noise, bandpass 3.2kHz Q 1.4, gain 0.07, plus a triangle 1900 to 1300Hz for 12ms at 0.04.                                                                                                     |
| `clutch` | Buttons, `.press` controls, switches, segmented options, the sound-on preview                                                 | Two 3ms ticks of noise highpassed at 2.5kHz, 24ms apart (0.09 then 0.05), a 5ms 950Hz square under the loud one. A switch turning off plays the pair reversed. The option already chosen stays quiet. |
| `drawer` | The route change opens a drawer, or pulls one further out (`world.tsx` store subscription)                                    | Noise bandpassed 240 to 620Hz over 170ms (25ms attack, 0.10), then a 72Hz stop thump, 40ms, gain 0.12.                                                                                                |
| `sheet`  | A scene sheet, card or study clicked to open (`world.tsx` `onClick`), mouse only                                              | Noise bandpassed 1.5 to 4.2kHz, Q 0.8, 20ms attack, 130ms, gain 0.05.                                                                                                                                 |
| `stamp`  | RFI sent and owner answer posted (the ANSWERED moment; `chat-composer.tsx` `onSent`), email copied (footer and contact block) | Dry and high: sine 220 to 140Hz over 60ms plus 20ms of noise lowpassed at 1.8kHz, gain 0.15. Its own budget, so the send click never starves it; plays on touch.                                      |
| `plot`   | A dimension line re-plots after navigation, above the fold (`dimension.tsx`)                                                  | A 480Hz square step, 8ms, lowpassed at 2kHz, gain 0.025, repeated 16 times at 55Hz (about 290ms). At most one re-plot per 800ms.                                                                      |

- **Click mapping.** `ClickSound` gets `voiceFor` in `deferred-layers.tsx`. It hears the click in the capture phase, so a switch's `aria-checked` still holds the old state. `data-voice="<name>"` picks a voice and `data-voice="none"` silences a control. The ⌘K trigger and everything inside the menu stay silent.
- **Hit areas.** A labelled `Switch` and each `SegmentedControl` option stretch the Base UI root over the row, so a click on the text lands on the `role=switch`/`role=radio` element instead of the hidden input.
- **Reduced motion.** Click sounds and the stamp stay. The drawer snaps and nothing plots, so the runner and the stepper become one short thunk (sine 96 to 64Hz, 45ms, plus 12ms of noise lowpassed at 500Hz, gain 0.1), shared by both so a navigation makes one thunk.
- **Guards.** Scene sounds check `isSoundOn()`, `document.hidden` and `navigator.userActivation.hasBeenActive`, so nothing plays on page load. Touch UI clicks (including the scene sheet) are silent; confirmations still play. Hover never sounds. The ANSWERED stamp scrolling into view is silent (no scroll-linked sound).

## Copy voice

- Plain, specific, first person in prose. The drawing vocabulary lives in labels, never in sentences. Every label has a plain alternative for screen readers where the term is jargon: the RFI is labelled "Questions (RFI)", and the register's `abbr` titles say what each stamp means.
- Buttons say what they do: "Send question", "Copy email", "Open resume".
