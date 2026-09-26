# M2 scene spec: the archive room

Contract for building the persistent 3D scene. See `docs/plan.md` sections 3 and 4.3 for the reasons.

## Packages (install in M2)

- `three@0.186`, `@react-three/fiber@9.8`, `@react-three/drei@10.7`
- `@pmndrs/detect-gpu@6`, `maath`, `@types/three` (dev)
- `@react-three/postprocessing@3.1` + `postprocessing@6.39`: T3 only, in their own lazy chunk (M5)

## Mounting and loading

- `<SceneSlot route size>` is a server component. It renders the poster (M1 CSS placeholder; AVIF posters in M2.5) inside a fixed-size box named `view-transition-name: scene`, plus `<SceneLoader/>` (client).
- There is one `SceneLoader` for the whole site, mounted in `app/(site)/layout.tsx` and rendered as a fixed, full-viewport layer behind content (`z-index: 0`, `pointer-events: none` except on interactive meshes via the event source).
  - The slot boxes only reserve space and mark where the scene is visible.
  - The loader tracks the current slot rect (ResizeObserver + scroll) to set camera framing and the visible region.
- `SceneLoader` decides the tier (see Tiers). Unless the tier is T0, after `requestIdleCallback` (timeout 2500ms, and only after the `load` event) it runs `import("@/components/scene/scene-root")`.
  - Once the first frame renders, the poster crossfades out over 400ms.
  - `data-scene="off"` or tier T0 means the import never happens.

## One clock

```ts
// components/scene/scene-root.tsx
<Canvas frameloop="never" dpr={tier.dpr} gl={{ antialias: tier >= T2, powerPreference: "high-performance", alpha: false }}
        eventSource={document.getElementById("scene-events")!} eventPrefix="client" camera={{ fov: 32, near: 0.1, far: 60 }}>
```

- The ticker callback in `lib/scene/clock.ts` adds to `gsap.ticker`: `if (sceneStore.getState().awake) advance(time * 1000)`.
- `awake` is true while any of these hold:
  - a GSAP tween targets scene objects (tracked with a counter via `onStart`/`onComplete` helpers in `lib/scene/tween.ts`)
  - the pointer moved within the last 1.2s (`pointer.movedAt`)
  - scroll velocity is non-zero
  - an idle ambient animation is enabled (T2+, and only when motion is on)
- Otherwise zero frames render.
- The tab being hidden pauses naturally because rAF stops.

## Store (`lib/scene/store.ts`, zustand vanilla + a React hook)

```ts
type SceneRoute =
  | "home"
  | "projects"
  | "project"
  | "work"
  | "about"
  | "now"
  | "ask"
  | "lab"
  | "resume"
  | "notfound";
type Tier = 0 | 1 | 2 | 3;
type SceneState = {
  route: SceneRoute;
  slug?: string; // set by <SceneSlot> via a tiny client effect
  tier: Tier;
  ready: boolean;
  awake: boolean;
  hovered: string | null; // object id, e.g. "drawer:projects"
  focused: string | null; // mirrored from the DOM scene nav
  setRoute(route, slug?): void;
  setHovered(id): void;
  setFocused(id): void;
};
```

Frame code reads `sceneStore.getState()` and never subscribes React components to per-frame values.

## Route poses (`lib/scene/poses.ts`)

- Each pose is `{ position: [x,y,z], target: [x,y,z], fov?, dim: 0..1, drawer?: string }`.
- There is one pose per route, plus a `mobile` override where framing differs (portrait).
- On a route change, `camera-rig.tsx` tweens the rig position and target:
  - GSAP, 1.1s, ease "glide", `overwrite: "auto"`
  - if a drawer is named, it slides out 0.35m at the same time
  - `dim` tweens `uDim` on the palette material and the lamp intensity
- Motion off: poses are set directly, and the poster-style crossfade is handled by the loader.
- Drawer map:

| Drawer | Route                                           |
| ------ | ----------------------------------------------- |
| 01     | projects                                        |
| 02     | experience (/work)                              |
| 03     | now + log                                       |
| 04     | about                                           |
| 05     | lab                                             |
| 06     | ask (reference desk slip tray, separate object) |
| 07     | resume folio (on the table)                     |

## Scene graph (`components/scene/archive/*`)

