# Jacquard

Last updated: 2026-09-27.

The Jacquard edition (registry id `jacquard`) presents the portfolio as a sample book. Jacquard's punched cards were the first stored programs, and this work is woven the same way: technologies are the warp, set up once and reused, and each project is one pick across them. Every device on the page is built from the data. The mock is `docs/mocks/jacquard.html` with notes in `docs/mocks/jacquard.md`.

| Loom convention  | Carries                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------- |
| Warp ends        | Every technology in a recorded stack, in the order it first appears (`buildDraft`)           |
| Shafts           | The end's kind: language, interface, data and state, runtime and tooling, 3D (`kindFor`)     |
| Weft picks       | Every project with a stack, oldest first; projects without a stack are left out and counted  |
| Drawdown         | A filled square where a project uses a technology                                            |
| Card chain       | One card per pick, where the treadling would sit; every page is a card too (`Card 02 of 08`) |
| Swatch           | A project's own pick stepped one end per row, the way a twill steps (`twill`)                |
| Accession number | `HR 2023.2`: the year, then the project's place in that year's intake (`accessions`)         |
| Threads          | Roles over time; a role that `continuedInto` another is the same thread (`loomThreads`)      |
| Loom log         | One pick per changelog entry, in its category's yarn (`categoryYarn`)                        |

All of it is in `flavors/jacquard/lib/weave.ts` (pure, tested in `lib/__tests__/weave.test.ts`).

## Tokens (`flavors/jacquard/styles.css`)

- **Day loom** (light): loom-state greige ground `#d7d8d3`, panel `#e2e3de`, charcoal warp ink `#1e2125`, soft `#474c53`, faint `#565b62` (AA on the ground).
- **Night loom** (dark): the same cloth under indigo. Ground `#0e1427`, panel `#141b31`, ink `#dad8cf`; every dye lifts to read on the dark ground.
- **Dyes**, one per kind, each a `light-dark()` pair: woad `#2e4380` / `#8fa5ea` (language), madder `#9b2d3b` / `#e06a74` (interface, and the accent), weld `#94730f` / `#d8b44c` (data), walnut `#6b4a2e` / `#c0916a` (runtime), orchil `#5e3a78` / `#b48cd6` (3D).
- The swatches are cloth, lit the same in both themes: charcoal `#24272c` with the yarns spun brighter. `.swatch` redefines the five dye tokens inside itself, so the same `yarnClass` works on the page and on the cloth.
- `data-theme` pins `color-scheme`, so an explicit choice wins over the OS in both directions. Without the pre-paint script the OS decides.
- The ground carries a faint warp and weft (two repeating gradients on `body`).
- **Scrollbars** are a warp thread: a twisted yarn thumb in soft ink on the ground, dyed madder under the pointer. Browsers without the WebKit scrollbar pseudo-elements get the standard `scrollbar-color` instead (setting it in Chromium would switch the yarn off, so it sits behind `@supports not selector(::-webkit-scrollbar)`).

## Type

- **Tenor Sans** for the name, titles and museum-label caps (one weight).
- **Hanken Grotesk** 400 to 600 for reading.
- **Chivo Mono** for draft numbers, accession numbers, labels and the selvedge (the `label` utility).
- All three are preloaded.

## Layout and chrome

- **Header.** The twill mark (a 4 by 4 repeat) and the name in label caps, cards 2 to 5 with their counts as superscripts (projects, roles), then Resume, the ⌘K chip, the loom switch ("Night loom" / "Day loom") and Customize. Below `md` the nav drops to a second row.
- **Page header.** The card number and what the page is, the title in Tenor, a lede and the key facts as a museum object label (`MuseumLabel`). The cloth hangs on the right, woven from what the page is about.
- **Footer.** The address, the other cards, RSS and socials, then the maker's line: handle, "Woven in Mathura", the typefaces, visitors and "Change edition".

## Pages

