# M2 scene spec: the Drawing Set

The engineering contract for the persistent 3D scene. The visual source is `docs/design.md` ("Thesis": live linework) and the three.js script in `docs/mocks/drawing-set.html`.

## Subject

- A **plan chest** (8 drawers, top to bottom) and a **drafting table** to its left, drawn as live linework.
- Every object is feature edges (`EdgesGeometry`) plus a ground-coloured fill with `polygonOffset`, so back lines are hidden like a hidden-line drawing.
- There's no PBR, no lights, no shadows and no textures. The only colours are `ink`, `ground` and the `accent` redline, read from the CSS tokens.
- Canvas text: none. Every label, number and title stays in the DOM.

| Drawer | Route                 | Sheet |
| ------ | --------------------- | ----- |
| 01 (A) | `/projects`           | 01    |
| 02 (B) | `/work`               | 02    |
| 03 (C) | `/lab`                | 03    |
| 04 (D) | `/about`              | 04    |
| 05 (E) | `/now`                | 05    |
| 06 (F) | `/ask`                | 06    |
| 07 (G) | `/resume`             | 07    |
| 08     | none (404 "misfiled") | none  |

The list lives in `lib/scene/poses.ts` (`drawers`), and it has no three.js imports, so DOM code can use it.

## Files

| File                                                    | Role                                                                                                                                                |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `flavors/drawing-set/components/scene/scene-loader.tsx` | Client. `SceneLoader({ route })`: renders the host, the scene nav on home and the tilt button around the shared `useSceneMount`. In the initial JS. |
| `flavors/drawing-set/components/scene/scene-nav.tsx`    | Client. `<nav aria-label="Drawers">` callouts with roving tabindex. In the initial JS.                                                              |
| `flavors/drawing-set/components/scene/scene-root.tsx`   | Lazy chunk. `mountScene(host, tier, onReady)`: the one canvas and R3F root, the edition's pointer input, then the shared `attachScene`.             |
| `flavors/drawing-set/components/scene/world.tsx`        | Lazy chunk. The R3F scene graph and the single frame function.                                                                                      |
| `flavors/drawing-set/components/scene/linework.ts`      | `Linework`: N instances of one drawing in 2 draw calls, the shared line/fill `ShaderMaterial`s, `box()` and `polyline()` parts.                     |
| `flavors/drawing-set/components/scene/models.ts`        | Part lists: chest body, drawer, table, sheet, A4, chain segment, cards, revision cloud and triangle, tray, slip, turntable, studies.                |
| `flavors/drawing-set/lib/scene/poses.ts`                | `SceneRoute`, `drawers`, chest and table dimensions, route poses, `asSceneRoute`. No three.js.                                                      |
| `flavors/drawing-set/lib/scene/accent.ts`               | Token to linear sRGB via a probe element and a 2D canvas, plus `watchPalette`.                                                                      |
| `components/semantic/scene/use-scene-mount.ts` (shared) | The loader contract without markup: tier, deferred import, poster handoff, borrowing the canvas, tilt.                                              |
| `lib/scene/store.ts` (shared)                           | zustand vanilla store, `input`, `emit`, and `useSceneStore`. Tiny, safe in the initial JS.                                                          |
| `lib/scene/clock.ts` (shared)                           | The one clock: gsap ticker, awake rules, `tween()`, `kick()`.                                                                                       |
| `lib/scene/tier.ts` (shared)                            | `pickTier` (pure, tested) and `detectTier`. Probes WebGL2, the minimum three.js supports since r163.                                                |
| `lib/scene/dom.ts` (shared)                             | The `data-scene-*` page contract, `attachScene` (resize, visibility, first frame) and `enableTilt`.                                                 |

Imports: `three` and `@react-three/drei` by named export only (`PerformanceMonitor` is the only drei import). No detect-gpu, postprocessing or culori.

## Mounting and loading

- The Shell's `<SceneSlot route size>` renders two direct children of one positioned box: the poster, marked `data-scene-poster`, and `<SceneLoader route={route} />`.
- `SceneLoader` fills the slot (`absolute inset-0`, `data-scene-root`). Inside it:
  - a host div (`aria-hidden`, `touch-action: pan-y`) that receives the canvas;
  - an `aria-hidden` SVG for callout leaders (`data-scene-leaders`);
  - on `home`, the `SceneNav` callouts (right column on `md+`, a bottom strip on mobile);
  - on coarse pointers with motion on, a "Tilt to turn" button once the scene is live.
