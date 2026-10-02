# Design system: "Control Surface"

Last verified: 2026-10-02 at `51a1b5c`.

The third edition (registry id `surface`). Code lives in `flavors/surface/` and `app/f/surface/`. It follows `docs/flavors.md`; the mock it started from is `docs/mocks/surface.html`.

## Thesis

Hemant builds fast, exact interfaces, so the portfolio is a precision instrument: the HR-26 (his initials, 2026 revision). Every page is a channel on its faceplate, every control does one thing, and every number on a display is real data.

| Instrument convention | Carries                                        |
| --------------------- | ---------------------------------------------- |
| Channel number        | Page order (00 Home to 07 Resume)              |
| Rotary encoder        | The page's items: channels, presets, tracks    |
| Seven-segment LCD     | Counts and indexes (projects, roles, since)    |
| Status lamp           | Project status, the current channel, available |
| Multitrack tape       | Six overlapping roles on one time axis         |
| Rating plate          | Type, stack, teams, where it's made            |
| Dot-matrix line       | Now and the log                                |

**Themes:** the grey powder-coat plate (light) and the black anodised plate (dark), switched by the header's Edition switch. **Accent:** signal yellow marks only what is live (a lit lamp, the knob's index, the playhead) and is never used for text.

## Tokens (`flavors/surface/styles.css`)

| Role       | Grey      | Black     | Use                         |
| ---------- | --------- | --------- | --------------------------- |
| `plate`    | `#D5D2CA` | `#151514` | page                        |
| `plate-2`  | `#DFDCD5` | `#1C1C1A` | raised modules              |
| `plate-lo` | `#C3BFB6` | `#0C0C0B` | recesses, switch tracks     |
| `ink`      | `#1A1A18` | `#ECE9E2` | text and legends            |
| `ink-2`    | `#4B4944` | `#A3A097` | secondary text (AA)         |
| `ink-3`    | `#6F6C65` | `#7C7970` | decoration, large text only |
| `signal`   | `#F2B705` | `#F7C02A` | lamps, knob index, playhead |
| `lcd`      | `#AAB397` | `#141B12` | LCD glass                   |
| `lcd-ink`  | `#1C2217` | `#C9D7A2` | LCD segments and text       |

Component classes: `.legend` (engraved label), `.key` (hardware key for links and buttons), `.led` (`data-on`, `data-pulse`), `.glass` (LCD), `.mod` and `.rack-mod` (raised modules), `.rating-plate` (always-light aluminium), `.slide` (switch), `.screw`, `.seam-t`/`.seam-b` (milled seams), `.matrix` (dot matrix).

## Type

- **Barlow Semi Condensed 600**: legends and display, DIN-lineage engraving. Preloaded; the LCP is set in it.
- **Barlow 400/500**: text. Preloaded.
- **Doto 800**: dot-matrix lines only. Not preloaded.
- **Numerals on displays** are hand-built seven-segment SVG (`components/ui/seg.tsx`) with a screen-reader label.

## The signature: the knob (`components/knob/`)

One rotary encoder, on every page. Its detents are that page's items:

| Route         | Detents                                  | Unit    |
| ------------- | ---------------------------------------- | ------- |
| `/`           | Home and channels 01 to 04               | Channel |
| `/projects`   | every project                            | Preset  |
| `/projects/x` | every project (browse)                   | Preset  |
| `/work`       | every role                               | Track   |
| `/lab`        | every experiment                         | Study   |
| `/about`      | manual sections                          | Section |
| `/now`        | now, then each log year                  | Page    |
| `/ask`        | listed conversations                     | Thread  |
| `/resume`     | resume sections                          | Section |
| `/ask/x`      | the threads on its list page (browse)    | Thread  |
| `/lab/x`      | every experiment (browse)                | Study   |
| `/owner`      | one detent, "Locked"                     | Key     |
| 404           | the channel selector, no channel current | Channel |

An empty list never drops the rail: `/now` without a log keeps its "Now" detent and `/ask` with no threads keeps one "Queue empty" detent that opens nothing, so the layout and the knob's canvas stay put. `Panel` requires a knob.

- **Turn to select, push to open.** Drag (with notched detents and soft end stops), arrow keys, Home/End and PageUp/PageDown turn it; a click or Enter opens what the detent points at. It is a real `role="slider"` with `aria-valuetext`.
- **Linked to the page.** Hovering or focusing an element with `data-knob-item="<n>"` leans the knob to it; turning the knob lights the item (`data-knob-active`) and scrolls it to the centre; scrolling the page turns the knob. `data-knob-mirror` is a second view of an item that lights up and previews but does not scroll (the multitrack on `/work`). On home, `data-channel` on the header keys and selector legends does the same.
- **Keyboard channels.** `0` to `4` anywhere switch channel (outside fields and sliders).
- **Store.** `lib/knob/store.ts` (zustand vanilla): `owner`, `count`, `index`, `preview`, `drag`, `pressed`, `tiltX`, `tiltY`. Geometry is pure and tested in `lib/knob/geometry.ts`.

