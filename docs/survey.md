# Field Survey

Last updated: 2026-09-26 at or before `977bb60` (shallow history boundary). Not re-verified in the 2026-09-27 docs cleanup.

The Field Survey edition (registry id `survey`) presents the portfolio as a topographic survey sheet. The record has a real shape: own projects on the lowland from 2022, then a sudden massif in 2024 and 2025 when four roles ran at once. A survey sheet shows that shape honestly and makes precision the aesthetic. Every device on the sheet carries a true fact from the data.

| Survey convention           | Carries                                                |
| --------------------------- | ------------------------------------------------------ |
| Easting (grid column)       | One calendar year                                      |
| North of the boundary       | Employment (rows 05 to 09)                             |
| South of the boundary       | Own work (rows 00 to 04)                               |
| A hill and its summit       | One role; its height is its months in the role         |
| Contour, index contour      | Every 2 months; every 8 months                         |
| Revision purple             | The current role, this edition's changes (/now)        |
| Trig pillar, antiquity, box | Maintained, archived and in-progress projects          |
| The sea                     | After today: unsurveyed (also the 404)                 |
| Grid ref `24 07`            | Year, then northing row; every page has its own square |

## The sheet (`lib/relief.ts`, tested)

`buildRelief(experience, projects, today)` lays everything out in sheet units, the numbers the SVG, the poster and the mesh all use:

- The west neat line is the first year with a role or project; the east is the end of this year. Today is the coast.
- Each role is a gaussian hill: centred on the middle of its dates, as wide as its span, as high as its months (a current role rises to today). Roles take northing lanes in start order, each the lane farthest from every role it overlaps, so a massif spreads north to south.
- Projects are sites in their year's column on the own-work lowland, spread north to south by golden-ratio steps.
- `contour` traces closed rings with marching squares; `readout` gives the loupe's month, grid square and "4 roles running" (or the site under it); `profile` gives a transect. `peak` is the most roles at once.
- The oblique is `y = 70 + 0.9p - 3.4h`.

## Tokens (`flavors/survey/styles.css`)

