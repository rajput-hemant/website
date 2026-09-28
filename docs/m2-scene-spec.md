# M2 scene spec: the Drawing Set

Last verified: 2026-09-27 at `b50faeb`.

The shared parts (loader hook, store, clock, tiers, DOM contract) also serve Timetable, Field Survey and Press Proof; see [flavors.md](flavors.md) for which edition uses what. Everything else here is the Drawing Set's own scene.

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

The list lives in `flavors/drawing-set/lib/scene/poses.ts` (`drawers`), and it has no three.js imports, so DOM code can use it.

## Files

| File                                                                          | Role                                                                                                                                                                                                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `flavors/drawing-set/components/scene/scene-loader.tsx`                       | Client. `SceneLoader({ route, callouts })`: renders the host, the scene nav on home (with `callouts` meta) and the tilt button around the shared `useSceneMount`. In the initial JS.                                                                               |
| `flavors/drawing-set/components/scene/scene-nav.tsx`                          | Client. `<nav aria-label="Drawers">` callouts with roving tabindex. In the initial JS.                                                                                                                                                                             |
| `flavors/drawing-set/components/scene/scene-root.tsx`                         | Lazy chunk. `mountScene(host, tier, onReady)`: the one canvas and R3F root, the edition's pointer input, then the shared `attachScene`.                                                                                                                            |
| `flavors/drawing-set/components/scene/world.tsx`                              | Lazy chunk. The R3F scene graph and the single frame function.                                                                                                                                                                                                     |
| `flavors/drawing-set/components/scene/linework.ts`                            | `Linework`: N instances of one drawing in 2 draw calls, the shared line/fill `ShaderMaterial`s, `box()` and `polyline()` parts.                                                                                                                                    |
| `flavors/drawing-set/components/scene/models.ts`                              | Part lists: chest body, drawer, table, sheet, A4, chain segment, cards, revision cloud and triangle, tray, slip, turntable, studies.                                                                                                                               |
| `flavors/drawing-set/lib/scene/poses.ts`                                      | `SceneRoute`, `drawers`, chest and table dimensions, route poses, `asSceneRoute`. No three.js.                                                                                                                                                                     |
| `flavors/drawing-set/lib/scene/accent.ts`                                     | Token to linear sRGB via a probe element and a 2D canvas, plus `watchPalette`.                                                                                                                                                                                     |
| `components/semantic/scene/use-scene-mount.ts` (shared)                       | The loader contract without markup: tier, deferred import, poster handoff, borrowing the canvas, tilt.                                                                                                                                                             |
| `lib/scene/store.ts` (shared)                                                 | zustand vanilla store, `input`, `emit`, and `useSceneStore`. Tiny, safe in the initial JS.                                                                                                                                                                         |
| `lib/scene/clock.ts` (shared)                                                 | The one clock: gsap ticker, awake rules, `tween()`, `kick()`.                                                                                                                                                                                                      |
| `lib/scene/tier.ts` (shared)                                                  | `pickTier` (pure, tested) and `detectTier`. Probes WebGL2, the minimum three.js supports since r163.                                                                                                                                                               |
| `lib/scene/dom.ts` (shared)                                                   | The `data-scene-*` page contract, `attachScene` (resize, visibility, first frame) and `enableTilt`.                                                                                                                                                                |
| `lib/scene/session.tsx` (shared)                                              | `createSessionScene`: the one-canvas R3F session root. Slot mode (the canvas lent to the slot) or viewport mode (one fixed canvas, drei `View`s). Press Proof and Timetable use it in viewport mode; the Drawing Set still keeps its own root in `scene-root.tsx`. |
| `lib/scene/views.ts` (shared)                                                 | Viewport mode's DOM side: `trackViews` (view 0 plus `[data-scene-view]` placeholders, one IntersectionObserver each, the 4-view cap), `viewStore`, `markViewReady`. No three.js.                                                                                   |
| `lib/scene/blit.ts`, `lib/scene/frame-loop.ts` (shared)                       | Blit glyphs for plain three.js editions (no R3F): `createBlit`, `glRenderer`, `BLIT_GLYPHS`, and the settle-on-rest rAF loop it runs on.                                                                                                                           |
| `lib/scene/poster.ts`, `lib/scene/budget.ts` (shared)                         | The poster handoff (`showPoster`, `postersOf`, dependency-free) and the per-page budgets (`SCENE_BUDGET`, `frameStats`, `recordFrame`, `overBudget`).                                                                                                              |
| `lib/scene/colors.ts`, `components/semantic/scene/scene-monitor.tsx` (shared) | Token colours and the tier step-down monitor.                                                                                                                                                                                                                      |

