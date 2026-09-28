# Maquette

Last updated: 2026-09-27 at `4a80678`.

The Maquette edition (registry id `maquette`) presents the portfolio as a study model on a basswood plinth. A study model proves a plan can be built, and is honest about what is finished and what is still frame. That fits a body of work where some pieces are maintained, one is still going up and some are shelved. Every piece is cut to one rule, so its size and material are facts from the data, and the whole model is lit by the real sun over Mathura.

| Maquette convention | Carries                                                                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Storeys             | One per year since the first commit (`pieces` in `lib/model.ts`), at least one                                             |
| Bays                | One per technology in the stack; a row up to five, then two rows                                                           |
| Material            | White card = maintained or active, basswood frame with the top storey open = in progress, grey card = archived             |
| Foam context blocks | On the home model, every project that is not featured: its real footprint, one storey high                                 |
| Plaques and pins    | Every piece carries a pin with its catalogue number and name; the pins ride the model in HTML, the poster draws its own    |
| The phasing plan    | Every role as a dated phase on one axis from the first start to now, one hairline per month; the current phase is basswood |
| The phasing model   | `/work`: one slab per role, set along the site by start date                                                               |
| The shadow study    | The sun over Mathura (27.49° N) on 26 September 2026, 07:00 to 17:30 IST, from NOAA's solar geometry (`lib/sun.ts`)        |
| Revisions           | `/now`: each now item is a lettered revision, newest on top                                                                |
| Comment cards       | `/ask`: each question on a card pinned to the model, numbered `Card 014`                                                   |
| Room numbers        | Page kickers print `Room 01` to `Room 07`; `g` then the number jumps there, `g h` goes home                                |

## Tokens (`flavors/maquette/styles.css`)

- **Day** (light): the model room `#e3e4e1`, vitrines `#ecedea`, graphite ink `#202326`, card `#fafaf8`, grey card `#b3b6b3`, foam `#d6d7d3`, basswood `#d2b386`, and the cut edge `#76552a` for links and focus.
- **Night** (dark): the room goes to `#101113` under one spotlight. Ink `#e8e7e3`, the cut edge `#d8b98a`. The model keeps its materials; only the light changes.
- Each colour is one `light-dark()` pair. `data-theme` pins `color-scheme` (the shared `color-scheme.css`), so an explicit choice wins over the OS in both directions and every token flips together. Without the pre-paint script the OS decides.
- The scene reads its own tokens (`--color-scene-*`) through `tokenColor`: card, foam, grey, wood, plinth, the ground bounce, and the sun's warm low and white high colours.
- Scrollbars are a strip of the room with a card-edge thumb that turns basswood on hover.
- The room's light is a radial gradient on the body background (a north window by day, the lamp's pool at night), so it scrolls with the page and costs no fixed layer.

## Type

- **Jost** for display and engraved plaque caps (the `caps` utility), in the Futura line of model-shop lettering. Headings are 300; plaque names 400 and 500.
- **Albert Sans** for everything you read.
- **Chivo Mono** for readouts (the `num` utility): dates, dimensions, the clock. It is not preloaded, so the page keeps two font preloads.

## Layout and chrome

- **Header.** The name and "Model room, 1:100", the four rooms (the current one over a basswood rule), then Resume, ⌘K, the lamp (a half-disc and the word for where it takes you) and Customize. Below `lg` the nav drops to its own row.
- **Page header.** "Room 03 · Test massing", the title, the lede and key facts; the model on the right with this page's board on the plinth and a label at its edge.
- **Footer.** The address and Copy email, the other pages, RSS and socials, "Card, basswood and foam. Built in Mathura, 27.49° N.", then the imprint: scale, typefaces, visitors to the room and "Change edition".

## Pages

- **Home:** the name, line, bio and facts left; the site model right with a plaque per featured piece and how the model is built; under them the phasing plan and the shadow study. Below, the selected pieces in vitrines with the material legend, and the rest of the catalogue named as foam context.
- **Projects:** every piece in its own material on the plinth, then every vitrine, gathered by material.
- **Project:** the piece lifted off the site, its elevation and plan (and the Sanity image, when there is one, as the built work), the story, the bays (its stack, numbered) and the pieces either side.
- **Experience (/work):** the phasing model, the full phasing plan, then each phase's notes, newest first.
- **About:** the studio's wall label: the bio, the materials on the shelf (skills), education and contact.
- **Now:** the current revision, then the log filed by year. `/changelog` redirects to `/now#log`.
- **Ask:** comment cards pinned to the model, each cut from the model's materials: white card once answered, a basswood frame while it waits, its number and state on a plaque at its side and a pin head that turns basswood on hover or focus. Then the composer, moderation for the author, and pagination by board.
- **Lab:** foam test blocks, one per experiment; each experiment runs on its own page.
- **Resume:** the spec sheet, one white sheet in both themes, black on white in print: numbered parts headed like a drawing's schedule, and a title block (drawn by, site, revision, pieces, materials) at its foot.
- **404:** "Site cleared": an empty plinth, with every room listed.

## Motion and interaction