- `Room`: floor and back wall (merged geometry, vertex colours), window with blinds (instanced slats) and a moonlight gobo via a spotlight with a blind `map`.
- `PlanChest`: body plus 8 `Drawer`s (instanced fronts where possible). Each has a brass label holder, a drei `<Text>` label (troika, aria-hidden) and a pull handle. Interactive proxy box for raycasting; all other meshes `raycast={() => null}`.
- `CardCatalogue`: body plus an instanced card stack (up to 64 instances). The drawer for `/now` riffles by scroll.
- `ReadingTable` + `Lamp`:
  - The lamp is a spot light with shadow only on T2+, plus an emissive shade whose inner is tinted by `uAccent`.
  - The pool of light is a baked radial texture on the table.
- `SpecimenBox` (projects): lidded box and instanced boxes in drawer 01. The lid opens on hover; click lifts it to the table and navigates.
- `Dust` (T2+): about 300 points in the lamp cone, additive, drifting in the vertex shader.

## Materials and colour (`components/scene/materials/*`, `components/shaders/*`)

- **`paletteMaterial`**: one `MeshStandardMaterial` with `onBeforeCompile`.
  - Samples a 64x1 palette texture by a per-vertex `paletteIndex` attribute.
  - Mixes `uAccent` into accent slots.
  - Theme is `uNight` (0..1), and `uDim` dims for reading pages.
  - The accent hue comes from `--accent-hue`: `lib/scene/accent.ts` converts OKLCH to linear sRGB with `culori` or a small verified conversion.
  - Theme and accent changes tween the uniforms over 400ms.
- **`paperMaterial`**: slight subsurface-ish wrap lighting plus a grain normal (KTX2 512²).
- **`brassMaterial`**: `MeshStandardMaterial`, metalness 0.9, roughness 0.35, env from a tiny procedural `RoomEnvironment` PMREM (no HDRI).
- **Shader modules:** `components/shaders/<name>.ts` export `/* glsl */` strings. Shared chunks live in `components/shaders/chunks/` (noise, palette, dither).

## Tiers (`components/scene/quality/tier.ts`)

- **Inputs:**
  - `getGPUTier()` from @pmndrs/detect-gpu, with its benchmark data self-hosted in `public/detect-gpu/` so the scene makes no third-party request (CSP)
  - WebGL2 support (`canvas.getContext("webgl2")`)
  - `navigator.connection?.saveData`
  - `matchMedia("(prefers-reduced-data: reduce)")`
  - `deviceMemory`, `hardwareConcurrency`
  - the `data-scene` pref (`low` caps at T1, `off` forces T0)
- **Mapping:**
  - No WebGL2, saveData, reduced data, or GPU tier 0: **T0**
  - Mobile GPU tier 1, or deviceMemory ≤ 4: **T1**
  - Mobile tier 2-3, or desktop tier 1-2: **T2**
  - Desktop tier 3: **T3**
- **Per tier:**

| Tier | DPR      | Shadows                                                   | Extras                                     |
| ---- | -------- | --------------------------------------------------------- | ------------------------------------------ |
| T1   | [1, 1]   | baked                                                     | none                                       |
| T2   | [1, 1.5] | lamp shadow map 1024, static (`BakeShadows` after settle) | dust                                       |
| T3   | [1, 2]   | contact shadows                                           | dust, postprocessing (M5), trail/lens (M5) |

- **Runtime:** drei `<PerformanceMonitor onDecline={stepDown} flipflops={2} onFallback={() => setTier(1)}>`. The tier never steps up mid-session.

## DOM scene nav

- `components/scene/scene-nav.tsx` is a real `<nav aria-label="Archive">` list of drawer links, styled as brass label holders along the bottom edge of hero/window slots.
- Roving tabindex with arrow keys; Enter follows the link.
- `focus`/`hover` → `setFocused`/`setHovered`, which the mesh reads to highlight. Mesh click → the same `router.push(href)`.
- It works without WebGL: it is simply the drawer strip over the poster.

## Posters (M2.5, `scripts/posters.ts`)

- Playwright (Chromium with SwiftShader) opens `/?poster=<route>&theme=<t>`.
- The loader then forces the tier to T2, freezes time, renders the pose and signals `window.__posterReady`.
- The script screenshots the slot region and encodes AVIF at 1600w and 800w with `sharp` into `public/posters/<route>-<theme>-<w>.avif`.
- Committed to the repo and regenerated when the scene changes.

## Budgets (checked in M2)

- Scene chunk ≤ 300KB gz.
- First-view assets ≤ 400KB.
- Draw calls < 100 (T1 < 50). Verified via a `?debug` overlay (drei `StatsGl` + `renderer.info`).