Imports: `three` and `@react-three/drei` by named export only. No detect-gpu, postprocessing or culori.

**drei allowance (amended 2026-09-27, slice S2):** `PerformanceMonitor`, `View` (and `View.Port`), `PerspectiveCamera` and `OrthographicCamera`, `Instances` and `Merged`, `Edges`, `Line` and `QuadraticBezierLine`, `RoundedBox`, and `Hud`. Still excluded: `Text`, `Text3D` and `Html` (no canvas text, see "Subject"), and `Float` (no idle motion, see "One clock"). Anything else needs another amendment here.

## Mounting and loading

- The Shell's `<SceneSlot route size>` renders two direct children of one positioned box: the poster, marked `data-scene-poster`, and `<SceneLoader route={route} />`.
- `SceneLoader` fills the slot (`absolute inset-0`, `data-scene-root`). Inside it:
  - a host div (`aria-hidden`, `touch-action: pan-y`) that receives the canvas;
  - an `aria-hidden` SVG for callout leaders (`data-scene-leaders`);
  - on `home`, the `SceneNav` callouts (right column on `md+`, a bottom strip on mobile);
  - on coarse pointers with motion on, a "Tilt to turn" button once the scene is live.
- **Tier first.** If the tier is T0, nothing loads and the poster stays. Otherwise, once the host comes within 200px of the viewport (an IntersectionObserver with `rootMargin: "200px"`, so a slot below the fold or hidden at this breakpoint loads nothing), and after the `load` event plus `requestIdleCallback` (timeout 2500ms; a 300ms timeout where rIC is missing), it runs `import("./scene-root")`. Once the chunk is in, later slots mount synchronously. That's one lazy chunk, fetched once per session.
- **One persistent canvas.** `scene-root` creates a single `<canvas>` and a single R3F root (`createRoot`) the first time it's asked. Each slot then _borrows_ it: `mountScene(host)` appends the canvas to the slot's host, resizes it, binds listeners, renders one frame synchronously and calls `onReady`. The slot's cleanup detaches it without disposal. So the world, its colours and the camera survive navigations, and the camera tweens from the previous route's pose to the next.
- **Poster handoff (the `data-scene-poster` contract).**
  - The Shell marks the poster element `data-scene-poster` (empty value) as a direct child of the slot box, beside `SceneLoader`. The poster must be `aria-hidden`.
  - After the first frame, the loader sets inline `opacity: 0` and `data-scene-poster="hidden"`. The first time in a session it fades over 400ms (motion on); later slots swap instantly, because the frame was rendered before paint.
  - On T0, on context loss, on a PerformanceMonitor fallback, or on `data-scene="off"`, the loader clears the inline opacity and sets `data-scene-poster=""` again.
  - The Shell can style `[data-scene-poster="hidden"]` too (for example `visibility: hidden` after the transition), but it doesn't have to.
- A route whose slot is `none` has no loader. The canvas is detached and nothing renders.

## Viewport mode (tracked views, slice S2)

`createSessionScene({ ..., viewport: { zIndex, views } })` switches the session from lending its canvas to the slot to drawing every scene on one canvas fixed over the viewport. Without `viewport`, slot mode is unchanged.

- **Resolution.** The viewport canvas fills the whole screen, so it defaults to DPR 1 at T1 and `[1, 1.25]` at T2, and below 768px it renders at DPR 1 without MSAA unless the edition passes `antialias: "always"` (`lib/scene/session.tsx`).

