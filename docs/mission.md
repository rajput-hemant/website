# Flight Plan

Last updated: 2026-09-27 at `3ea9661`.

The Flight Plan edition (registry id `mission`) presents the career as one mission, set as a 1970s standards manual: plain, exact and legible, which suits an engineer who sells precision. T-0 is the first role's start month (June 2024). The side projects before it are the pre-launch ground tests, and each role is a phase measured in months from T-0. Every device on the page carries a real fact from the data (`lib/flight.ts`).

| Flight Plan convention  | Carries                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| Section numbers         | Each page is a section of the plan: 1.0 crew profile, 2.0 missions, 3.0 trajectory, up to 8.0 |
| Phases `PH-1` to `PH-6` | Every role, numbered by start date                                                            |
| The telemetry strip     | The plan's designation and revision (`HR-26 · Rev 26.09`), the phase in flight, the live MET  |
| MET clock               | Mission elapsed time since T-0, `ddd:hh:mm:ss`, ticking once a second (`site/telemetry.tsx`)  |
| Fig. 1, the globe       | One orbit per phase: inclination = whole months served x 4°, node = start month x 30°         |
| Fig. 2, the trajectory  | One transfer arc per phase across its real dates, as high as the months served                |
| Pre-launch band         | Hatched and compressed, from January of the first ground test to T-0                          |
| Missions                | Every project, designated by name and launch year (`INF-22`)                                  |
| Mission patches         | One orbit per technology aboard, up to five                                                   |
| Mission states          | Nominal = maintained, Operational = active, In flight = in progress, Deorbited = archived     |
| Checklists              | Key facts with dotted leaders; a lit red lamp marks a nominal status                          |
| `SR-01`, `LOG-12`       | Status report lines on /now, and log entries, each also dated in mission time (`T+ 1Y 04M`)   |
| Capcom                  | /ask: transmissions numbered `TX 014`, moderated before they go out                           |

## Tokens (`flavors/mission/styles.css`)

