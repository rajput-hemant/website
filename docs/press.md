# Press Proof

The Press Proof edition (registry id `press`) presents the portfolio as the proof you check before the run. Hemant sells "pixel-perfect", and checking registration is how a printer proves exactly that. Fullstack is two plates in register: P1 pink is interface, P2 blue is systems. Every device on the page carries a real fact from the data.

| Print convention  | Carries                                                         |
| ----------------- | --------------------------------------------------------------- |
| Two plates        | P1 interface and P2 systems (`plateFor` in `lib/proof.ts`)      |
| Registration      | Headlines print 6px out; pointing at one pulls the sheet in     |
| P3 yellow         | Only what is current: the running role, the now items           |
| Sheet N of 8      | Page order: 1 home, 2 projects ... 8 resume; `g` + number jumps |
| Control strip     | One patch per project; solid patches are the featured ones      |
| Signature stamp   | Project status: On press, In print, Proofing, Out of print      |
| Press log         | Every role as a run on one month axis                           |
| Proof stamp       | Availability, or the role on press when there is none           |
| Corrections sheet | /ask: visitors mark queries, the author answers in blue         |

## Tokens (`flavors/press/styles.css`)

- **Paper proof** (light): arctic stock `#e7e8e4`, sheet `#f2f3f0`, ink `#2a4690`, pink `#ff48b0`, blue `#3255a4`, yellow `#ffe800`.
- **Plate view** (dark) is the negative: stock `#15181d`, every ink flips to its complement (pink to green `#1fc47e`, blue to gold `#e0b25a`, yellow to `#2b40da`), and `--blend` goes from `multiply` to `screen`.
- Each colour is one `light-dark()` pair. `data-theme` pins `color-scheme`, so an explicit choice wins over the OS in both directions and every token flips together. Without the pre-paint script the OS decides.
- Pink never sets text on its own: the blue plate is the real text, the pink plate is `aria-hidden`.
- Scrollbars are ink on stock in both themes.

## Type

- **Libre Franklin** 900 for plates and titles, 500 and 400 for reading.
- **Martian Mono** at 75% width for slugs, stamps and readouts (the `slug` utility).
- Both are preloaded; no third face.

## Layout and chrome

- **The trimmed sheet.** On wide screens a fixed margin holds crop marks, registration targets on all four sides, the control strip, the proof date, the gripper edge and the slug line ("Sheet 2 of 8 / Projects"). It is decorative and `aria-hidden`; every fact in it is also on a page.
- **Header.** The registration mark and the name, sheets 2 to 5 (the current one underlined in pink), then Resume, ⌘K, the Plate view toggle and Customize. Below `lg` the nav drops to a second row.
- **Page header.** Sheet number and job, the title in two plates, lede and key facts; the press on the right.
- **Section titles** arrive far out of register and snap in as they scroll into view (a scroll-driven animation of `--k`, behind `@supports`, motion on only).
- **Footer.** The address large, the other sheets, RSS and socials, then the imprint: handle, printed in, typefaces, impressions (visitor count) and "Change edition".

## Pages

- **Home:** the title sheet (the headline is the h1, in two plates), the press, the separations (skills split by plate), the proof stamp; the press log directly below; four signatures; the latest proof with the newest query.
- **Projects:** every signature, gathered by stamp.
- **Project:** a progressive proof: the job (image and description), then the stack as its two separations, then the previous and next signatures.
- **Experience (/work):** the press log, then a job ticket per run.
- **About:** the colophon: bio, inks on hand (skills, each marked with its plate), imprint history (education), reach the press.
- **Now:** the latest proof in yellow, then the log by year. `/changelog` redirects to `/now#log`.
- **Ask:** the corrections sheet, with queries numbered `Query 014`.
- **Lab:** test sheets; each experiment runs on its own page.
- **Resume:** the final print, one ink on a clean sheet in both themes, black on white in print.
- **404:** a spoiled sheet, printed far out of register, with every sheet listed.

## Motion and interaction

- **Registration** snaps with a slight overshoot (`--ease-snap`). Cards and job tickets register on hover or focus.
- **Cursor.** On fine pointers a registration target follows beside the native cursor. Its three plates catch up at different rates, so moving spreads them out of register; over a link they lock and a slug names what a click does. Touch never sees it; focus rings are untouched.
- **Page changes** feed the next sheet in from the gripper edge (View Transitions); the frame and the press stay put.
- **Sound** is the shared click tick, off by default.
- **Motion off or reduced:** nothing moves or snaps; colour still changes.

## 3D: the press

One persistent R3F scene through the shared session root (`lib/scene/session.tsx`), loader, store, clock and tiers.

- Two ink drums (pink over blue) print a sheet that leaves the nip; the next sheet waits on the feed board.
- The sheet's texture is drawn on a canvas in the same overprint as the page, with the route's glyph and slug. Pointing at a headline or any `[data-scene-item]` pulls it into register.
- A route change feeds a new sheet out of the drums.
- Dragging peels the corner; peel it all the way and let go to turn to the next sheet. The same pages are always one link away.
- Idle: zero frames. The shared clock wakes only for the feed, the peel, the register and pointer movement.
- Fallback: `ScenePoster` draws the press in SVG with the same plates. It is the poster until WebGL is ready and the permanent scene on tier 0.

## Shared code this edition added or uses

- Added: `lib/command/standard-actions.ts` and `components/semantic/command/use-command-dialog.ts` (the ⌘K controller, also used by Field Survey), `lib/scene/session.tsx` and `components/semantic/scene/scene-monitor.tsx` (the one-canvas R3F root and the tier step-down), `components/semantic/prefs/theme-color.ts` (browser chrome follows the resolved theme, for every edition), and `monthIndex` in `lib/format.ts` (also used by Field Survey and Timetable).
- Uses, from Field Survey: `lib/prefs/standard.ts`, `lib/scene/colors.ts`, `use-hash-open`, `use-idle-ready`, `cursorLabel` from `cursor-follow`, and the shared `animated-count`.