- Every colour is a `light-dark()` pair. The used colour scheme comes from `data-theme` on `<html>` (set before paint from the visitor's choice, else the OS), so an explicit choice wins either way and every token flips at once.
- **Day sheet:** survey paper `#dfe6dd`, sheet `#ebefe7`, ink `#1c2a2b`. **Night chart:** `#0a1417`, amber contours `#c8975c`.
- Contour brown is the relief, water blue the grid, hydrography and focus, woodland green "maintained" and "available", revision purple "current". Eight stepped layer tints, lowland to summit.
- Scrollbars are contour brown in both themes.

## Type

- **Spectral** 500 in spaced capitals for the sheet name, regions and headings (preloaded); Spectral 400 and italic for notes, hydrography and ledes (on demand).
- **Public Sans** (US federal type, USGS lineage) for text, utility and tabular grid numbers (preloaded).
- **UnifrakturMaguntia** once: the names of archived projects, as antiquities are lettered.
- Two preloads, well under the font budget.

## Pages

- **Home:** the sheet: title band (the handle in spaced capitals, availability, "Sheet 26 · revised Sep 2026"), the relief map with every summit and site as a real link, marginalia (headline, bio, the key), the strip. Then Summits (the experience as a table of heights), a selected Gazetteer and Revision notes.
- **Projects:** the full gazetteer in grid order, filtered by condition (`#condition=<status>`).
- **Project:** a site report: grid ref, condition, field notes, what it was surveyed with, and the sites east and west.
- **Experience (/work):** one transect per role, a cross-section along its ridge: the shading beyond its outline is another role running alongside, and "Alongside" names them.
- **About:** the survey history: the surveyor, the instruments (skills), training (education) and correspondence.
- **Now:** revision notes in purple, then earlier revisions by year with a category filter. `/changelog` redirects to `/now#log`.
- **Ask:** the field notebook: entries `Entry 014`, answers set beside them on a purple rule.
- **Lab:** field trials, each on its own page. **Resume:** the printed sheet, always the day sheet on screen. **404:** "Unsurveyed", with the camera on the sea.

## Motion and interaction

- **The loupe** (`lib/loupe.ts`) is the signature: a lens in sheet units shared by the DOM and the mesh. It eases 0.2 of the way per frame and snaps with motion off. On home it follows the pointer over the map, magnifies the relief under it and reads out real data; pointing at or focusing a summit, site, summit row or gazetteer row sends it there.
- A reticle cursor (a cross in a ring, with a tag naming what a click does) follows fine pointers beside the native cursor and steps aside over the map, where the loupe is the cursor.
- Transects draw in as they scroll into view; page transitions lift the page like a turned overlay. Lenis smooth scroll, magnetic buttons, tilted lab cards and click sounds come from the shared layer.
- **Reduced motion:** nothing eases, draws or flies. Everything is correct from first paint.

## 3D: the relief

One persistent canvas on the shared scene store, clock, tiers and loader (`lib/scene`, `components/semantic/scene`), in plain three.js (no R3F):

- A plane displaced in the vertex shader, one hill per role; contours every 2 months, stepped tints and a north-west hillshade in the fragment shader, the sea and its hachure past the coast. Each vertex evaluates the hills once: the height and its exact slope (chained through the loupe's magnification) come from the same pass, so the hillshade needs no extra samples.
- An orthographic camera tilted 64 degrees reproduces the SVG oblique exactly on home, so the DOM labels sit on the summits.
- Every other page shows its own grid square in a header inset (`lib/scene/poses.ts`): projects the lowland, work the massif, now the coast, about the first year, ask and its earlier leaves the current summit, an entry its own spot on that summit (the entry number walks round it by the golden angle), the lab its trials, a trial its stake, the owner base camp at the coast, the resume the whole sheet (hidden in print), a missing page the sea. Trials are staked on their own lane just south of the boundary, in their year's column and always on land (`trialPoints`). Navigating flies the camera from the last window to the next; on insets the pointer leans the camera a few degrees and the loupe ring is drawn in the shader.
- **Props** (`components/scene/props.ts`) stand on each square, from `propsFor` in `lib/scene/poses.ts`: site markers on projects (trig pillar, antiquity cross, works box), this site with dashed sight lines to its west and east neighbours on a project, the notebook's cairn on ask (one stone per entry, at most 24; an entry page lights its own), trial stakes with flagging tape on the lab and a trial, base camp's tent for the owner, and at sea a buoy and a lighthouse. They draw as a fill and its ink edges per kind (instanced, unlit), stand on the relief as drawn, loupe included, and read their colours from the relief's tokens, so a theme flip tweens them together.
- Props answer the page: pointing at a gazetteer row or a neighbour link lifts its marker 6 units (a critically damped spring, about 180ms) and tints it water blue in 120ms, and lights the sight line; a condition filter sinks the markers it hides. Focusing the notebook composer lifts a spare stone over the cairn and sending drops it on with a small overshoot. Pointing at a trial card raises its flag, which ripples for a moment. On the 404 the buoy bobs only while the pointer moves over the inset and a drag nudges it; the lighthouse beam follows the loupe, and pointing at a surveyed page swings it back to land there.
- **Overprint** (`components/scene/overprint.ts`, drawn in the relief's own shader): pointing at a summit, summit row or transect lifts that hill's contour rings 6 units as one, in water blue with thicker index rings. On /work a hachured cutting plane stands on the ridge of the transect crossing the middle of the viewport (eased on scroll, snapped to one pointed at) and its section line runs on the ground under it. On /now revision purple hatches the current summit with a strip along the coast; pointing at a revision note (`R01`) strengthens it. The plane is the only extra draw.
- Reduced motion: tints only, no lift, ripple, bob or sweep; the cutting plane jumps; the beam points west; a drag moves the buoy without inertia. The flat sheet (`SheetGround`) draws every prop's twin, so the poster and T0 show them too.
- The page hands the scene its data on the slot's `data-scene-board` (hills, window, focus, props and the points of every `data-scene-item`). The page header puts the props on the relief (`withProps`); ask pages pass the notebook's size.
- **Idle:** zero frames. The clock wakes only for the loupe, a flight, a lean or a theme change.
- **Fallback:** the same ground drawn as SVG terraces (`SheetGround`), the poster before WebGL is ready and the permanent fallback on T0.

## 3D: blit glyphs

Glyph-sized monuments outside the inset, on the shared blit engine (`lib/scene/blit.ts`, see `docs/m2-scene-spec.md`, "Blit glyphs"): one engine per session (`components/scene/glyphs/engine.ts`), so one off-screen `WebGLRenderer` beside the relief's canvas, which glyphs never draw into. A glyph is copied into a plain 2D canvas in the page's flow, so it scrolls like an image and renders only while it moves.

- **Monuments** (`components/scene/glyphs/monument.ts`): the key's symbol stood up in 3D from the props' own models (`components/scene/models.ts`, one geometry for both): a trig pillar (filled when active), an antiquity's cross or a dashed works box, on a faint pad, unlit, ink edges on sheet fill, repainted from the tokens on a theme flip. Springs as the props' (about 180ms).
- **Project page** (`SiteMonument`, `components/projects/monument-glyph.tsx`): a 96px monument beside "Marked on the sheet as". A drag spins it, with inertia (0.92 per 16ms) when motion is on; the mouse leans it up to 8 degrees. Reduced motion: it stops where it is let go and does not lean.
- **Gazetteer** (`RowMonument`): pointing at a row with a mouse stands its symbol up and turns it a quarter; leaving turns it back, cross-fades to the printed symbol and detaches (or detaches anyway 550ms after leaving, for a row that scrolled off before it rested; `components/projects/row-hover.ts`), so only hovered rows draw (never more than the engine's 4). Reduced motion: the turn snaps. Touch: the printed symbol only.
- **Posters and fallback:** the printed `SiteSymbol` holds the box (CLS 0) and is the T0, refused and context-lost state; the glyph chunk loads when the browser is idle and never at T0. Every glyph is `aria-hidden` and decorative (the sentence or the row says the same); no canvas text.
- **Idle:** zero frames; a glyph renders only while it turns or leans.

## Sound: the instrument case (`lib/sound/`, tested)

On by default; nothing plays before the first click. Every voice is synthesized by the shared engine (`lib/sound.ts`); there are no samples. Recipes and the click mapping live in `flavors/survey/lib/sound/voices.ts`, the sheet's hover and tally sounds in `lib/sound/benchmark.ts`. Brass and glass: short, dry and mechanical, never above gain 0.12. Per audit section 2.2 nothing here is a stamp (Press owns it) or a pencil (Drawing Set owns it).

| Voice          | Where it plays                                                                   | Recipe                                                                                                                                                                                                               |
| -------------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Click-stop     | Links                                                                            | 6ms noise, bandpass 3.2kHz Q 6, plus a 2400Hz sine over 14ms at 0.625, gain 0.08.                                                                                                                                    |
| Clamp          | Buttons and filter chips                                                         | The click-stop a fourth lower and heavier: bandpass 2.4kHz, 1800Hz sine over 20ms.                                                                                                                                   |
| Level bubble   | Switches (up for on, down for off), a new segmented option, the sound-on preview | Sine glide 660 to 990Hz (or back) through a 3kHz lowpass, 4ms attack, 90ms decay, gain 0.06. The option already chosen stays quiet.                                                                                  |
| Sheet turn     | The theme toggle (`data-voice="sheetTurn"`, silent on touch)                     | Two noise brushes through a bandpass swept 1.2 to 3.5kHz, 90ms then 60ms at 0.6 starting 35ms in, 8ms attack, gain 0.05.                                                                                             |
| Benchmark ping | Pointing at a summit on the home sheet (mouse or pen only)                       | Sine f plus 1.5f at 0.3, 3ms attack, 180ms decay, gain 0.035. f = 523.25 x 2^(h/24) Hz for a role h months tall (clamped to 72 months). The current role adds 2f at 0.15. Sites ring a fixed 1046.5Hz at gain 0.025. |
| Confirm        | Email copied, resume printed, question sent (success only, plays on touch)       | The current-role ping at the datum (C5), gain 0.05, on its own budget so the click never starves it.                                                                                                                 |
| Tally          | The home loupe's "N roles running" count changes                                 | Triangle 880 x 2^(3n/12) Hz, 18ms, gain 0.02, at most one per 90ms. Never on a sheet's first reading.                                                                                                                |

- **Click mapping.** `ClickSound` gets `voiceFor`. It hears the click in the capture phase, so a switch's `aria-checked` still holds the old state. `data-voice="<name>"` picks a voice and `data-voice="none"` silences a control; the ⌘K trigger and everything in the menu stay silent.
- **Hit areas.** A labelled `Switch` and each `SegmentedControl` option stretch the Base UI root over the row, so a click on the text reaches the `role=switch`/`role=radio` element instead of the hidden input.
- **Guards.** Sounds outside `ClickSound` check `isSoundOn()`, `document.hidden` and `navigator.userActivation.hasBeenActive`, so a hover before the first click never tries to start audio. Hover pings skip touch and keyboard focus. The tally needs a fine pointer and motion on: with motion off the loupe snaps and counts would jump in bursts.
- **Not wired yet.** The inset hover path (a `data-scene-item` on an inner page pinging through the scene) waits for the scene work in flight; `pingSummit` and `pingSite` are ready for it.

## Preferences (`hr.sv.prefs`)

The shared standard schema (`lib/prefs/standard.ts`): theme (day sheet, night chart or auto), motion, 3D relief (auto, low or off), sound, haptics (touch screens only, on by default, through the shared `TouchHaptics`), link previews.