- **Tier first.** If the tier is T0, nothing loads and the poster stays. Otherwise, after the `load` event plus `requestIdleCallback` (timeout 2500ms; a 300ms timeout where rIC is missing), it runs `import("./scene-root")`. That's one lazy chunk, fetched once per session.
- **One persistent canvas.** `scene-root` creates a single `<canvas>` and a single R3F root (`createRoot`) the first time it's asked. Each slot then _borrows_ it: `mountScene(host)` appends the canvas to the slot's host, resizes it, binds listeners, renders one frame synchronously and calls `onReady`. The slot's cleanup detaches it without disposal. So the world, its colours and the camera survive navigations, and the camera tweens from the previous route's pose to the next.
- **Poster handoff (the `data-scene-poster` contract).**
  - The Shell marks the poster element `data-scene-poster` (empty value) as a direct child of the slot box, beside `SceneLoader`. The poster must be `aria-hidden`.
  - After the first frame, the loader sets inline `opacity: 0` and `data-scene-poster="hidden"`. The first time in a session it fades over 400ms (motion on); later slots swap instantly, because the frame was rendered before paint.
  - On T0, on context loss, on a PerformanceMonitor fallback, or on `data-scene="off"`, the loader clears the inline opacity and sets `data-scene-poster=""` again.
  - The Shell can style `[data-scene-poster="hidden"]` too (for example `visibility: hidden` after the transition), but it doesn't have to.
- A route whose slot is `none` has no loader. The canvas is detached and nothing renders.

## One clock

- `<Canvas>` isn't used. The imperative root is configured with `frameloop: "never"`, `flat: true` (no tone mapping), `alpha: true`, `antialias: tier === 2`, `powerPreference: "default"`, and the default camera (`fov 22`).
- `lib/scene/clock.ts` adds one callback to `gsap.ticker`. Each tick, it calls R3F `advance()` only when **awake**:
  - `live && visible` (attached, and the host intersects the viewport, via IntersectionObserver), and any of:
  - a scene tween is running (the counter in `tween()`, which increments on create and decrements on complete or interrupt);
  - `kick()` requested frames (resize, store changes, attach, events);
  - the frame loop reported that damped values are still converging (`settle(moving)`);
  - `window.scrollY` changed since the last tick (non-zero scroll velocity);
  - the pointer moved over the scene within the last 1.2s (`input.movedAt`).
- Otherwise **zero frames render**. A hidden tab stops rAF, and with it the ticker.
- Scene time advances by at most 1/30s per rendered frame, so waking from sleep never jumps damped values.
- Interactive values (drawers, sheets, drag, parallax) are damped in the frame loop. Route camera moves and colour changes are GSAP tweens via `tween()` (camera: 1.1s, `expo.out`, which is the `glide` curve; colour: 400ms).
- **Motion off** (`data-motion="off"`): `tween()` runs with duration 0, damping snaps, plot-in is instant, pointer parallax and tilt are ignored, and poses are set directly. Drag still works (direct manipulation) but without easing. There's no idle motion in either mode.

## Store (`lib/scene/store.ts`)

```ts
type SceneState = {
  route: SceneRoute; // set by SceneLoader
  tier: 0 | 1 | 2;
  maxTier: 0 | 1 | 2; // lowered by PerformanceMonitor, never raised
  live: boolean; // canvas attached and rendered
  visible: boolean; // slot in viewport
  hovered: string | null; // DOM item, scene nav or mesh
  focused: string | null; // scene nav keyboard focus
  active: string | null; // what the scene highlights; mirrored to DOM
  items: SceneItem[]; // [data-scene-item] in document order
  progress: number; // 0..1 through [data-scene-section], else the page
  wake: number; // clock wake counter (perf sampler reset)
  navigate: ((href: string) => void) | null; // router.push, set by SceneLoader
};
type SceneItem = { id: string; href: string | null; weight: number };
```

- `sceneStore` (vanilla), `useSceneStore(selector)` for client components, and `setHovered(id)`, `clearHovered(id)`, `setFocused(id)`.
- `emit(event)` and `onSceneEvent(listener)`: fire-and-forget scene events. Today: `{ type: "ask:sent" }`. `emit` is a no-op until the scene has loaded.
- `input`: mutable pointer, drag and tilt values, written by DOM listeners and read by the frame loop. Never put it in React state.
- Frame code reads `sceneStore.getState()`. No React component subscribes to per-frame values.

## Page contract: data attributes (no client code needed)

`scene-root` installs these while a slot is live:

| Attribute                       | Where                                    | Effect                                                                                                                                                                                 |
| ------------------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `data-scene-item="<kind>:<id>"` | Any element: a row link, card or article | Becomes a `SceneItem` (deduped by id, document order). Pointer hover or focus inside it sets `hovered`, and leaving clears it. A MutationObserver rescans when the page's DOM changes. |
| `href` or `data-scene-href`     | Same element                             | `item.href`. Clicking that item's mesh calls `router.push(href)`. Put the attribute on the `<a>`, or add `data-scene-href` to a `<tr>`.                                                |
| `data-scene-weight="<n>"`       | Same element                             | `item.weight` (default 1). Used for role tenure in months.                                                                                                                             |
| `data-scene-section`            | One element per page                     | `progress` = `(vh - top) / (vh + height)`, clamped: 0 when the section's top enters the viewport's bottom, 1 when its bottom leaves the top. Without one, it's page scroll progress.   |
| `data-scene-active`             | Set by the scene                         | Added to every element whose `data-scene-item` equals `active`. Style it with `data-[scene-active]:text-accent` and similar. That's how scroll-driven and mesh hovers reach the DOM.   |