- **Paper** (light, the mock's default): ground `#f4f5f3`, ink `#121417`, ink soft `#474c54`, signal red `#d2291d`.
- **Orbit** (dark): ground `#0d1219`, instrument white `#e9edf0`, soft `#afb8c1`, signal red `#ff5b41`, which reads on the dark ground; text on a red plate flips to the ground colour.
- Each colour is one `light-dark()` pair. `data-theme` pins `color-scheme` (the shared `color-scheme.css`), so an explicit choice wins over the OS in both directions.
- An 8px signal band runs across the top of every page (the body's top border), and each section opens under a 2px ink rule. Corners are square throughout; there are no shadows.
- The scene reads its own tokens (`--color-ground`, `--color-ink`, `--color-signal`) through `tokenColor`, so the globe repaints with the theme.
- Scrollbars are a telemetry scale: a track ruled with a tick every 8px and a square ink thumb that turns signal red under the pointer.

## Type

- **Chivo** 700 and 800 for the display lines: the name, titles, nav, buttons and figure-free headings. A 70s grotesk, not a Futura clone.
- **Public Sans** for everything you read (the US federal design system's own face).
- **Overpass Mono** 500 and 600 for telemetry: MET, captions, checklist keys, phase codes (the `label` utility). It is not preloaded, so the page keeps two font preloads.

## Layout and chrome

- **Header.** The red `HR` plate and the name, sections 2.0 to 5.0 (a red square marks the current one and the one under the pointer), then Resume, ⌘K, the Paper or Orbit switch (a half-filled disc; its label says where it goes) and Customize. Below md the nav drops to its own row.
- **Telemetry strip.** Under the header on every page: designation and revision, "Phase 6 of 6 · In flight", and the MET clock.
- **Page header.** The section number in red, what the page is in the plan, the title, a lede and a checklist; Fig. 1 on the right behind a hairline.
- **Footer.** Channels (Now, Ask, Resume, RSS), Downlink (email, copy, GitHub, LinkedIn) and the imprint: plan, place, typefaces, visitor count and "Change edition".

## Pages

- **Home:** 1.0 crew profile (name, headline, bio, the pre-flight checklist and two actions), Fig. 1 on the right and Fig. 2 across the foot of the first screen; then 2.0 missions (the featured four with the state legend) and 3.0 status report with the latest capcom transmission.
- **Projects:** the mission manifest, newest launch first, every project with its patch, in a ruled four-column grid (two on a tablet, rows on a phone).
- **Project:** the mission briefing: the patch large as Fig. 1, the profile checklist, the story (with the Sanity image as Fig. 2 when there is one), the payload as one checklist row per orbit, and the missions either side.
- **Experience (/work):** Fig. 2 full width, then 3.1 phase briefings, newest first, each with dates, duration, inclination, terms and station, and the transfers between phases (`continuedFrom` and `continuedInto`).
- **About:** the crew biography: 5.1 biography, 5.2 systems (skills as `SYS-01`), 5.3 training (education), 5.4 the pre-flight checklist and the downlink.
- **Now:** 6.1 current status (`SR-01`), 6.2 mission log by year, each entry dated and stamped with its mission time. `/changelog` redirects to `/now#log`.
- **Ask:** capcom: the composer ("Open a channel"), moderation for the author, transcripts and pagination.
- **Lab:** ground tests (`GT-01`); each runs on its own stand page.
- **Resume:** the crew record, one near-white sheet in both themes, black on white in print.
- **404:** loss of signal: the globe turned away with nothing lit, and every section listed.

## Motion and interaction

- **Scrubbing Fig. 2.** Pointer, touch or the arrow keys (Page Up and Down step six months, Home and End jump to the ends) move a red cursor through mission time. The arcs, the phase list and the globe's orbits active then turn red, and the readout names who was on board, or which ground tests launched that year before T-0. The plot is a `role="slider"` with a spoken value; leaving it returns to today. The server draws a wide and a narrow plot (`lib/trajectory.ts`), so there is no layout pass on the client.
- **The globe's settle.** On the first mount the globe starts turned 1.3 radians away and eases round until Mathura faces the viewer (about 1.2 s). A route change eases it to that page's pose (`lib/scene/poses.ts`). Drag turns it, eased.
- **Patches** turn their orbits 14° over 900 ms when the card is pointed at or focused.
- **Page changes** slide the next sheet up 8px and fade it in (View Transitions, 260 ms); the header and the globe stay put.
- **Buttons** press to 0.97 on `:active`. UI transitions stay at or under 300 ms, except the patch turn.
- **⌘K** opens without motion from the keyboard and with a short fade and scale only from a pointer click on the trigger.
- **Motion off or reduced:** no settle, no patch turn and a crossfade for page changes. The globe snaps to each pose; dragging still turns it (direct manipulation). Scrubbing is unchanged.

## 3D: the globe

One small orthographic globe, plain three.js, through the shared scene loader, store, clock and tiers (`components/scene/scene-root.ts`, `world.ts`). It sits in the page header's slot on every page except a project (which shows its patch), the lab experiment, an ask thread and the owner page. One object is enough, because Fig. 2 carries the story.

- A hidden-line drawing: a 15° graticule behind an occluding sphere in the ground colour, the limb drawn over it, and the launch site at Mathura (27.49° N, 77.67° E) as a red ring, dot and mast.
- One orbit per phase at radius 1.2 + 0.1 per phase. The lit orbits are drawn in signal red with a small octahedral craft that laps once a year; the rest are ink at 32%.
- What is lit comes from the page's pose: the phases active at the scrubbed time (today at rest), all of them on the resume, none on the lab and the 404. The orbits ride on `data-scene-board` (`encodeBoard`), and the scrubbed time reaches the scene through `lib/scrub.ts`, a tiny store with no React.
- Idle: zero frames. The clock wakes only for the settle, a drag, a scrub, a route change and a theme change. Hovering the globe renders nothing (`bindInput` only stamps `movedAt` during a drag).
- Fallback: `ScenePoster` draws the same globe in SVG with the same projection (`lib/scene/drawing.ts`), line for line, including the craft. It is the poster until WebGL is ready and the permanent figure on tier 0. The slot keeps its box, so CLS stays 0. The canvas is `aria-hidden` and carries no text.

## Sound

On by default and silent until the first click, synthesized by the shared engine (`lib/sound.ts`); the recipes and `voiceFor` are in `flavors/mission/lib/sound/voices.ts`, passed to the shared `ClickSound`. The flight director's console:

| Voice                    | Sound                                          | Plays on                             |
| ------------------------ | ---------------------------------------------- | ------------------------------------ |
| `key`                    | A console key: a short hollow click            | Links (pointer only)                 |
| `latch`                  | A push-button latching: a dull knock, released | Buttons                              |
| `toggleUp`, `toggleDown` | A guarded toggle thrown up or down             | Switches, and turning sound on       |
| `hatch`                  | A hatch unsealing: a short rising hiss         | Disclosures opening                  |
| `seal`                   | The hatch seating: a falling hiss and a thud   | Disclosures closing                  |
| `quindar`                | The capcom's Quindar tone, 2525 Hz             | Copy email, a question or reply sent |

No stamp (Press owns it) and no pencil or graphite (Drawing Set owns it). Turning sound on in Customize throws the toggle, and that click is the gesture that unlocks audio. Keyboard link activation is silent; hover never sounds. Touch taps buzz instead through the shared `TouchHaptics` (a Haptics switch sits under Sound in Customize on coarse pointers).

## Budgets

Measured with `bun run build && bun run budget` (fallback content, no Sanity env) on `portfolio-3d` at `0f3c391` plus this edition:

| Route                  | Initial JS (gz) | Ceiling |
| ---------------------- | --------------: | ------: |
| Home and `/work`       |        164.2 KB |  180 KB |
| Other text pages       |        160.1 KB |  180 KB |
| `/resume`              |        163.0 KB |  180 KB |
| `/owner`               |        166.6 KB |  180 KB |
| `/ask`                 |        172.9 KB |  240 KB |
| `/lab/signature-field` |        161.3 KB |  170 KB |
| Fonts                  |      2 preloads |       3 |

- three.js and the world are in the lazy scene chunk; the ⌘K dialog, the moderation queue and the message menu are lazy too.
- A project image is a plain `<img>` with a Sanity srcset (`projects/catalogue-image.tsx`), so project pages ship no image component.
- The poster is server-rendered SVG, about 6 KB gzipped of markup per page (plus its copy in the RSC payload), and no script.

## Shared code this edition uses

`lib/prefs/standard.ts` (own key `hr.fp.prefs`), `lib/scene/*` (clock, store, colors, dom, poster) and `components/semantic/scene/use-scene-mount`, `lib/command/standard-actions.ts` with `use-command-dialog` and `use-command-menu`, `ClickSound` with `voiceFor` and `onToggle`, `TouchHaptics`, the ask hooks and loaders, `lib/data/project-page.ts`, `lib/resume/load.ts`, `lib/format.ts` (`monthIndex`, `parseIsoDate`), the lab shader and accent hook, `use-link-preview`, `use-visitor-count` and `use-copy-email`. It adds nothing to shared code.