- **Home:** the title page. The name and an object label (maker, place, date, materials as the five most-used ends, status) on the left; on the right the cloth stacked over the weaving draft, so the cloth reads as the draft's output. Then Experience as threads, four selected swatches, and what is on the loom with the newest question.
- **The draft** (the signature, `components/draft/`): server-rendered SVG. Threading rows at the top (one mark per end, on its kind's shaft), the drawdown below, the card chain beside it, and a live caption. `WeaveFocus` is the page script: point at a pick or a thread and the drawdown re-weaves, its ends take their yarn, shared ends light in other picks, a shuttle crosses the row and the cloth re-dyes. Clicking a pick keeps it (`aria-pressed`).
- **Projects:** the swatch book, every project in accession order. Each card is the cloth with its selvedge label, `Pick 04 · HR 2023.1`, the name, the tagline and a catalogue entry (date, materials, technique). Pointing at a material dims every other end on the swatch and lights it in the draft and the cloth.
- **Project:** the header with the cloth woven from this pick alone, a catalogue note (image and description), the swatch with its materials, and the swatches either side in accession order.
- **Experience (/work):** roles as threads on one month axis. A thread carries on when a team moved (FastLane to Blai, Proghit to Zunta): 6 roles, 4 threads. Then each role's own entry, with the thread it belongs to.
- **About:** the full object label, the description (bio), the materials (skills, each marked with its kind's yarn), provenance (education), a condition report (current use, warp, last examined) and enquiries.
- **Now:** what is on the loom, then the loom log by year, one pick per entry in its category's yarn. `/changelog` redirects to `/now#log`.
- **Ask:** the sampler board. Questions are cards pinned to the board, numbered `Sample 014`; the author's answers are stitched in woad beside them.
- **Lab:** trial pieces; each experiment runs on its own page.
- **Resume:** the pattern card, one ink on a clean card in both themes, black on white in print.
- **404:** a broken end: the cloth with one warp end snapped and hanging, and every card in the chain.

## Motion and interaction

The frequency gate decides what moves: nothing idles, and what happens often is short.

- **The draft weaves in** on first paint, end by end and pick by pick: each cell rises into place 260ms after the one before it (delay `14ms` per end and `24ms` per pick), CSS only, so first paint is never blocked.
- **Hover and focus** answer in 200ms with the custom ease-out `cubic-bezier(0.23, 1, 0.32, 1)`. The shuttle crosses a pick in 280ms, only when the pointer chose it; keyboard focus re-weaves without the shuttle.
- **Buttons** dip to `scale(0.97)` on `:active`.
- **⌘K** opens without its entrance when the keyboard opened it (`useCommandMenu` `instant`).
- **Page changes** drop the next card in: 140ms out, 260ms in, 10px. The header and the cloth stay put.
- **Motion off or reduced:** gentler, not zero. Nothing translates or scales; the drawdown fades in once without the stagger, page changes are a 160ms crossfade, colour and opacity still change, and the cloth holds a still pose.

## 3D: the cloth

One canvas, lent to each page's scene slot through the shared loader (`components/semantic/scene/use-scene-mount`) and the shared clock, DOM contract, store and tiers in `lib/scene/`. Plain three.js on the shared clock, like Field Survey, so no R3F in the chunk.

- Loom-state cloth hanging from a rod. The fragment shader weaves it cell by cell from the page's weave (a small `DataTexture`), tiled per route, with a sewn madder label near the hem. The weave rides on the slot's `data-scene-board` (`encodeWeave` in `lib/scene/poses.ts`): the whole draft on most pages, the project's own twill on a project, the roles as bands on /work, the log on /now.
- The vertex shader drapes it: pleats deepen toward the hem, the pointer sends a ripple through it, and the normals come from the same function. Drag turns it on its rod.
- Pointing at a pick, an end, a material or a role re-dyes the matching ends (`hotIds`): only a 36-byte row is uploaded.
- A route change re-weaves the cloth from the rod down in 900ms and turns it to the page's pose.
- Idle: zero frames. The frame loop reports when yaw, drape, ripple and the re-weave have settled, and the shared clock sleeps.
- Reduced motion or motion off: a static pose, no ripple or re-weave; dragging still turns it, without easing.
- Fallback: `ScenePoster` draws the cloth in SVG from the same weave. It is the poster until WebGL is ready and the permanent scene on tier 0. The canvas, host and poster are `aria-hidden`; there is no canvas text (the label is stitched, not lettered).
- About 9.4k triangles and 4 draw calls (cloth, rod, two finials).

## Sound

On by default and silent until the first click, synthesized by the shared engine (`lib/sound.ts`) through `ClickSound` with this edition's `voiceFor` and `onToggle` (`flavors/jacquard/lib/sound/voices.ts`). The loom room: wood and cotton.

| Voice         | Where                              | Recipe                                                         |
| ------------- | ---------------------------------- | -------------------------------------------------------------- |
| Shuttle throw | Links                              | Bandpassed noise sweeping 3.2k to 1.1k Hz, then a wooden catch |
| Heddle lift   | Buttons                            | Triangle 420 to 540 Hz, 35ms, with a dry click                 |
| Beater thud   | Copy email, send a question        | Sine 118 to 64 Hz and lowpassed noise, felted                  |
| Card advance  | A disclosure opening               | Two highpassed clicks 34ms apart                               |
| Bobbin wind   | Switches (up for on, down for off) | Lowpassed sawtooth sweeping up or down, 120ms                  |
| Selvedge snip | A disclosure closing               | A bright noise tick and a short metallic blade                 |

Never on hover, never on keyboard link activation, and UI clicks stay silent on touch. Turning sound on in Customize previews the bobbin winding up, which is also the gesture that unlocks audio. No stamp (Press owns it) and no pencil or graphite (Drawing Set owns them).

Touch taps buzz instead through the shared `TouchHaptics` (on by default; a Haptics switch sits under Sound in Customize on coarse pointers).

## Budgets

- Text pages stay under the 180 KB gz cap (`/ask` 240 KB), checked by `bun run budget`; the draft script and the scene loader are the only client code the home page adds.
- Scene chunk: three.js and the world, loaded after load and idle, only above tier 0.
- Fonts: 3 preloads.

## Shared code this edition uses

`lib/prefs/standard.ts` (own key `hr.jq.prefs`), `lib/command/standard-actions.ts` and `components/semantic/command/use-command-dialog.ts`, `useCommandMenu` with `instant`, `lib/scene/{clock,dom,store,tier,colors}.ts` and `useSceneMount`, `ClickSound` with `voiceFor` and `onToggle`, the ask hooks and loaders, `loadProjectPage`, `loadResumeData`, `useLinkPreview`, `useVisitorCount`, `useCopyEmail` and `SmoothScroll`. Nothing shared was changed for it.
