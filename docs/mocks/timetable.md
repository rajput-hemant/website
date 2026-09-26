# Timetable

**Thesis.** Hemant's career is a real network: six roles, several running at once, handing over in the same month. Transit information design (Vignelli, SBB, NS) makes overlapping schedules legible at a glance, which is what a fast, pixel-exact frontend does too. Every device encodes a fact.

**Palette** (white enamel signage, one colour per line)
- Enamel white `#F3F5F6` (night `#0F1316`)
- Signage black `#14191E`
- Signal yellow `#FFC20E`: you are here, available, delayed
- Board black `#171B1F`, flap cell `#262C32`
- Lines: Zunta `#D52B1E`, Proghit `#0A5EB0`, Lightwork `#00874E`, FastLane `#B85A00`, Blai `#7C3AA0`, MixR `#8C5A2B`

**Type.** Overpass for display and text (Highway Gothic lineage, built for wayfinding); Overpass Mono for flap cells, dates and tables.

**Layout.** Black overhead sign band with platform-numbered nav. Hero as concourse: name left, hanging indicator right, network map full width below. Mobile turns the map into a vertical line diagram with event stations.

**Signature.** The experience network map: roles are lines on a true time axis, interchanges are the real overlaps (joint departure Sep 2024, FastLane to Blai Sep 2025, Proghit to Zunta Jan 2026), and "you are here" sits on Zunta. It proves "up to 4 lines in service at once".

**3D.** Deliberately 3D-light: one real object, the hanging split-flap indicator (three.js, procedural housing, rods and 23 flap modules on a glyph atlas). Flaps turn through the real drum order to spell ZUNTA NOW; pointing at a nav item riffles it to that page, which is how it persists across pages in R3F. Mouse leans it, touch drag swings it on its rods. Renders only while something moves; reduced motion gets a static pose; the SVG is the fallback. The map stays flat because flat is what makes it legible.

**Motion.** Departure rows riffle in on scroll; a slow yellow pulse on "you are here"; hovering a line dims the rest.

**Pages.**
- Projects: full departures board, filter by platform (stack).
- Experience: the network map, one page per line.
- Now: "current position" with service updates.
- Ask: the information desk, answers posted as notices.
- About: the station guide.
