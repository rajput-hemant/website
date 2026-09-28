# Calibre

Last updated: 2026-09-27 at `f57e6f1`.

The Calibre edition (registry id `calibre`) presents the portfolio as one watch movement, Calibre HR-26. "Pixel-perfect" and "fast" are the same promise a watchmaker makes with tolerances and rate, and a movement is a record where every part is accounted for. So every figure on the page is true: each one is counted from the data (`lib/movement.ts`), never typed in.

| Calibre convention | Carries                                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| Jewels             | One per project, in catalogue order (`jewels`), numbered from 1: "Jewel 03 of 9"                         |
| Jewels in view     | Featured projects, set as cards on the home page                                                         |
| Jewel map          | On every card, one chaton per project round a ring, this project's set in ruby                           |
| States             | In service = maintained, In assembly = in progress, Retired = archived, Running = active                 |
| Frequency          | 3 Hz, one hertz per stack (web, server, mobile), so 21,600 vph; the sheet counts the projects on each    |
| Complications      | One per skill group (`technicalSheet`)                                                                   |
| Power reserve      | Fully wound when the profile has an availability line, wound down (booked) when it has none              |
| Service record     | A subdial spanning whole years back from this month, one arc per role, newest outermost                  |
| Bezel prints       | "Calibre HR-26", the jewel count in words, "21,600 vph" and the town, between the hour marks             |
| Hour marks         | Header nav at XII Projects, III Experience, VI Lab, IX About; `g` then 1 to 7 jumps, `g h` home          |
| The movement       | One jewel per project on the plate, two of them on the pallet fork, this page's lit (`data-scene-board`) |
| Jewel tags         | Each jewel's project name, in HTML over the movement (home, projects, a project)                         |

The mock printed "Fourteen jewels" and "14 projects". The fallback content has 9 projects, so a fixed 14 would have been false; every count, the spelled one on the bezel included (`spell`), now follows the data. The "11" the old handoff saw in the mock's script is the hairspring's coil count, not a project readout.

## Tokens (`flavors/calibre/styles.css`)

- **Dial** (light): salmon ground `#e9c2ae`, dial ink `#221c1a`, blued steel `#1c3491` for hands, links and focus. Ruby `#8e1a36` is kept for jewels only and rose gold `#b07a55` for chatons.
- **Caseback** (dark): rhodium night `#15171a`, ink `#ebe5df`, blued steel lifted to `#a9b9f2`, ruby `#f07c96`, rose gold `#d2a07f`. The same watch seen from the back.
- Each colour is one `light-dark()` pair. `data-theme` pins `color-scheme` (the shared `color-scheme.css`), so an explicit choice wins over the OS in both directions and every token flips together. Without the pre-paint script the OS decides. Every text pair is AA or better on both grounds (faint is 4.7:1 on the dial, 5.5:1 on the caseback).
- The scene reads its own tokens (`--color-scene-*`) through `tokenColor`: plate, bridges, gold train, blued screws, ruby, case, sky and floor.
- Scrollbars are a rhodium band with a faint thumb that turns blued steel on hover.
- A sunburst finish (a fine `repeating-conic-gradient`) sits on the body background behind the hero, so it scrolls with the page and costs no fixed layer.

## Type

- **Bodoni Moda**, the dial printer's Didone, for the name, titles, numerals and Roman hour marks. Its italic takes the second word of a title ("Selected _projects_", "Hemant _Rajput_").
- **Alegreya Sans** 400 and 500 for everything you read.
- **Alegreya Sans SC** 500 and 700 for the technical sheet's small caps (the `spec` utility): lining, tabular figures, tracked.
- Three preloads: Bodoni upright (one variable file) and Alegreya Sans 400 and 500. The Bodoni italic and the small caps are not preloaded. No 600 or 700 of Alegreya Sans is loaded, so the edition never asks for one (it would be faked).

## Layout and chrome

