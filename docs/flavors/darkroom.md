# Darkroom

Last updated: 2026-09-27 at `b7c90eb`.

The Darkroom edition (registry id `darkroom`) presents the portfolio as a contact sheet under the safelight. A contact sheet is an honest record: every frame shot, a few marked. That fits a body of work where every project is shown and the featured ones are the selects. The whole roll is shot on an invented stock, HALIDE TS·26 (TypeScript, 2026). Every device on the page carries a real fact from the data.

| Darkroom convention   | Carries                                                                                   |
| --------------------- | ----------------------------------------------------------------------------------------- |
| Frames on the roll    | Every project, in catalogue order (`contactSheet` in `lib/roll.ts`), numbered from 1      |
| Selects               | Featured projects: grease crop marks and a hand tag on the sheet                          |
| Status words          | Fixed = maintained, Developing = in progress, Sleeved = archived, In the tray = active    |
| Edge print            | The stock name, DX bars, `▸11` and `11A` under each frame; the last frame reads End       |
| The 35mm strip        | First frame, first role and the current role as dated marks, then years, roles and frames |
| The film roll         | One frame per role, oldest first, the start date printed on the rebate as `24·09`         |
| The drying line       | The now items, one clipped print each                                                     |
| Sleeves               | /ask: each question in a glassine sleeve, numbered `Sleeve 014`                           |
| Frame numbers         | Header nav prints `▸01` to `▸04`; `g` then the number jumps there, `g h` goes home        |
| The print in the tray | Each page's own print, built from that page's frames (`data-scene-board`)                 |

## Tokens (`flavors/darkroom/styles.css`)

- **Safelight** (dark): ground `#120605`, print paper `#f3d6c2` as ink, rebate `#070303`, amber wax `#ffb26b`. Frames are positive contact prints.
- **Light table** (light): daylight `#e8edf0`, negative ink `#14181b`, film base `#e7a267`, red wax `#c8101b`. The same frames show as orange-mask negatives: the three picture densities (`img-hi`, `img-mid`, `img-lo`) swap, so a light shape on the print is a dark one on the negative.
- Each colour is one `light-dark()` pair. `data-theme` pins `color-scheme` (the shared `color-scheme.css`), so an explicit choice wins over the OS in both directions and every token flips together. Without the pre-paint script the OS decides.
- The scene reads its own tokens (`--color-scene-*`) through `tokenColor`, so the tray, the paper, the lamp and the glint change with the theme.
- Scrollbars are a strip of film base with a wax thumb: amber in the safelight, red on the light table.
- A faint grain and the lamp's glow sit on the body background, so they scroll with the page and cost no fixed layer.

## Type

- **Schibsted Grotesk** for everything you read: 700 for names and titles, 500 and 400 for reading.
- **Sofia Sans Extra Condensed** 600 and 700 for edge print (the `edge` utility): frame numbers, DX codes, the stock, labels.
- **Rock Salt** only for grease-pencil tags, which are `aria-hidden` and never carry information that isn't also in text. It is not preloaded, so the page keeps two font preloads.

## Layout and chrome

- **Header.** The name and "Roll 26", frames `▸01` to `▸04` (the current page underlined in wax), then availability, Resume, ⌘K, the safelight switch (its label names where it takes you) and Customize. Below `lg` the nav drops to its own scrolling row.
- **Page header.** "Roll 26 / ▸03 / Test strips", the title, the lede and key facts; the tray on the right with this page's print in it.
- **Footer.** The address and copy, the other pages, RSS and socials, "End of roll 26", then the imprint: stock, typefaces, prints made (visitor count) and "Change edition".

## Pages

