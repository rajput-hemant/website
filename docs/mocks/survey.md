# Field survey

**Thesis.** Hemant's record has a real shape: own projects on the lowland from 2022, then a sudden massif in 2024 to 2025 when four roles ran at once. A survey sheet shows that shape honestly and makes precision the aesthetic.

**Palette.** Survey paper `#DFE6DD` (cool, green-grey), contour brown `#9A5B2A`, water blue `#255F8A` (grid, coast, hydrography), woodland green `#36683A` (maintained, available), revision purple `#7A4AA5` (USGS photo-revision: current role, this edition), ink `#1C2A2B`. Night chart: `#0A1417` ground, amber contours `#C8975C`.

**Type.** Display: Spectral, spaced caps for the sheet name and regions, italic for hydrography and notes. Text and utility: Public Sans (US federal type, USGS lineage), tabular grid numbers. UnifrakturMaguntia once, for the archived project, as the OS lettering for antiquities.

**Layout.** The hero is a sheet: title band, map with neat line, marginalia with headline, bio and key. Eastings are calendar years. North of the dashed boundary is employment, south is own work. East of Sep 2026 is sea: unsurveyed.

**Signature.** The surveyor's loupe. A lens follows the cursor over the relief, magnifying terrain so contours bend around it, and reads out true data: month, grid ref, how many roles were running then. Hover a summit or site and the loupe moves to it.

**3D.** 3D-medium. The relief itself is a three.js mesh: a plane displaced in the vertex shader, one hill per role, height equal to months in the role, contours every 2 months, stepped tints, NW hillshade. An orthographic camera matches the SVG oblique exactly, so DOM labels sit on the summits. It renders only when the loupe moves or the theme changes. The gazetteer stays flat print, so the model stays special. Fallback: the same field drawn as SVG terraces.

**Motion.** Loupe eases at 0.2 per frame and snaps under reduced motion. Across pages the camera flies over the model to each page's grid square.

**Pages.** Projects: full gazetteer, 14 sites. Experience: a transect along one summit ridge per role. Now/changelog: revision notes in purple. Ask: field notebook entries. About: the sheet's survey history.
