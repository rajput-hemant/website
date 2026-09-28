# Field Survey

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

- A plane displaced in the vertex shader, one hill per role; contours every 2 months, stepped tints and a north-west hillshade in the fragment shader, the sea and its hachure past the coast.
- An orthographic camera tilted 64 degrees reproduces the SVG oblique exactly on home, so the DOM labels sit on the summits.
- Every other page shows its own grid square in a header inset (`lib/scene/poses.ts`): projects the lowland, work the massif, now the coast, about the first year, ask the current summit, a missing page the sea. Navigating flies the camera from the last window to the next; on insets the pointer leans the camera a few degrees and the loupe ring is drawn in the shader.
- The page hands the scene its data on the slot's `data-scene-board` (hills, window, focus and the points of every `data-scene-item`).
- **Idle:** zero frames. The clock wakes only for the loupe, a flight, a lean or a theme change.
- **Fallback:** the same ground drawn as SVG terraces (`SheetGround`), the poster before WebGL is ready and the permanent fallback on T0.

## Preferences (`hr.sv.prefs`)

The shared standard schema (`lib/prefs/standard.ts`): theme (day sheet, night chart or auto), motion, 3D relief (auto, low or off), sound, link previews.
