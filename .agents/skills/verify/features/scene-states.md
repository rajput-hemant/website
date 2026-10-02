# Scene, loading and error states

Status: PARTIALLY live-verified. Last live proof: Live proof 2026-10-02 at `82ec737`, evidence `$FM_DATA/website-browser-verification/evidence/`; exercised: tier signals recorded (WebGL2 true, Apple M3 Pro via ANGLE Metal, deviceMemory 16, fine pointer desktop, coarse in Pixel 7 emulation), live canvas and `data-scene-poster=hidden` in all eleven at auto, Drawing Set scene off shows posters. NOT exercised: tier 0/no-WebGL profile, step-down, context loss, lazy-load chunk list, pause. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (entries tagged `scene`).

Every 3D scene is progressive enhancement. The server renders a poster (`[data-scene-poster]`) that holds the slot's box; the shared hook `useSceneMount` (`components/semantic/scene/use-scene-mount.ts`) picks a tier from `lib/scene/tier.ts` (0 off, 1 low, 2 full), loads the edition's scene chunk only once the slot is within 200px of the viewport and the page is idle, mounts the scene on a shared session canvas, and hides the poster when a frame is live (400ms fade the first time, only with motion on). Tier 0 (scene `off`, no WebGL2, `Save-Data`, `prefers-reduced-data`) never downloads three.js and keeps the poster. `html[data-scene]` is `auto`, `low` or `off`. A foreign canvas (a lab experiment) can pause the scene; the slot then shows its poster. The contract is `docs/m2-scene-spec.md`; Control Surface shares only tier detection.

## Sub-features

- `scene-poster` renders the poster server-side, reserves the slot (no layout shift) and is the only thing visible at tier 0.
- `scene-load` fetches the scene chunk lazily near the viewport, after load and idle; a slot below the fold or hidden at this breakpoint loads nothing.
- `scene-live` swaps the poster for the live frame and sets `data-scene-poster="hidden"`.
- `scene-tier` drops tier on coarse pointer or low memory, to 0 on off, no WebGL2, Save-Data or reduced data.
- `scene-pause` returns to the poster while another canvas holds the scene and resumes after.
- `scene-error` covers a scene chunk that fails to load and a lost WebGL context. An import failure is swallowed and leaves the poster (`load(...).then(start, () => {})`, `use-scene-mount.ts`). A lost context on the shared session canvas (`lib/scene/session.tsx:333`) or the plain-three scene roots of Jacquard, Flight Plan and Survey sets `tier` and `maxTier` to 0, so the posters return and the scene stays off until reload; the blit engine (`lib/scene/blit.ts:147`) instead cancels the loss and restores on `webglcontextrestored`.
- `scene-inspect` (zoom, 360 rotate) is wired for the Calibre pilot only; other editions are open work.
- `scene-nav` keeps the scene across client navigation and swaps posters without a flash.

## How to get to it (user POV)

- Load an edition's home on a desktop with WebGL2, scroll the scene slot into view, wait.
- Use Customize to set the 3D option to low or off (where the edition offers it).
- Load the same page in a phone profile, with Save-Data, or with WebGL2 disabled.
- Navigate between pages that each have a scene slot.

## Driving it with chrome-devtools-axi (authorized 2026-10-02)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving`; the browser's tier signals are recorded (WebGL2 yes or no, `deviceMemory`, pointer, `Save-Data`, reduced data). Without a GPU this feature can only reach tier 0.
- Existing coverage to cite, not duplicate: unit tests `lib/scene/__tests__` and `components/semantic/scene/__tests__` (tier rules, store, clock, loader), `e2e/lab.spec.ts` (Minimal `/lab` never loads three.js and shows the static fallback under reduced motion), axe runs in `a11y.spec.ts`. No e2e spec asserts a live scene frame.

- **Poster first.** Load an edition home with JavaScript blocked or before idle: the slot holds the poster's size. Evidence: screenshot, slot bounding box, CLS read.
- **Lazy load.** Load a page whose scene slot is below the fold. No scene chunk is requested until the slot nears the viewport. Evidence: network list before and after scrolling.
- **Go live.** On a WebGL2 browser at tier 2, the poster fades and reads `data-scene-poster="hidden"`; the canvas is present and `aria-hidden`. Evidence: attribute, screenshot.
- **Step down.** At the phone profile or with scene set to low, tier is 1 and the scene still mounts; set scene to off and the poster returns with no further frames. Evidence: `html[data-scene]`, screenshots.
- **Tier 0.** With WebGL2 unavailable, or Save-Data on, or reduced data on, no three.js chunk loads and the poster stays. Evidence: network list, screenshot.
- **Pause.** In Minimal, open `/lab/signature-field` after a page with a glyph scene and come back: the poster shows while the lab canvas holds the scene (the loader's comment says a foreign canvas pauses it; unverified for the lab), then the scene resumes. Evidence: attribute transitions.
- **Failure.** Block the scene chunk request: the page stays usable on the poster, no uncaught error overlay. Evidence: console, screenshot. Then force a context loss (`WEBGL_lose_context`) and record whether the poster returns and whether the scene stays off until reload, as the source says (ledger WEB-H6).
- **Navigation.** Move between two routes with slots: the poster swaps before paint with no layout shift. Evidence: screenshots, layout-shift entries.

## Gotchas

- `useSceneMount` reads `data-scene`, so a stale `hr.*.prefs` value from an earlier drive changes the tier. Start from an empty profile.
- Posters use `data-scene-poster`; Surface's knob and Survey's world have their own hosts and may not follow the shared poster handoff. Read each edition file's `scene` line before assuming.
- Surface and Survey scene code is mid-lane (todo.md items 6 and 7). A failure there may be an unfinished slice, not a regression; link it to the lane, not to this map.
- Do not count a canvas that exists as proof it renders: capture a pixel read or a screenshot that shows the scene.