```ts
type SessionSceneOptions = {
  world: () => React.ReactNode; // the slot's scene: view 0, on the root camera
  camera: { fov: number; position?: [number, number, number] };
  clipping?: boolean;
  dpr?: Record<1 | 2, Dpr>; // default { 1: 1, 2: [1, 1.5] }
  antialias?: "t2" | "always"; // default "t2"
  viewport?: {
    zIndex: number; // below the edition's chrome, above its page backgrounds
    views?: Record<string, () => React.ReactNode>; // by data-scene-view id
  };
} & ({ drag: DragBounds } | { bindInput: (host: HTMLElement) => () => void });
```

- **Canvas.** Appended to `<body>`: `position: fixed; inset: 0; pointer-events: none; aria-hidden`, at the edition's `zIndex`, sized to the layout viewport (`documentElement.clientWidth/Height`, resized on `resize`). It's `visibility: hidden` and cleared whenever no slot is attached. Press uses `10` (over the stock, under the header at 20 and the frame at 40); Minimal should use `-1`. Anything inside a slot that must paint over the scene (Press's tilt button) needs a z-index above it.
- **Views.** The root renders `<View.Port />` and one drei `View` per tracked element. View 0 tracks the slot host the loader passes to `mountScene` and renders `world()` on the root camera (drei sets its aspect per view). Every `[data-scene-view="<id>"]` element whose id is a key of `views` becomes another `View`, in document order, rendering `views[id]()` in its own scene. Give it its own camera: drei `<PerspectiveCamera makeDefault />` or `<OrthographicCamera makeDefault />` inside the view.
- **Budget.** At most `SCENE_BUDGET.views` (4) live views per page, the slot included. Placeholders past the cap, or with an id the edition has no view for, keep their posters.
- **Visibility and frames.** One IntersectionObserver per view (`rootMargin: "100px 0px"`, so a view scrolled in is drawn before its first pixels show). `visible` in the store is "any view in range". Each `View` gets `frames={Infinity}` (its rect re-read every frame) only while in range, `0` otherwise. Because the canvas is fixed, the clock's existing scroll wake redraws while a view is in range; when the last view leaves, one more frame clears the canvas and the clock sleeps. A `ResizeObserver` on `<body>` kicks one frame when content moves a view without a scroll; one on each view re-reads its size a frame later.
- **Input.** Unchanged: the canvas never takes pointer events. The slot host gets the edition's `drag` or `bindInput`, `data-scene-item` hover and focus set `hovered`, and `emit()` carries events. A placeholder that needs pointer input binds it on the placeholder element from the edition's view code.
- **Frame.** Each rendered frame clears the whole canvas, resets `gl.info` (with `autoReset` off, so it sums every view's pass), runs `advance()`, and records `frameStats` (calls, triangles, views, frame count). Development builds warn once per budget a frame breaks (`overBudget`).
- **First frame.** View 0's content mounts a task after the root is created, so the first slot hands its poster over when view 0 has mounted and drawn; later slots reuse the mounted view 0 and hand over synchronously, before paint, as in slot mode. View-list updates go through R3F's `flushSync`, so a new slot is drawn in the same task.
- **Posters.** Each placeholder server-renders its own poster as a direct child marked `data-scene-poster` (aria-hidden, with the placeholder holding its box, so CLS stays 0). Once a placeholder's view has mounted and drawn a frame, the placeholder gets `data-scene-live` and its posters fade out (400ms on `--ease-enter`, motion on) to `data-scene-poster="hidden"`. `<html data-scene-live>` is set while the session canvas is live. On T0 nothing loads and every poster stays.
- **Pause.** `pauseScene()` (in `lib/scene/store.ts`, safe in any chunk) returns a release. While any hold is out, the clock renders nothing and `useSceneMount` hands the slot back to its poster (the placeholders follow); the last release remounts. It's for a foreign canvas such as a lab `CanvasStage` (slice S4); nothing calls it yet.

How an edition adds a view:

```tsx
// scene-root.tsx (the lazy chunk)
export const { mountScene, enableTilt } = createSessionScene({
  world: () => <World />,
  camera: { fov: 30, position: [2.4, 3.1, 6.2] },
  drag: { x: [-260, 260], y: [-160, 160] },
  viewport: {
    zIndex: 10,
    views: { loupe: () => <Loupe /> }, // <Loupe> renders its own makeDefault camera
  },
});

// On the page (server component): the box, its poster, no client code.
<div data-scene-view="loupe" className="relative aspect-square w-40">
  <div data-scene-poster aria-hidden className="absolute inset-0">
    <LoupePoster />
  </div>
</div>;
```

### Moving the Drawing Set onto the session

Timetable has moved (camera `{ fov: 26, position: [0, 0, 12] }`, its own `bindInput` for the rod ring, `viewport: { zIndex: 10 }`, the tilt button at z-20, the shared `SceneMonitor`, viewport DPR defaults). The Drawing Set keeps a copy of `createSessionScene` in `flavors/drawing-set/components/scene/scene-root.tsx`. To move it, follow these steps (written for both):

1. Replace `scene-root.tsx`'s body with one `createSessionScene` call: `world: () => <World />`, the edition's camera (Drawing Set `{ fov: 22 }`, Timetable `{ fov: 26, position: [0, 0, 12] }`), `bindInput` set to the edition's own pointer function (moved as is; the Drawing Set's lab route drag and Timetable's release ring stay edition code), `dpr` (Drawing Set `{ 1: 1, 2: [1, 2] }`), and `antialias: "always"` for the Drawing Set's linework.
2. Add `viewport: { zIndex }`: below `DrawingFrame` (z-30) for the Drawing Set; below the Timetable header's layer. Check every element positioned inside the slot (scene nav, leaders SVG, tilt button) paints above the canvas, and give it a z-index if not.
3. In `world.tsx`, read the size from `state.size` inside `useFrame` (it's the view's rect in viewport mode) rather than the root canvas, and let drei set the camera aspect; drop any `gl.render` call (views render themselves).
4. The Drawing Set keeps its own `PerformanceMonitor` or switches to the shared `SceneMonitor`; either works inside view 0.
5. Check: the edition's scene tests, posters on T0, a browser pass on home and one inner page (same look, 0 idle frames), then add views with `views` and `[data-scene-view]` placeholders.

## Blit glyphs (plain three.js, slice S3)

For glyph-sized, event-driven objects in editions that don't ship R3F (Surface, Survey; optional elsewhere). Large, scroll-scrubbed objects, or ones that fly across two DOM regions, use viewport mode instead. `lib/scene/blit.ts` never imports an edition; editions pass their glyphs (and, if they want, a renderer) in.

```ts
type Glyph<R extends BlitRenderer = BlitRenderer> = {
  scene: Object3D;
  camera: Camera;
  setup?(renderer: R): void; // once per renderer: first meeting, and again after a context restore
  paint?(): void; // re-read colour tokens (runs on attach and on data-theme / data-motion)
  step(dt: number): boolean; // advance springs, pose the scene; whether it still moves
};
type GlyphOptions = {
  tier: Tier;
  onLost: () => void; // show the poster
  onRestored?: () => void; // context back and drawn again: hide the poster
};

const blit = createBlit(glRenderer); // one per session, at module scope in the lazy chunk
blit.register(canvas, glyph, options); // draw into the page's own in-flow <canvas>
blit.attach(host, glyph, options); // or: append an aria-hidden canvas filling `host`
blit.kick(glyph); // mark dirty (hover, toggle, data change); no argument: every glyph
// register and attach return the cleanup; attach's also removes its canvas.
```

- **Renderer.** `createBlit(createRenderer)` makes one off-screen renderer on the first live glyph, with that glyph's tier. `glRenderer(tier)` is the default `WebGLRenderer`: T2 antialiased at DPR up to 2, T1 at DPR 1 without, alpha, sRGB output. Anything shaped like `BlitRenderer` works (tests pass a double). One WebGL context per engine, so one per page.
- **Blit.** A dirty glyph is stepped, rendered into the bottom-left corner of the GL canvas (`setViewport` + `setScissor`; the canvas is sized to the largest mounted glyph when glyphs mount, detach or resize, never per frame, and shrinks once it holds over twice the pixels needed; a glyph's backing store is capped at `BLIT_MAX_SIDE`, 1024 device pixels a side) and copied into each visible 2D canvas that shows it with `drawImage`, in the same task, so `preserveDrawingBuffer` stays off. A glyph renders once per frame while `step` returns true, then drops out of the dirty set; a clean glyph renders nothing.
- **Frames.** The loop (`frame-loop.ts`) runs rAF only while a dirty glyph is on screen: zero idle frames, and no redraw on scroll, since the 2D canvases scroll with the page like images. One IntersectionObserver per canvas skips glyphs off screen (a kick wakes them when they come back); one ResizeObserver sizes the backing store to the CSS box times the renderer's DPR and redraws.
- **First frame.** `register`/`attach` step and draw synchronously, so the canvas is never blank when it shows. Hand the poster over right after the call returns.
- **Posters and fallback.** Server-render the glyph's poster (SVG or CSS, `aria-hidden`, holding the box so CLS stays 0), load the glyph chunk only when `detectTier()` is not T0, and bring the poster back in `onLost`. `onLost` runs (in a microtask, after the caller mounts) at T0, without a 2D context, over the budget, or for every glyph when the GL context is lost (their canvases are cleared); glyphs mounted while it is lost mount on their posters. The engine cancels the loss so the browser can restore the context; on `webglcontextrestored` it disposes the old renderer, makes a new one at the same tier, runs every glyph's `setup` and `paint` again, redraws each glyph still mounted and calls its `onRestored`. So `onLost` only swaps to the poster; keep the glyph mounted until the cleanup.
- **Budget.** At most `BLIT_GLYPHS` (`SCENE_BUDGET.views`, 4) canvases per engine; a fifth gets `onLost` (and a development warning) until one detaches. Each pass (a frame, or a first paint) sums `renderer.info.render` over its draws into `frameStats` via `recordFrame` and warns in development over 60 draw calls.
- **Tests.** `lib/scene/__tests__/blit.test.ts`: a dirty glyph renders once and a clean one none, settling stops rAF, off-screen canvases skip, context loss and T0 fall back, a restore recreates the renderer and brings mounted glyphs back, the cap, the budget record, the bottom-left copy, and the GL canvas shrinking, never reallocating per frame and capping at `BLIT_MAX_SIDE`.

Surface's bench (`flavors/surface/components/scene/bench.ts`) is this engine under Surface's names (`createBench`, `Instrument`); the knob is its first glyph. Field Survey's condition monuments (`flavors/survey/components/scene/glyphs/`) run on their own engine beside the relief's session canvas.

## One clock

- `<Canvas>` isn't used. The imperative root is configured with `frameloop: "never"`, `flat: true` (no tone mapping), `alpha: true`, `antialias: true` at every tier (the linework is all 1px edges, which break up without MSAA), `powerPreference: "default"`, and a camera with `fov 22`, `near 0.1`, `far 80`.
- `lib/scene/clock.ts` adds one callback to `gsap.ticker`. Each tick, it calls R3F `advance()` only when **awake**:
  - `live && visible && !paused` (attached, the host, or in viewport mode any view, intersects the viewport via IntersectionObserver, and no `pauseScene()` hold is out), and any of:
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
  route: string; // set by SceneLoader; the world narrows it with asSceneRoute
  tier: 0 | 1 | 2;
  maxTier: 0 | 1 | 2; // lowered by PerformanceMonitor, never raised
  live: boolean; // canvas attached and rendered
  visible: boolean; // slot in viewport (viewport mode: any view in range)
  hovered: string | null; // DOM item, scene nav or mesh
  focused: string | null; // scene nav keyboard focus
  active: string | null; // what the scene highlights; mirrored to DOM
  items: SceneItem[]; // [data-scene-item] in document order
  board: string | null; // data-scene-board on the slot (Timetable, Field Survey)
  progress: number; // 0..1 through [data-scene-section], else the page
  wake: number; // clock wake counter (perf sampler reset)
  paused: number; // pauseScene() holds; no frames and posters while > 0
  navigate: ((href: string) => void) | null; // router.push, set by SceneLoader
};
type SceneItem = {
  id: string;
  href: string | null;
  weight: number;
  label: string | null; // data-scene-label
  line: number | null; // data-scene-line
};
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
| `data-scene-label="<text>"`     | Same element                             | `item.label`. Timetable shows it on the board; the Drawing Set ignores it.                                                                                                             |
| `data-scene-line="<n>"`         | Same element                             | `item.line`, a colour slot. Timetable tints the housing stripe with it; the Drawing Set ignores it.                                                                                    |
| `data-scene-board="<text>"`     | The scene slot                           | `board`, the page's resting text or data for the scene (Timetable's board, Field Survey's relief data). The Drawing Set ignores it.                                                    |
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
| `resume`   | Nearly top-down over the table         | An A4 sheet with ruled text lines lies on the board.                                                                                                                                                                                                                 | A `band` slot: `<SceneSlot route="resume" size="band" />`.                                                                             |
| `notfound` | Into drawer 08, pulled out 1.7         | The unlabelled drawer, open and empty.                                                                                                                                                                                                                               | Nothing.                                                                                                                               |

- Poses (`flavors/drawing-set/lib/scene/poses.ts`): `{ target, frame, shift?, narrowShift?, az, el, fov, drawer, open, prop? }`. `az` is measured from +z towards +x, and `el` above the horizon. `frame` is the world width and height that must stay in view; `fitDistance(frame, fov, aspect, shift)` picks the camera distance for any slot aspect (with a 1.08 margin), so there's no separate mobile pose.
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

## Colour (`flavors/drawing-set/lib/scene/accent.ts`)

- `readPalette()` sets a hidden probe span's `color` to `var(--color-ground | --color-ink | --color-accent)` and reads the computed value, so `light-dark()` and `--accent-hue` resolve. A 1×1 2D canvas then converts the result to sRGB bytes (it parses `oklch()` and gamut-maps), and `toLinear` turns those into linear sRGB for the uniforms.
- `watchPalette()` is a MutationObserver on `<html>` `data-theme` and `style`. When the palette really changes, the uniforms tween over 400ms (instant with motion off).

## Tiers (`lib/scene/tier.ts`)

| Tier | When                                                                                           | Config                                       |
| ---- | ---------------------------------------------------------------------------------------------- | -------------------------------------------- |
| T0   | `data-scene="off"`, no WebGL2, `navigator.connection.saveData`, `prefers-reduced-data: reduce` | No import. Poster only. The nav still works. |
| T1   | `data-scene="low"`, `navigator.deviceMemory <= 4`, or `(pointer: coarse)`                      | DPR 1 (Drawing Set keeps antialias on)       |
| T2   | Otherwise                                                                                      | DPR [1, 2], antialias                        |

- **Runtime:** drei `<PerformanceMonitor ms={200} iterations={6} onDecline>`. A decline from T2 steps down to T1 (DPR 1). A decline from T1 steps down to T0 (the canvas detaches and the poster returns). `maxTier` records it, so the tier never steps back up in the session.
- The monitor remounts on every clock wake (`wake` in the store), so sleep gaps never read as slow frames.
- WebGL context loss means T0.
- Changing the scene preference re-runs detection (`off` shows the poster at once, `low` caps DPR).

## DOM scene nav (`flavors/drawing-set/components/scene/scene-nav.tsx`)

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

- The scene chunk is ≤ 300KB gz. This is a target: `scripts/check-budget.ts` measures initial JS only, so nothing checks the chunk yet. Everything under `flavors/drawing-set/components/scene/scene-root.tsx` is the lazy chunk (three, fiber, drei `PerformanceMonitor`; gsap is shared).
- The initial JS adds only `scene-loader`, `scene-nav`, `lib/scene/store` (zustand), `poses` and `tier`.
- Draw calls < 60 per frame in total, summed over every view (`SCENE_BUDGET.drawCalls`; viewport mode records each frame in `frameStats` and warns in development).
- At most 4 live views per page, the slot included (`SCENE_BUDGET.views`, enforced by `trackViews`), or 4 blit glyphs (`BLIT_GLYPHS`, enforced by `createBlit`).
- Zero frames while idle, in both modes (`lib/scene/__tests__/clock.test.ts` counts renders with a spy).