## 3D (`components/scene/`)

- 3D-light on purpose: the plate is flat and printed, and the 3D objects are the instruments bolted to it (the knob, then the small parts below). Nothing else on a page is a model. The knob: a lathe-turned body with turning marks in its roughness map, 150 instanced knurl ribs, an inlaid signal-yellow index and a soft contact shadow, lit by a `RoomEnvironment` and one directional light. Plain three.js (no R3F): one object does not need a reconciler.
- **The bench** (`components/scene/bench.ts`, the shared blit-glyph engine `lib/scene/blit.ts` under Surface's names, see `docs/m2-scene-spec.md`, "Blit glyphs"): one off-screen `WebGLRenderer` per session, shared by every instrument. An instrument (`components/scene/instruments/*.ts`, the knob first) owns its scene, camera and springs; the bench gives each DOM slot a plain 2D canvas, and when an instrument is kicked it steps it, renders it into a corner of the GL canvas and copies that corner into the slot in the same task. So one GL context serves any number of instruments, the pixels scroll with the page like an image, and nothing renders at rest or off screen. Context loss sends every slot, and any later one, back to its poster; when the browser restores the context the bench makes a new renderer and the knob comes back.
- The knob is built once per session and moves between slots on navigation, so it keeps its angle and turns to the new page's detent.

### Instruments on the bench

Fourteen parts in `components/scene/instruments/` (lamp, screws, reels, rotary, toggle, bargraph, meter, printhead, spindle, patch, plate, roll, pushbutton, keyswitch), each with a React host in `components/instruments/` that renders its printed poster (SVG or CSS) first and mounts the 3D part after idle. The shared pieces:

- `components/scene/workshop.ts`: the room light, materials, `turned()` (a lathe profile drawn like a section, axis first) and the soft shadow. Every part uses it, so the lighting matches.
- `components/instruments/use-instrument.ts`: waits for idle, skips tier 0, imports the part's chunk, mounts it in `[data-bench-host]` and sets `data-bench-live` on the root, which hides the poster (`[data-bench-poster]`). Context loss puts the poster back until the context is restored.
- Parts are lazy chunks. The React hosts are small and eager; nothing under `components/scene/` is imported by a page. The 404 page sits in the layout tree, so it loads its knob, patch cable and meter through `next/dynamic` (`components/site/lost-instruments.tsx`) to keep them out of every route.
- Every instrument is `aria-hidden` and decorative: the text, links and keys beside it say and do the same. Where it is also an input it wears or wraps a real control (the Send key, the lab power `role="switch"`).
- A page runs at most four instruments plus the knob (the engine's cap). Lamps, bar-graphs and levers that share a `name` are one object that keeps its state across pages.

| Page          | Instruments                                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `/`           | Jewel status lamp (click copies the email), rating plate screws (hover and drag turn them), tape reels (follow rows)   |
| `/projects`   | Bank rotary switch (steps the knob to a bank's first preset), one travelling jewel lamp that sits in the active preset |
| `/projects/x` | Preset bar-graph (follows the knob), prev/next bat toggle (flick to navigate, springs back)                            |
| `/work`       | Tape reels (follow the knob, drag to scrub it), needle meter (tenure as a share of the longest role)                   |
| `/now`        | Dot-matrix print head (shuttles and strikes at the knob's stop), paper spindle (advances per detent, drag to wind)     |
| `/about`      | Patch bay (drag the plug into Email, or a link, to copy or open), brushed specifications plate that leans              |
| `/resume`     | Thermal paper roll beside Print (hover nudges, press feeds then prints), availability lamp                             |
| `/ask`        | Queue bar-graph (one segment per message of yours awaiting approval), arcade send button (also the thread reply)       |
| `/ask/x`      | Answered or awaiting jewel lamp (pulses while awaiting)                                                                |
| `/lab`        | Study toggle bank (up for live or in progress, down for archived; click selects the study)                             |
| `/lab/x`      | Power toggle (off unmounts the experiment and leaves its poster), bezel screws                                         |
| `/owner`      | Key switch (turns on sign-in, rattles on an error), status lamp (idle, busy, error)                                    |
| 404           | Patch cable to Home, Projects or Experience, needle meter pinned at zero (trembles on hover)                           |

Reduced motion renders each part's final pose with no lean or spring. Sounds reuse the existing voices: a plug seating or a lever latching is the Latch (`playLatch`), a thrown bat lever is Slide plus Latch, and the nav toggle then plays Relay; the lamp click and the Send key play Beeper OK through the existing handlers.

**Built later, deferred:** the lab's trim-pot row (decorative), the real `paused` prop for lab experiments (see below), and a jewel lamp per thread in the feed (the feed keeps its printed lamps; only the permalink page has the 3D one).

**Zoom and 360 candidates** (reviewed, not wired; recipe in `docs/m2-scene-spec.md`, "Inspect controls", through the `inspectGlyph` adapter): the patch bay (plug drag), the bat toggle (flick), the key switch (turn), the needle meter, the tape reels (drag scrubs the knob) and the brushed plate (144 by 56px, with its engraving in the DOM over it) are small instruments, mostly with their own gestures, so a drag turn would fight them and a turned plate would leave its engraving behind. Each part's group is a single root, so a larger host (and a decision about the gestures) is all `inspectGlyph` would need.

**Lab power.** The audit has the power toggle pause the experiment through a `paused` prop on `ExperimentSceneProps` (`lib/lab/types`). That is a shared file, so the toggle unmounts the experiment instead (the poster stays and the power-on remounts it). Proposed shared patch: add `paused?: boolean` to `ExperimentSceneProps`, pass it through `experiment-stage.tsx`, and have each scene stop its loop while it is true.

- **Zero idle frames.** A spring loop (`lib/knob/frame-loop.ts` and `lib/knob/spring.ts`, both tested) renders only while the angle, lean or press is settling, and not while the slot is off screen. The springs step by real elapsed time, so they settle the same at any frame rate.
- Loads after `load` plus `requestIdleCallback`. Tier 0 (scene off, no WebGL2, Save-Data, reduced data) never imports it; tier 1 (low setting, 4GB or less, coarse pointer) runs at DPR 1 without antialiasing; context loss falls back to the printed knob until the context is restored.
- The printed SVG knob is server-rendered and always works: it turns with a sprung CSS transition and supports the same drag and keys.

## Layout

- **Home.** A full-viewport faceplate: legend row, the headline as the h1, the channel selector, and a strip of modules (readout LCD with CH, since, projects and roles, a status module with the copyable email, the rating plate). Then the multitrack (experience, linking to `/work`), preset bank A (four selected projects), and the Now and Ask modules.
- **Inner pages** (`components/site/panel.tsx`). Legend row, h1, lede and readouts on the left 8 columns; the knob module in the right 4, sticky on wide screens. On phones the knob sits beside its LCD under the header.
- **Header.** "Hemant Rajput" with the HR-26 badge, channel keys 01 to 04 with lamps, Resume, ⌘K, and the Edition and Motion switches. Keys drop to a second row on phones.
- **Footer (rear panel).** Auxiliary channels (Now, Ask, Resume, RSS), the visit counter as six seven-segment digits, the Service switches (3D knob, Sound, and Haptics on coarse pointers) and the serial line with Change edition.
- The edition has `/about` and redirects `/changelog` to `/now#log`. Unknown paths render "No signal on this channel".

## Motion

- Sprung detents with slight overshoot (knob and CSS), 150ms lamp fades, a 1.8s pulse only for work in progress, 80ms key presses, a short fade on route change.
- Anchor jumps and knob scrolls glide (CSS `scroll-behavior: smooth` with motion on); route changes jump to the top (`data-scroll-behavior="smooth"` on `<html>` lets Next turn smooth scroll off while it navigates).
- ⌘K opened from the keyboard appears at once, without its open animation.
- The knob's spring is time-based (same feel at 60 and 120 Hz). On the SVG poster a hover preview (header keys, legends) turns in 260ms `--ease-out`; a commit keeps the weighty 550ms `--ease-detent`. A press sinks the poster to 0.985 over 80ms and releases over 160ms on `--ease-spring`.
- The active ring on preset, study and role modules fades over 150ms (`--ease-out`), and it stays when motion is off, since it is a shadow change and not a displacement. The slide switch thumb squeezes to 0.94 on press (80ms), like a key sinking.
- The knob readout LCD blanks for 30ms when its value changes and fades the new digits and label in over 50ms (WAAPI, no React state). Nothing runs on first paint.
- The ⌘K key reserves the width of "Ctrl K", so the server's "⌘K" swapping to "Ctrl K" on hydration shifts nothing. Home and the inner pages measure CLS 0 with 3D on and under reduced motion; the dynamic 404 shell shift is a shared issue tracked in the to-do.
- **Cursor** (fine pointers only). A probe follows beside the native cursor: a scale ring with a signal pip that turns a detent over a control, with an engraved legend naming what a click does (`Open`, `Visit`, `Turn` on the knob). It steps aside over text fields; touch never sees it; focus rings are untouched.
- Instruments settle on springs and render only while moving (the lever overshoots, the needle springs with overshoot, the print head strikes on arrival, a plug swings home). The Motion switch (or the OS setting) stops all of it: the knob snaps, lamps stop pulsing, scrolling is instant, and instruments take their final pose at once.

## Sound: electromechanical (`lib/sound/`, tested)

On by default (the footer's Sound switch, or ⌘K, turns it off); nothing plays before the first click. Every sound is a mechanism rather than a tone, synthesized by the shared engine (`lib/sound.ts`) with no samples, and every voice peaks below 0.15 so it sits under speech. The recipes and the click mapping live in `flavors/surface/lib/sound/voices.ts`, the knob's pooled detents in `lib/sound/detents.ts`.

| Voice         | Where it plays                                                                                     | Recipe                                                                                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Detent        | The knob crosses a detent (drag), or an arrow key selects one                                      | 10ms noise, bandpass 3.2kHz Q 8, gain 0.12, plus a 180Hz sine thump at half gain over 12ms. Detuned 0.97x to 1.03x by detent index, so a spin ratchets. |
| End stop      | A drag meets either end (once per contact, re-armed after leaving it), an arrow pressed at an end  | 30ms noise lowpassed at 900Hz, gain 0.1, plus a triangle 110 to 80Hz over 40ms at 0.08.                                                                 |
| Relay         | Knob push to open, the 0 to 4 shortcuts, a channel key to another channel                          | Two noise clicks 18ms apart: bandpass 1.6kHz Q 6 over 6ms at 0.1, then 2.4kHz Q 6 over 5ms at 0.07.                                                     |
| Key leaf      | Links and `.key` controls: down on press, up on a release inside; other buttons play the down leaf | Down: 6ms noise, bandpass 2.2kHz Q 4, gain 0.07, plus a 900Hz triangle over 12ms at 0.04. Up: 2.8kHz over 5ms, gain 0.04.                               |
| Slide + latch | Slide switches (Edition, 3D knob), the bat toggles, and the sound-on preview                       | A 60ms scrape, noise bandpass swept 1.2 to 4kHz peaking at 0.035, then the latch at 110ms (the thumb's overshoot): 1.9kHz Q 8 over 8ms, gain 0.09.      |
| Latch         | The Motion switch, every switch with motion off, a new radio option, a plug or lever seating       | The latch alone, with no delay.                                                                                                                         |
| Beeper OK     | Email copied, ask filed, owner signed in (success only)                                            | Square 1318Hz for 45ms, then 1760Hz for 60ms, lowpass 2.5kHz Q 0.7, gain 0.05.                                                                          |
| Beeper alarm  | A new ask error, a sign-in error                                                                   | Square 440Hz, twice 70ms with a 50ms gap, lowpass 1.2kHz, gain 0.045.                                                                                   |

- **Wiring.** `PrefsSync` mounts `ClickSound` with `voiceFor` and `KeySounds` (a pointerdown/pointerup capture listener for the key leaves) while sound is on. `data-voice="<name>"` picks a voice by name and `data-voice="none"` silences a control. The ⌘K menu stays silent; the ⌘K key itself is a key and plays its leaves.
- **Budgets.** Detents and the end stop play from grain pools (`createGrainPool`) rather than the click limiter, so a fast spin keeps one detent per 25ms instead of losing most of them to the 40ms and 80ms gates. Key leaves and the beeps have their own pools too, so a quick press keeps its up leaf and the send click never starves the confirmation.
- **Guards.** Direct calls (knob, keys, relay, beeps) check `isSoundOn()` and `document.hidden`. Turning sound off, or hiding the tab, suspends the audio context (`PrefsSync`); it resumes on the next sound.
- **Touch.** Key leaves stay silent on touch (they double the OS haptic and mis-fire on scroll starts). The knob's detents, end stop and relay play, because the knob is direct manipulation; switches play (they are named with `data-voice`); the beeps play.
- **Keyboard.** Link activation stays silent; a keyboard press on a key button plays the down leaf; switches sound; arrow keys on the knob play detents and the end stop.
- **Reduced motion.** Click sounds stay; switches play only the latch, because the thumb no longer slides. Scroll-driven knob turns stay silent in every mode: the hand didn't turn it, and a fling would machine-gun.

## Shared code it uses

Data (`lib/data`, including the project page loader), metadata, format, the ask client and page loaders (`lib/ask`), command core (`lib/command`, `useCommandMenu` and `useCommandData`), prefs store factory (`lib/prefs/store.ts`), resume loader (`lib/resume/load.ts`), tier detection (`lib/scene/tier.ts`), lab core (`lib/lab`, `components/semantic/lab`), and the headless hooks in `components/semantic` (visitor count, copy email, root data, ask owner and pending echoes).

## Preferences (`hr.cs.prefs`)

Theme (grey, black or auto), motion, 3D knob (auto, low or off) and sound. Its own schema, not the shared standard one. Plus haptics (on by default): `TouchHaptics` mounts in `prefs-sync.tsx`, and a Haptics plate switch sits beside Sound in the footer on coarse pointers.
