# Timetable

Last verified: 2026-09-27 at `b50faeb`.

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

- **Day:** enamel white `#f3f5f6`. **Night:** concourse `#0f1316`. The day values are the `@theme` defaults; the night values are a `[data-theme="dark"]` override (set before paint by the pre-paint script), with a `prefers-color-scheme: dark` fallback when no `data-theme` is set.
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
- **Lines** draw in (`data-draw`), and "you are here" pulses slowly. Hovering a line or its key entry lights it on the indicator; on the network map the other lines dim, and on a line guide the active line thickens and a signal dot slides to its end.
- **Overlays.** ⌘K opened from the keyboard appears at once, without its enter animation. Popovers scale from their anchor and leave faster (160ms) than they arrive.
- **Page transitions** slide content in from the right; the sign band and the indicator stay put.
- **Reduced motion:** nothing turns, pulses or swings. Everything is correct from first paint.

## 3D: the split-flap indicator

One persistent R3F scene: a hanging departure indicator on two rods. The loader, store, clock, tiers and DOM contract are the shared ones (`components/semantic/scene`, `lib/scene`).

- **Modules:** 12 on the top row and 16 on the bottom, on a glyph atlas drawn in Overpass Mono. Blank comes first on each drum, then A-Z, 0-9 and punctuation, plus a yellow-printed copy. `lib/board.ts` fits text to the drum and to the cell counts (`composeBoard`, tested). The bottom row can carry a yellow status tag.
- **Draw calls:** all 28 modules are 3 draw calls (instanced top halves, bottom halves and falling flaps, in one shader). The housing, face, stripe and rods add 4.
- **Flips:** each module turns one drum step every 55ms, in real drum order, staggered by column. With motion off, it places the text directly.
- **Route states** (`lib/scene/poses.ts`): each route has a yaw, pitch, fit, painted platform plate and resting board. A page can override the board with `data-scene-board` (for example, home reads the current role). Pointing at any `[data-scene-item]` with a `data-scene-label` turns the board to it, and `data-scene-line` tints the housing stripe with that role's colour. On /work, scroll scrubs the roles.
- **Ask:** after a visitor sends a notice (`emit({ type: "ask:sent" })`), the board reads `NOTICE RCVD / AWAITING REVIEW / HELD` for 6 seconds.
- **Interaction:** the mouse leans the sign. A drag swings it on its rods and springs back. On touch, "Tilt to swing" turns on device tilt.
- **Idle:** zero frames. The clock wakes only for flips, springs, tweens, scroll and pointer movement.
- **Fallback:** `ScenePoster` draws the same indicator and board in SVG. It is the poster before WebGL is ready, and the permanent fallback on T0.

## Sound: station acoustics (`lib/sound/voices.ts`, tested)

Off by default. Every voice is synthesized by the shared engine (`lib/sound.ts`); there are no samples. The recipes and the click mapping live in `flavors/timetable/lib/sound/voices.ts`, the flutter scheduling in `lib/sound/flutter.ts`.

| Voice           | Where it plays                                                                  | Recipe                                                                                                                                                 |
| --------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Flap flutter    | Each 3D flap step (`world.tsx`, every `m.cur = m.next`)                         | 5ms noise grain, bandpass 3.2kHz (±8% per grain) Q 3.5, gain 0.035 (±20%). Pooled: at most 40 a second, 16ms apart, 3 a frame.                         |
| Seat            | A turning board comes to rest                                                   | 5ms noise, lowpass 900Hz, gain 0.05, on its own budget.                                                                                                |
| Riffle          | The first audible `[data-flap]` riffle on each page, only while it is on screen | The flutter at half gain.                                                                                                                              |
| Enamel tap      | Platform links at full gain, every other link at 0.6                            | 1850Hz plus 4420Hz sines (0.4), 45ms, gain 0.09.                                                                                                       |
| Validator clunk | Buttons, `.press` controls (including `asChild` links), the sound-on preview    | Sine 150 to 85Hz over 70ms plus 8ms of noise lowpassed at 1.2kHz, gain 0.12.                                                                           |
| Relay           | Switches and segmented controls                                                 | Two 6ms squares through a 2kHz lowpass, 14ms apart: 1400 then 1700Hz for on, the reverse for off, gain 0.06. The option already chosen stays quiet.    |
| Station chime   | Ask sent, owner reply posted, email copied (success only)                       | E5 then C5, 200ms apart, each a sine plus its second harmonic at 0.18, 450ms decay, gain 0.08. Has its own budget, so the send click never starves it. |
| Rod ring        | Releasing a sign drag past 60px                                                 | 2400Hz plus 3310Hz sines, 140ms, gain 0.03; pitch 0.9x at rest to 1.1x at 2px/ms release speed.                                                        |

- **Click mapping.** `ClickSound` gets `voiceFor`. It hears the click in the capture phase, so a switch's `aria-checked` still holds the old state: `false` plays relay on. `data-voice="<name>"` picks a voice by name and `data-voice="none"` silences a control. The ⌘K trigger and everything inside the menu stay silent.
- **Hit areas.** A labelled `Switch` and each `SegmentedControl` option stretch the Base UI root over the whole row, so a click on the text lands on the `role=switch`/`role=radio` element (a label click would otherwise go to the hidden input and stay silent).
- **Reduced motion.** Click sounds stay. The flaps don't turn, so a board change plays one seat instead of the flutter, and riffles (which don't run) make no sound.
- **Guards.** Scene sounds (flutter, seat, riffle, ring) check `isSoundOn()`, `document.hidden` and `navigator.userActivation.hasBeenActive`, so a board flipping on page load never tries to start audio. Touch UI clicks are silent; the chime still plays on touch.

## Preferences (`hr.tt.prefs`)

- **Theme:** day, night or auto.
- **Motion.**
- **3D sign:** auto, low or off.
- **Sound.** Today the shared click tick. The Timetable palette (flutter synced to flap steps, enamel tap, validator clunk, relay, chime, ring; improvements audit appendix D, section 5) is in progress.
- **Haptics:** on by default, shown on coarse pointers only; the shared `TouchHaptics` in `deferred-layers.tsx`.
- **Link previews.**