- **Header.** The name in small caps and "Cal. HR-26" in Bodoni italic; the four pages at their Roman marks, the current one underlined in blued steel; then Resume, ⌘K, the side of the watch ("Caseback" or "Dial") and Customize. Below `lg` the nav drops to its own row.
- **The case.** Every page with facts to show wears the bezel (`components/dial/bezel.tsx`): a rhodium band with sixty minute ticks, the four nav pages at their hour marks, the bezel prints between them, and the blued rim index riding above the window. The window holds the movement (home, projects, a project, about, 404) or the page's own flat subdial (the service record on Experience; a guilloché face with one count on Lab, Now and Ask). The owner, lab experiment and ask thread pages have no case.
- **Page header.** "Calibre HR-26 · III · Service record", the title, the lede and key facts; the case on the right.
- **Footer.** The address and Copy email, the other pages, RSS and socials, then the imprint: calibre, where it was regulated, the typefaces, beats counted (visitor count) and "Change edition".

## Pages

- **Home:** a catalogue spread. The identity and the power reserve on the left, the movement in its case in the centre, the technical sheet and the service record on the right. Below, "II · The jewels": the legend of states in use and the featured jewels as cards, each with its jewel map.
- **Projects:** the full jewel register, gathered by state (In service, In assembly, Retired), with the movement and every jewel in the case.
- **Project:** the jewel under the loupe. The movement lights this project's jewel; the Sanity image when there is one, the jewel map when not; the story, its complications (the stack), and the jewels either side.
- **Experience (/work):** the service record enlarged, then each role's entry newest first ("Arc 06 · 2026 to now · Running").
- **About:** the watchmaker's bench notes: the bio on an engraved card, the tools on the bench (skills), where the trade was learned (education) and contact.
- **Now:** the rate log. What is on the bench now, then dated regulation entries by year. `/changelog` redirects to `/now#log`.
- **Ask:** the engraving request book: requests numbered `Request 014`, the composer, moderation for the author, pagination by page.
- **Lab:** the regulation bench; each trial runs on its own page.
- **Resume:** the certificate, one warm-white sheet in both themes, black on white in print.
- **404:** a stopped movement: the balance at rest, the index still at XII, every page listed.

## Motion and interaction

- **The beat (the signature).** The rim index steps once per beat, 6 beats a second at 3 Hz. At rest it runs as a seconds hand, 1 degree a beat, so it shows the real second. Pointing at (or focusing) a nav item steps it an hour per beat, the short way round, to that page's mark; leaving lets it run back to the seconds. The step arithmetic is pure and tested (`lib/beat.ts`); `components/dial/dial-beat.tsx` drives it. The nav and the dial talk through two window events (`calibre:hour`, `calibre:beat`), so shared code is untouched.
- **Jewel cards light their jewel.** Pointing at or focusing a jewel card (`data-scene-item="jewel:<n>"`) lights its jewel in the movement (`litJewel`) and sets its name tag in blued steel; leaving it, the page's own jewel is lit again. The tags sit at the poster's seats and the scene moves them with the jewels, so both the poster and the canvas carry the names; they are aria-hidden, as the cards carry the names too.
- **Bursts, not a loop.** The escapement runs for 4 s after arrival, while the pointer moves over the case, and until an asked-for mark is reached, then settles. An idle page renders nothing: measured, the index holds its angle after the burst and the scene clock sleeps.
- **Stepped, never eased loops.** The index lands with a `steps(1)` transition; page changes tick in over three steps (View Transitions, 250 ms). UI state changes (hover, focus, press to 0.97) stay under 300 ms with ease-out curves. The only damped motion is the drag.
- **⌘K** opens without motion from the keyboard and with a short fade and scale only from a pointer click on the trigger (`command/open-source.ts`).
- **Motion off or reduced:** the index never runs. Asking for an hour jumps it there instantly, and letting go returns it to the true second. The balance rests, page changes crossfade in 140 ms, and dragging still turns the movement (direct manipulation).

## 3D: the movement

One persistent R3F scene through the shared session root (`lib/scene/session.tsx`), loader, store, clock and tiers, in the case window of the pages listed above. It does not use the new viewport mode.