- **The shadow study.** Moving a mouse across the hero sets the time of day (07:00 at the left edge, 17:30 at the right); the slider does the same from the keyboard or touch, with an `aria-valuetext` that reads the time and the sun's height and bearing. The sun eases across the model (a damped approach, about 300 ms) and every plan shadow in every vitrine follows at once (`lib/sun-store.ts`). At night the slider swings the one spotlight, held at 50°.
- **The poster follows the sun.** Without WebGL the poster redraws from the same slider (`lib/sun-store.ts`), so its shadows and face shading move with the study as the scene's do.
- **Lifting.** Pointing at or focusing a plaque, a vitrine or a phasing row lifts its piece 0.16 units off the site, and its pin turns basswood. The project page keeps its piece lifted.
- **Vitrines** rise 4px with a longer shadow on hover or focus (400 ms, `--ease-lift`).
- **Page changes** set the new sheet down on the table (View Transitions: the old lifts 6px and fades in 140 ms, the new rises 10px in 300 ms); the header and the model stay put.
- **Buttons** press to 0.97 on `:active`. UI transitions stay under 300 ms with custom ease-out curves.
- **⌘K** opens without motion from the keyboard (⌘K, `/`, or Enter on the trigger) and with a short fade and scale only from a pointer click on the trigger.
- **Motion off or reduced:** no travel. The sun jumps to the slider's time instead of easing, the pointer no longer sweeps the day (the slider still works), pieces lift at once, page changes crossfade in 140 ms, and dragging still turns the model (direct manipulation, damped harder).

## 3D: the site model

One persistent R3F scene through the shared session root (`lib/scene/session.tsx`, slot mode), loader, store, clock and tiers. One model per page, in the page header's slot (the hero on home, nothing on the lab experiment, ask threads or owner pages).

- Procedural geometry only, on one shared unit box: the plinth, the site card, card slabs with a recessed reveal under each storey (so storeys can be counted), basswood frames (columns on the bay grid, a slab per storey, the top left open), foam context, six dowel trees and one scale figure.
- The board (`data-scene-board`, `encodeBoard` in `lib/model.ts`) says what stands where on the 16 by 11 bay grid and which piece is lifted. `sitePlan` places featured pieces near the middle and the foam round the edge, one bay apart; `phaseBoard` sets out the roles on `/work`.
- Light: a hemisphere fill plus a directional sun with soft PCF shadows (2048 map at tier 2, 1024 at tier 1) on the site, the plinth and a shadow-only floor, with a contact pool under the plinth; neutral tone mapping. The lights ride the plinth, so the sun stays where it is over the site whichever way the model turns. At night one spotlight replaces the sun.
- Dragging turns the model and tips the eye; the next drag starts where the last one left it.
- Pins over the featured pieces are HTML moved by the scene each frame; there is no canvas text.
- Idle: zero frames. The clock wakes only while the sun, a lift, the turn or the pointer is settling.
- Fallback: `ScenePoster` draws the same board in parallel projection from the camera's angle (`lib/scene/axo.ts`), with the study's resting sun and its shadows and the same pins. It is the poster until WebGL is ready and the permanent scene on tier 0. The slot's aspect ratio is fixed per breakpoint, so CLS stays 0.
- The loader itself is lazy, so the scene store and mount hook are out of the initial chunks too.

## Sound

Opt-in and off by default, synthesized by the shared engine (`lib/sound.ts`); the recipes and `voiceFor` are in `flavors/maquette/lib/sound/voices.ts`, passed to the shared `ClickSound`. A quiet model shop bench: short, dry and woody.

| Voice   | Sound                                               | Plays on                                  |
| ------- | --------------------------------------------------- | ----------------------------------------- |
| `card`  | A fingertip on mount card: a soft papery tick       | Links (pointer only)                      |
| `knife` | A scalpel scoring card along a steel rule           | Buttons                                   |
| `lamp`  | The desk lamp's push switch: a click and its catch  | Switches, radios, the lamp                |
| `slide` | A foam block slid across the site                   | Disclosures opening or closing            |
| `dowel` | Two basswood dowels knocked together                | Copy email                                |
| `pin`   | A map pin pushed through a card into the foam board | A question or reply sent (plays on touch) |

No stamp (Press owns it) and no pencil or graphite (Drawing Set owns it). Turning sound on in Customize plays the lamp, and that click is the gesture that unlocks audio. Keyboard link activation is silent; hover never sounds.

Touch taps buzz instead through the shared `TouchHaptics` in `site/deferred-layers.tsx` (on by default; a Haptics switch sits under Sound in Customize on coarse pointers).

## Budgets

Measured with `bun run build && bun run budget` (fallback content, no Sanity env) on `portfolio-3d` at `0f3c391` plus this edition:

| Route                  | Initial JS (gz) | Ceiling |
| ---------------------- | --------------: | ------: |
| Home                   |        161.0 KB |  180 KB |
| Text pages             |        157.5 KB |  180 KB |
| `/projects`            |        159.3 KB |  180 KB |
| `/projects/<slug>`     |        164.5 KB |  180 KB |
| `/owner`               |        161.9 KB |  180 KB |
| `/ask`                 |        172.3 KB |  240 KB |
| `/lab/signature-field` |        159.0 KB |  170 KB |
| Fonts                  |      2 preloads |       3 |

- The scene loader, the author's moderation queue and message menu, and the ⌘K dialog are all lazy, so none of them is in the initial chunks.
- Home and the catalogue carry the shadow study's small store (`lib/sun-store.ts`), which is why they sit a few KB above the text pages.
- Idle is zero frames, with motion on and reduced, before and after hovering a plaque and moving the sun (draw calls counted in headless Chromium).

## Shared code this edition uses

`lib/prefs/standard.ts` (own key `hr.mq.prefs`), `lib/scene/*` and `components/semantic/scene/*`, `lib/command/standard-actions.ts` with `use-command-dialog` and `use-command-menu`, `ClickSound` with `voiceFor` and `onToggle`, `TouchHaptics`, the ask hooks and loaders, `lib/data/project-page.ts`, `lib/resume/load.ts`, the lab shader and accent hook, `use-link-preview`, `use-visitor-count` and `use-copy-email`. It adds nothing to shared code.
