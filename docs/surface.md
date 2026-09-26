# Design system: "Control Surface"

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

| Route         | Detents                    | Unit    |
| ------------- | -------------------------- | ------- |
| `/`           | Home and channels 01 to 04 | Channel |
| `/projects`   | every project              | Preset  |
| `/projects/x` | every project (browse)     | Preset  |
| `/work`       | every role                 | Track   |
| `/lab`        | every experiment           | Study   |
| `/about`      | manual sections            | Section |
| `/now`        | now, then each log year    | Page    |
| `/ask`        | listed conversations       | Thread  |
| `/resume`     | resume sections            | Section |

- **Turn to select, push to open.** Drag (with notched detents and soft end stops), arrow keys, Home/End and PageUp/PageDown turn it; a click or Enter opens what the detent points at. It is a real `role="slider"` with `aria-valuetext`.
- **Linked to the page.** Hovering or focusing an element with `data-knob-item="<n>"` leans the knob to it; turning the knob lights the item (`data-knob-active`) and scrolls it to the centre; scrolling the page turns the knob. `data-knob-mirror` is a second view of an item that lights up and previews but does not scroll (the multitrack on `/work`). On home, `data-channel` on the header keys and selector legends does the same.
- **Keyboard channels.** `0` to `4` anywhere switch channel (outside fields and sliders).
- **Store.** `lib/knob/store.ts` (zustand vanilla): `owner`, `count`, `index`, `preview`, `drag`, `pressed`, `tiltX`, `tiltY`. Geometry is pure and tested in `lib/knob/geometry.ts`.

## 3D (`components/knob/knob-scene.ts`)

- 3D-light on purpose: the knob is the only 3D object, because a real faceplate is printed and flat. A lathe-turned body with turning marks in its roughness map, 150 instanced knurl ribs, an inlaid signal-yellow index and a soft contact shadow, lit by a `RoomEnvironment` and one directional light. Plain three.js (no R3F): one object does not need a reconciler.
- One persistent canvas: built once per session, then borrowed by each page's knob slot, so the knob keeps its angle and turns to the new page's detent on navigation.
- **Zero idle frames.** A spring loop renders only while the angle, lean or press is settling, and not while the slot is off screen.
- Loads after `load` plus `requestIdleCallback`. Tier 0 (scene off, no WebGL2, Save-Data, reduced data) never imports it; tier 1 (low setting, 4GB or less, coarse pointer) runs at DPR 1 without antialiasing; context loss falls back to the printed knob.
- The printed SVG knob is server-rendered and always works: it turns with a sprung CSS transition and supports the same drag and keys.

## Layout

- **Home.** A full-viewport faceplate: legend row, the headline as the h1, the channel selector, and a strip of modules (readout LCD with CH, since, projects and roles, a status module with the copyable email, the rating plate). Then the multitrack (experience, linking to `/work`), preset bank A (four selected projects), and the Now and Ask modules.
- **Inner pages** (`components/site/panel.tsx`). Legend row, h1, lede and readouts on the left 8 columns; the knob module in the right 4, sticky on wide screens. On phones the knob sits beside its LCD under the header.
- **Header.** "Hemant Rajput" with the HR-26 badge, channel keys 01 to 04 with lamps, Resume, ⌘K, and the Edition and Motion switches. Keys drop to a second row on phones.
- **Footer (rear panel).** Auxiliary channels (Now, Ask, Resume, RSS), the visit counter as six seven-segment digits, the Service switches (3D knob, detent clicks) and the serial line with Change edition.
- The edition has `/about` and redirects `/changelog` to `/now#log`. Unknown paths render "No signal on this channel".

## Motion

- Sprung detents with slight overshoot (knob and CSS), 150ms lamp fades, a 1.8s pulse only for work in progress, 80ms key presses, a short fade on route change.
- The Motion switch (or the OS setting) stops all of it: the knob snaps, lamps stop pulsing, scrolling is instant.
- Detent clicks (off by default) use the shared synthesised tick in `lib/sound.ts`.

## Shared code it uses

Data (`lib/data`), metadata, format, the ask client and page loaders (`lib/ask`), command core (`lib/command`), prefs store factory (`lib/prefs/store.ts`), resume loader (`lib/resume/load.ts`), lab core (`lib/lab`, `components/semantic/lab`), and the headless hooks in `components/semantic` (visitor count, copy email, root data, ask owner and pending echoes).
