# Timetable

The Timetable edition (registry id `timetable`) presents the portfolio as a transit network. The roles overlap, several ran at once, and a couple handed over in the same month. Transit information design (Vignelli, SBB, NS) exists to make overlapping schedules readable at a glance. Every device on the page carries a real fact from the data.

| Transit convention  | Carries                                              |
| ------------------- | ---------------------------------------------------- |
| Line and its colour | One role, newest first                               |
| Interchange         | A joint start, or a role that continued into another |
| You are here        | Today, on the current role                           |
| Platform number     | Page order: 0 home, 1 projects ... 7 resume          |
| Departures board    | The project index                                    |
| Calling at          | A project's stack                                    |
| Service updates     | Now and the changelog                                |
| Information desk    | /ask; answers are posted as notices                  |

## Tokens (`flavors/timetable/styles.css`)

- **Day:** enamel white `#f3f5f6`. **Night:** concourse `#0f1316`. Both come from `light-dark()`, and the pre-paint script pins them from `data-theme`.
- **Always dark:** the sign band (`sign`) and the departures board (`board`, `cell`, `flap`), in both themes.
- **Signal yellow** `#ffc20e` means "you are here", "delayed" and focus on dark surfaces. It never sets text on white. Focus on light surfaces is blue `#0a5eb0`.
- **Line colours** `--color-line-1..6` go to roles newest first. Each has a day and a night value.
- There is no accent picker, because yellow and the line colours carry meaning.

## Type

- **Overpass** (Highway Gothic lineage) for display and text, 800 for headings with tight tracking.
- **Overpass Mono** for flap cells, times, platform numbers and table heads.
- Both are preloaded: two preloads, well under the font budget.

## Layout and chrome

- **Sign band header.** Sticky, black in both themes: the yellow `HR` mark and the name, the platform nav (numbered plates; the current plate is lit yellow), then Resume, ⌘K and Customize. Below `lg`, the nav becomes a second row of four equal platforms.
- **Page header.** Each page header is a platform sign: the platform plate and kicker, the h1, a lede and key facts. The indicator hangs on the right (below the text on mobile).
- **Section heads.** A 3px ink rule, a mono kicker with an optional platform plate, an 800 heading and an aside.
- **Footer.** The availability line, platforms 5 to 7 plus RSS, and contact. The small print holds the handle, "Timetable valid from" (the first project year), the passenger count and "Change edition".

## Pages

- **Home:** the concourse hero (the headline is the h1, the bio, "See the departures" and "Ask a question"), the experience network, the four selected departures, then service updates and the latest desk notice.
- **Projects:** the full departures board, oldest first, with a platform filter (`#platform=<slug>`) and a legend. Status maps to Boarding (active), On time (maintained), Delayed (in progress) and Cancelled (archived).
- **Project:** service details: departure year, platform and status, the description, the stack as a calling pattern, then the previous and next departures.
- **Experience (/work):** the network map, then one line guide per role: roundel, service dates, length, where it runs, the note, the body, highlights as stops on the line, and "change here" notes.
- **About:** the station guide: general information (the bio), facilities (skills), history (education) and the information desk (contact).
- **Now:** current position (the now items as notices), then service updates grouped by year, with a category filter. `/changelog` redirects to `/now#log`.
- **Ask:** the information desk: a composer, how the desk works, and notices numbered `Notice 014`. Answers from the desk are set on the dark sign.
- **Lab:** experimental services; each experiment runs on its own page.
- **Resume:** the printed guide, always enamel white on screen and black on white in print.
- **404:** "This service does not run", with every platform listed.

## The network map (`lib/network.ts`, tested)

`buildNetwork(roles, today)` lays out the roles on a true month axis:

- Tracks are assigned greedily by start month. A role that `continuedInto` another hands its successor the free track nearest its own, so the change is a short diagonal.
- The newest track sits at the top.
- Interchanges are joint departures (fresh lines starting in the same month) and changes (continuations).
- `peak` is the most lines in service at once, over its first run of months. The section head states it.
- `events` feeds the mobile line diagram: one evenly spaced station per start, end, change and "you are here".

The map is aria-hidden SVG. The line key under it, an ordered list of every role, is the real content, so the home contract (links to /work, names every company) holds.

## Motion

- **Flaps.** `FlapText` renders characters in flap cells, with the words as real text beside them. `FlapRiffle` (deferred) turns each board through its drum once, when it first scrolls into view.
- **Lines** draw in (`data-draw`), and "you are here" pulses slowly. Hovering a line or its key entry lights it on the indicator.
- **Page transitions** slide content in from the right; the sign band and the indicator stay put.
- **Reduced motion:** nothing turns, pulses or swings. Everything is correct from first paint.

## 3D: the split-flap indicator

One persistent R3F scene: a hanging departure indicator on two rods. The loader, store, clock, tiers and DOM contract are the shared ones (`components/semantic/scene`, `lib/scene`).

- **Modules:** 12 on the top row and 16 on the bottom, on a glyph atlas drawn in Overpass Mono. Blank comes first on each drum, then A-Z, 0-9 and punctuation, plus a yellow-printed copy. `lib/board.ts` fits text to the drum and to the cell counts (`composeBoard`, tested). The bottom row can carry a yellow status tag.
- **Draw calls:** all 28 modules are 3 draw calls (instanced top halves, bottom halves and falling flaps, in one shader). The housing, face, stripe and rods add 4.
- **Flips:** each module turns one drum step every 55ms, in real drum order, staggered by column. With motion off, it places the text directly.
- **Route states** (`lib/scene/poses.ts`): each route has a yaw, pitch, fit, painted platform plate and resting board. A page can override the board with `data-scene-board` (for example, home reads the current role). Pointing at any `[data-scene-item]` with a `data-scene-label` turns the board to it, and `data-scene-line` tints the housing stripe with that role's colour. On /work, scroll scrubs the roles.
- **Interaction:** the mouse leans the sign. A drag swings it on its rods and springs back. On touch, "Tilt to swing" turns on device tilt.
- **Idle:** zero frames. The clock wakes only for flips, springs, tweens, scroll and pointer movement.
- **Fallback:** `ScenePoster` draws the same indicator and board in SVG. It is the poster before WebGL is ready, and the permanent fallback on T0.

## Preferences (`hr.tt.prefs`)

- **Theme:** day, night or auto.
- **Motion.**
- **3D sign:** auto, low or off.
- **Sound.**
- **Link previews.**