- **Home:** the name and line left, the tray right with a contact print of the whole roll, and the 35mm strip across the bottom. Directly below, the experience roll; then the contact sheet of every frame with the status legend, and the selects as rows. Pointing at a row rings its frame on the sheet.
- **Projects:** the whole contact sheet, then every frame as a row, gathered under Fixed, Developing and Sleeved.
- **Project:** the work print: the frame printed up with a white border (the Sanity image when there is one, the frame's own picture when not), the story, the stack "on the back", and the frames either side.
- **Experience (/work):** the film roll, then each frame's notes, newest first.
- **About:** the enlargement in the tray, and what is written on its back: the bio, then skills (on the shelf), education and contact.
- **Now:** the drying line, then the log filed by year. `/changelog` redirects to `/now#log`.
- **Ask:** the sleeves, with the composer, moderation for the author, and pagination by box.
- **Lab:** test strips on film; each experiment runs on its own page.
- **Resume:** the fibre print, one warm-white sheet in both themes, black on white in print.
- **404:** a fogged frame, with every page on the roll listed.

## Motion and interaction

- **Developing.** Frames below the fold wait as blank paper and come up darks first as they scroll in (1.4 s, `--ease-chem`, staggered 80 ms along a strip). Frames already on screen at load are never hidden, so the first paint is final. `components/sheet/sheet-layer.tsx` marks only frames below the fold, after idle.
- **The grease ring.** Hover or focus a frame, or its row in a list, and a wax loop is drawn round it in 280 ms (`--ease-stroke`); it lifts in 160 ms. Hover is fine-pointer only; focus always draws it.
- **Page changes** come up like a print (View Transitions, 280 ms, from low contrast and bright to full density); the header and the tray stay put.
- **Buttons** press to 0.97 on `:active`. UI transitions stay under 300 ms with custom ease-out curves.
- **⌘K** opens without motion from the keyboard (⌘K, `/`, or Enter on the trigger) and with a short fade and scale only from a pointer click on the trigger (`command/open-source.ts`).
- **Motion off or reduced:** no chemistry and no travel. Frames fade up in 240 ms instead of developing, the ring still draws, page changes crossfade in 140 ms, the tray shows its developed print and still liquid, and dragging still turns the tray (direct manipulation).

## 3D: the developer tray

One persistent R3F scene through the shared session root (`lib/scene/session.tsx`), loader, store, clock and tiers. One tray per page, in the page header's slot (the hero on home, nothing on the lab experiment, ask thread or owner pages).

- A procedural tray (boxes only) holds a sheet of photo paper under a layer of developer.
- The print is a canvas texture painted from the same shape list as the poster (`lib/scene/prints.ts`): rectangles, arcs and paths only, never canvas text. Each route picks a print (`lib/scene/poses.ts`): the contact print on home and projects, one frame per role on work, one per question on ask, an enlargement on a project, about and resume, a stepped test strip on lab, a fogged sheet on the 404.
- The print develops in a shader: a texel darkens once the developer time passes its lightness, so shadows come up first (1.8 s, through the shared clock's `tween`). A new page lays a fresh sheet and it develops again.
- The liquid is a 64 by 48 height field (about 6k triangles). Moving the pointer over it drops ripples at most every 70 ms; they glint (additive specular) and bend the print through the shared height texture. Dragging turns the tray, and letting go of a sideways drag sloshes the developer to that side.
- Inspect controls (wired, `lib/scene/inspect.ts`): the tray is the object; pitch is limited to 0.9 radian either way, zoom 0.8 to 1.8. Drag turns it a full 360 degrees (on touch after a sideways move or with two fingers, so the page still scrolls), pinch or ctrl/cmd + scroll zooms, a plain wheel scrolls the page, a double click or tap resets, and the keyboard twin and one-time hint sit beside the host. Reduced motion snaps the drag and drops the coast; once settled the clock sleeps.
- Idle: zero frames. The clock wakes only for the develop tween, live ripples, the tray settling and pointer movement.
- Fallback: `ScenePoster` draws the tray from above in SVG with the same print. It is the poster until WebGL is ready (400 ms crossfade once per session) and the permanent scene on tier 0. The slot's aspect ratio is fixed, so CLS stays 0.
- The loader itself is loaded lazily (`scene/lazy-scene-loader.tsx`), so the scene store and mount hook are out of the initial chunks too.

## Sound

On by default and silent until the first click, synthesized by the shared engine (`lib/sound.ts`); the recipes and `voiceFor` are in `flavors/darkroom/lib/sound/voices.ts`, passed to the shared `ClickSound`. A dry, close room with the door shut:

| Voice     | Sound                                 | Plays on                                  |
| --------- | ------------------------------------- | ----------------------------------------- |
| `advance` | Film advance lever: a highpassed tick | Links (pointer only)                      |
| `tongs`   | Plastic tongs on the tray rim         | Buttons                                   |
| `relay`   | The safelight relay: two dull clacks  | Switches, radios, the safelight switch    |
| `paper`   | A sheet slid out of the paper box     | Disclosures opening or closing            |
| `timer`   | The enlarger timer: two short beeps   | Copy email                                |
| `rack`    | A print clipped on the drying rack    | A question or reply sent (plays on touch) |

No stamp (Press owns it) and no pencil or graphite (Drawing Set owns it). Turning sound on in Customize plays the relay, and that click is the gesture that unlocks audio. Keyboard link activation is silent; hover never sounds.

Touch taps buzz instead through the shared `TouchHaptics` in `site/deferred-layers.tsx` (on by default; a Haptics switch sits under Sound in Customize on coarse pointers).

## Budgets

Measured with `bun run build && bun run budget` (fallback content, no Sanity env) on `portfolio-3d` at `b7c90eb` plus this edition:

| Route                  | Initial JS (gz) | Ceiling |
| ---------------------- | --------------: | ------: |
| Home and text pages    |        157.1 KB |  180 KB |
| `/projects/<slug>`     |        162.5 KB |  180 KB |
| `/owner`               |        161.6 KB |  180 KB |
| `/ask`                 |        171.8 KB |  240 KB |
| `/lab/signature-field` |        158.7 KB |  170 KB |
| Fonts                  |      2 preloads |       3 |

- The scene loader, the author's moderation queue and message menu, and the ⌘K dialog are all lazy, so none of them is in the initial chunks.
- Client components never import `content/site` (it pulls the env schema): the author's handle reaches the composer and the messages as a prop.
- The "Change edition" link does not prefetch: the picker has its own root layout, so a prefetch would only preload CSS and fonts the page never uses.

## Shared code this edition uses

`lib/prefs/standard.ts` (own key `hr.dr.prefs`), `lib/scene/*` and `components/semantic/scene/*`, `lib/command/standard-actions.ts` with `use-command-dialog` and `use-command-menu` (`onWillOpen` for the pointer check), `ClickSound` with `voiceFor` and `onToggle`, the ask hooks and loaders, `lib/data/project-page.ts`, `lib/resume/load.ts`, the lab shader and accent hook, `use-link-preview`, `use-visitor-count`, `use-copy-email` and `lib/motion/entrance.ts`. It adds nothing to shared code.