Kinds are conventions, not parsed: the scene uses items in order for the current route.

## Route states

Each route has a pose (camera orbit plus an open drawer) and, except home and 404, a prop group. Groups **plot in** over 900ms, with the edges drawn progressively by `drawRange` like a pen plotter, and plot out over 350ms.

| Route      | Pose                                   | Scene state                                                                                                                                                                                                                                                          | Page contract                                                                                                                          |
| ---------- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `home`     | 3/4 view of the chest                  | Chest with callouts A to G and leader lines (md+). Hovering or focusing a callout or drawer slides it out 0.55 and turns it redline. Clicking a drawer navigates. Pointer parallax.                                                                                  | Nothing. `SceneNav` is built in.                                                                                                       |
| `projects` | Drawer 01 open 1.4, camera over it     | Up to 12 sheets (border and title block) fanned out of the drawer. The hovered sheet lifts, straightens and turns redline. Clicking a sheet opens its href.                                                                                                          | Register row links: `data-scene-item="project:<slug>"` (href from the link). Order = register order.                                   |
| `project`  | Over the drafting table                | One large sheet lies on the board. The camera tilts over it with `progress` (elevation -0.45, azimuth +0.3 rad).                                                                                                                                                     | `data-scene-section` on the case-study body. Make the slot sticky inside it if the tilt should stay visible.                           |
| `work`     | Front view, drawer 02 ajar             | A vertical chain dimension beside the chest: one extruded segment per role, length ∝ weight, with end ticks. The active segment pops out in redline. Active = hovered role, else `floor(progress * n)`, so scroll scrubs. Pointer hover on a segment sets `hovered`. | Each role: `data-scene-item="role:<id>" data-scene-weight="<months>"`. `data-scene-section` on the chain. Style `data-[scene-active]`. |
| `about`    | Looking down into drawer 04 (open 1.3) | Up to 14 schedule cards stand in the drawer and riffle forward one by one as `progress` grows. The hovered card lifts in redline.                                                                                                                                    | Each schedule: `data-scene-item="schedule:<key>"`. `data-scene-section` around the schedules.                                          |
| `now`      | Drawer 05 front (open 1.6)             | 24 catalogue cards; a lean wave travels through them with `progress`. A redline revision cloud around the drawer front and a revision triangle with its leader.                                                                                                      | `data-scene-section` on the revision table. No items.                                                                                  |
| `ask`      | Over the table                         | An RFI slip tray on the board, with one slip per thread (up to 12, 5 without items). `emit({ type: "ask:sent" })` drops a new redline slip in.                                                                                                                       | Each RFI: `data-scene-item="rfi:<id>"`. The composer calls `emit` after a successful send.                                             |
| `lab`      | Above the chest top                    | A turntable on the chest with up to 6 study solids. Drag spins the turntable (not the camera), and so does `progress`. Hovering a study turns it to the camera and lifts it. Clicking opens its href.                                                                | Each study: `data-scene-item="study:<slug>"` on its link.                                                                              |
| `resume`   | Nearly top-down over the table         | An A4 sheet with ruled text lines lies on the board.                                                                                                                                                                                                                 | Needs a slot (today it's `size="none"`).                                                                                               |
| `notfound` | Into drawer 08, pulled out 1.7         | The unlabelled drawer, open and empty.                                                                                                                                                                                                                               | Nothing.                                                                                                                               |

- Poses (`lib/scene/poses.ts`): `{ target, frame, shift?, narrowShift?, az, el, fov, drawer, open, prop? }`. `az` is measured from +z towards +x, and `el` above the horizon. `frame` is the world width and height that must stay in view; `fitDistance(frame, fov, aspect, shift)` picks the camera distance for any slot aspect (with a 1.08 margin), so there's no separate mobile pose.
- **Prop stage.** A pose can carry a `prop: PropStage = { at, scale, lift? }`: it scales that route's prop group by `scale` about the world point `at`, then moves it by `lift`. Current scales: projects 1.5, work 1.1, lab 1.4, about 1.6, now 1.8, ask 1.5. `onBoard()` maps a point in the drafting table's local frame (y up from its centre plane) to world space, for props staged relative to the board.
- **Narrow-slot fit.** On slots with aspect at or below 1.2 (`WIDE_ASPECT`), the camera fits `NARROW.fit` (0.85) of the frame width instead of the full width, and slides the picture by `narrowShift` (a pose override, else `NARROW.shift` = -0.1) of the half-width via the camera's view offset, to centre an ensemble that projects right of the pivot. Tablet and desktop slots (aspect above 1.2) are unchanged: full frame width, `shift`.
- On route change: the camera tweens (1.1s glide), drag offsets reset, the old group plots out and the new one plots in. The route's own drawer slides to `open` and is redline.
- On any route, hovering another drawer slides it 0.2 and redlines it. Clicking navigates.
- **Drag:** starts after 4px, then captures the pointer. It orbits the camera around the pose target (az ±0.96, el -0.24..0.44 rad), damped. Touch drags only horizontally (`pan-y`), so pages still scroll. A drag never counts as a click (`delta > 6`).
- **Tilt:** optional. `enableTilt()` runs from the "Tilt to turn" button (a user gesture; iOS asks permission), and adds a small orbit offset. It's ignored with motion off.

## Geometry and draw calls

- `Linework` draws `count` instances of one part list in **2 draw calls**: an instanced `LineSegments` and an instanced fill `Mesh`. They share one line material and one fill material for the whole scene. Per-instance data: a `mat4` world matrix and a `hot` value 0..1 (ink to redline). Per-vertex `faint` mixes ink 55% toward ground (drawer trays, ruled lines).
- Raycasting: only proxy `InstancedMesh`es (the bounding box of each drawing, with an invisible material, so 0 draw calls). Lines and fills have `raycast` disabled. A proxy is live only when its group is more than half plotted.
- Budget: the chest, drawers and table are always 6 calls. The busiest route (lab) is 20, and a crossfade peaks near 30. **Under 60 always.**

## Colour (`lib/scene/accent.ts`)

- `readPalette()` sets a hidden probe span's `color` to `var(--color-ground | --color-ink | --color-accent)` and reads the computed value, so `light-dark()` and `--accent-hue` resolve. A 1×1 2D canvas then converts the result to sRGB bytes (it parses `oklch()` and gamut-maps), and `toLinear` turns those into linear sRGB for the uniforms.
- `watchPalette()` is a MutationObserver on `<html>` `data-theme` and `style`. When the palette really changes, the uniforms tween over 400ms (instant with motion off).

## Tiers (`lib/scene/tier.ts`)

| Tier | When                                                                                           | Config                                       |
| ---- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| T0   | `data-scene="off"`, no WebGL2, `navigator.connection.saveData`, `prefers-reduced-data: reduce` | No import. Poster only. The nav still works. |
| T1   | `data-scene="low"`, `navigator.deviceMemory <= 4`, or `(pointer: coarse)`                      | DPR 1, no antialias                          |
| T2   | Otherwise                                                                                      | DPR [1, 2], antialias                        |

- **Runtime:** drei `<PerformanceMonitor ms={200} iterations={6} onDecline>`. A decline from T2 steps down to T1 (DPR 1). A decline from T1 steps down to T0 (the canvas detaches and the poster returns). `maxTier` records it, so the tier never steps back up in the session.
- The monitor remounts on every clock wake (`wake` in the store), so sleep gaps never read as slow frames.
- WebGL context loss means T0.
- Changing the scene preference re-runs detection (`off` shows the poster at once, `low` caps DPR).

## DOM scene nav (`components/scene/scene-nav.tsx`)

- `<nav aria-label="Drawers">` with an `<ol>` of `next/link` callouts: a letter bubble (aria-hidden), a condensed-caps label, and `Sheet 0N` in mono (md+). The accessible name is "Projects Sheet 01".
- Roving tabindex: one tab stop. Arrow keys move and wrap, Home and End jump, Enter follows the link.
- Focus goes to `setFocused` and pointer enter/leave to `setHovered`/`clearHovered`. The mesh and leader read them.
- Redline styling comes from `data-on` (store), `:focus-visible` and `fine:hover`, so it works without WebGL.

## Accessibility

- The canvas, host, leaders and poster are `aria-hidden`. The nav and all page text are real DOM.
- Nothing above the fold waits for the scene. The nav and poster are server-rendered.

## Posters (M2.5)

- Unchanged in intent. A script screenshots each route's slot with the scene forced to T2 and time frozen, and writes `public/posters/<route>-<theme>-<w>.avif`.
- A `?poster` hook isn't built yet.

## Budgets

- The scene chunk is ≤ 300KB gz. Everything under `components/scene/scene-root.tsx` is the lazy chunk (three, fiber, drei `PerformanceMonitor`; gsap is shared).
- The initial JS adds only `scene-loader`, `scene-nav`, `lib/scene/store` (zustand), `poses` and `tier`.
- Draw calls < 60, as above.