- Procedural only: a perlage plate (a canvas texture of arcs), five extruded gold wheels (barrel, centre, third, fourth, escape) with teeth and spoked crossings, three Geneva-striped bridges on blued screws, the balance with its hairspring, the pallet fork, and the jewels. No canvas text.
- The jewels follow the data: `settings(n)` in `lib/scene/poses.ts` seats n minus 2 chatons on the train's pivots and round the rim, plus the 2 pallet stones every movement needs. The same seats draw the poster, so both show the same movement.
- The escapement: each beat the balance lands at one end of its swing and the escape wheel lets half a tooth through; half a beat later the balance passes its rest. That is two frames a beat (12 a second), and only during a burst. The train is geared down from the escape wheel.
- Each route has a pose (`lib/scene/poses.ts`): a turn and tilt of the case, and whether it runs (the 404 is stopped). Dragging turns and tips it, damped, and it settles back.
- DPR is capped at 1.5 by the session default; the canvas is `aria-hidden`.
- Fallback: `ScenePoster` draws the movement flat, seen through the caseback, from the same layout. It is the poster until WebGL is ready and the whole scene on tier 0. The window is a fixed square, so CLS stays 0.
- The loader itself is loaded lazily (`scene/lazy-scene-loader.tsx`).

## Sound

Opt-in and off by default, synthesized by the shared engine (`lib/sound.ts`); the recipes and `voiceFor` are in `flavors/calibre/lib/sound/voices.ts`, passed to the shared `ClickSound`. A watchmaker's bench: steel on steel, tiny and bright, with one gong.

| Voice      | Sound                                               | Plays on                                  |
| ---------- | --------------------------------------------------- | ----------------------------------------- |
| `tick`     | One beat: a pallet dropping onto a tooth            | Links (pointer only)                      |
| `crown`    | The crown pressed home, a small ringing click       | Buttons                                   |
| `detent`   | The setting lever snapping into its detent, twice   | Switches, radios, the side of the watch   |
| `ratchet`  | The winding ratchet's quick run of clicks           | Disclosures opening or closing            |
| `repeater` | A minute repeater: a high gong, then a low one      | Copy email                                |
| `caseback` | The caseback screwed shut: a low seat, a last click | A question or reply sent (plays on touch) |

No stamp (Press owns it) and no pencil or graphite (Drawing Set owns it). Turning sound on in Customize plays the detent, and that click is the gesture that unlocks audio. Keyboard link activation is silent; hover never sounds.

Touch taps buzz instead through the shared `TouchHaptics` in `site/deferred-layers.tsx` (on by default; a Haptics switch sits under Sound in Customize on coarse pointers).

## Budgets

Measured with `bun run build && bun run budget` (fallback content, no Sanity env) on `portfolio-3d` at `0f3c391` plus this edition:

| Route                  | Initial JS (gz) | Ceiling |
| ---------------------- | --------------: | ------: |
| Home and text pages    |        158.6 KB |  180 KB |
| `/projects/<slug>`     |        163.9 KB |  180 KB |
| `/resume`              |        159.8 KB |  180 KB |
| `/owner`               |        163.5 KB |  180 KB |
| `/ask`                 |        173.3 KB |  240 KB |
| `/lab/signature-field` |        160.1 KB |  170 KB |
| Fonts                  |      3 preloads |       3 |

- The scene loader, the author's moderation queue and message menu, and the ⌘K dialog are all lazy, so none of them is in the initial chunks.
- The "Change edition" link does not prefetch: the picker has its own root layout.

## Shared code this edition uses

`lib/prefs/standard.ts` (own key `hr.cb.prefs`), `lib/scene/*` and `components/semantic/scene/*`, `lib/command/standard-actions.ts` with `use-command-dialog` and `use-command-menu`, `ClickSound` with `voiceFor` and `onToggle`, `TouchHaptics`, the ask hooks and loaders, `lib/data/project-page.ts`, `lib/resume/load.ts`, the lab shader and accent hook, `use-link-preview`, `use-visitor-count` and `use-copy-email`. It adds nothing to shared code.
