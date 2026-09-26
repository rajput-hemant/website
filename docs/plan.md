# Phase 2 plan: "The Night Archive" 3D portfolio

Status: awaiting your approval. Milestone 0 (backend port) is already running, since it doesn't depend on any design decision.

Branch `portfolio-3d` (from `master`), worktree `~/Projects/NextJS/website-3d`. Reference branch `claude/serene-hawking-jxyjn0` stays untouched and is only read.

---

## 1. Concept and creative direction

### 1.1 The idea

A nocturnal reading room at the back of an archive:

- A wide plan chest (a flat-file cabinet of shallow drawers).
- A card catalogue beside it.
- A reading table under a single lamp.

Each section of the site is something kept in the archive. You pull it out, carry it to the table and read it. The site is literally records (work history, changelog, education, resume), so the metaphor maps 1:1 onto your content instead of being decoration.

Why this concept and not the others I researched:

- **Desk/workbench:** rejected. It drifts into the "isometric bedroom / neon desk" cliché (Sooah's Room, 3D Cyber Room).
- **Miniature city:** rejected. It is high perf risk on phones and too close to Bruno Simon / Messenger.
- **The archive:** built from boxes, rounded boxes, thin planes and instanced cards. It is the cheapest literal scene to build from primitives and the lowest risk on a mid-range phone.

### 1.2 What each reference contributes

| Reference                                                                                                        | Award                                  | What we take                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| [Igloo Inc](https://www.igloo.inc) (abeto)                                                                       | SOTD 23 Jul 2024, dev 9.6              | One contained exhibit per project (our specimen boxes); cheap WebGL text scramble                                                                     |
| [Cartier Watches & Wonders 2026](https://www.awwwards.com/sites/cartier-watches-wonders-2026) (Immersive Garden) | SOTD 25 May 2026                       | Calm alcove-per-item pacing; subtle cursor-shifted reflections; hidden gestures that reward curiosity                                                 |
| [Wildy Riftian](https://www.wildyriftian.com)                                                                    | SOTD 12 Sep 2025                       | Archive metaphor, tactile paper, folders and card flips; dedicated mobile layout                                                                      |
| [Henry Heffernan](https://henryheffernan.com)                                                                    | Three.js Journey selection             | Real DOM content on an in-scene surface: text stays real, readable, indexable                                                                         |
| [Bruno Simon](https://bruno-simon.com)                                                                           | SOTD 21 Jan 2026                       | One palette texture colours every model, so re-tinting the visitor accent is one texture/uniform swap; phone quality preset. Also a warning: a11y 6.6 |
| [Messenger](https://messenger.abeto.co) (abeto)                                                                  | SOTD 10 Nov 2025                       | 16x16 colour atlas; aggressive memory hygiene for iOS Safari                                                                                          |
| [Jordan Breton](https://jordan-breton.com)                                                                       | HM 10 Oct 2025, FWA                    | Fixed camera stops with limited free-look (our clamped orbit)                                                                                         |
| [Sébastien Lempens](https://sebastien-lempens.com)                                                               | SOTD 29 Mar 2024                       | Scroll-driven camera path for linear history (our Work drawer)                                                                                        |
| [Gil Huybrecht](https://gilhuybrecht.com)                                                                        | SOTD 21 Sep 2026                       | Dark two-tone editorial palette; DOM-synced WebGL image distortion                                                                                    |
| [Hubtown](https://hubtown.co.in) (Unseen)                                                                        | SOTD 10 Jun 2026                       | Cursor "reveal" mask (our 404 and hero lamp-light reveal)                                                                                             |
| [Oryzo](https://oryzo.ai) (Lusion)                                                                               | SOTD 13 Apr 2026                       | A single object as the interface; cursor-pushed particles; 3D-to-2D handoff                                                                           |
| [Chipsa](https://chipsa.design)                                                                                  | SOTD + Dev 30 Sep 2025 (Next.js + R3F) | Materials that respond to pointer and click, proven on our exact stack                                                                                |
| [Lusion v3](https://www.awwwards.com/sites/lusion-v3)                                                            | SOTD Oct 2023, dev animations 10       | The cursor benchmark                                                                                                                                  |
| [Boc.Studio](https://boc.studio)                                                                                 | SOTD 19 Sep 2026 (Framer)              | Proof that CSS alone carries most micro-interactions                                                                                                  |

### 1.3 Mood board

- **Materials:** dark oiled walnut, oxidised brass label holders, green-grey steel of the plan chest.
- **Paper:** cream archival stock, recycled grey board, index cards with a red top rule.
- **Light:** a warm pool from a single lamp, cool moonlight through tall window blinds, dust motes in the lamp cone.
- **Typography:** museum labels and catalogue cards, with Swiss-precision mono metadata.
- **Feel:** Dieter Rams restraint. Nothing glossy, nothing neon.
- **Light theme:** the same room by day. Blinds open, lamp off, paper brightest.

### 1.4 Palette (OKLCH, tokens on `:root`)

| Token        | Dark (night)            | Light (day)      | Use                                                |
| ------------ | ----------------------- | ---------------- | -------------------------------------------------- |
| `--ink`      | `0.16 0.012 262`        | `0.975 0.008 85` | page ground                                        |
| `--paper`    | `0.93 0.012 85`         | `0.21 0.012 65`  | primary text                                       |
| `--graphite` | `0.72 0.012 80`         | `0.45 0.014 65`  | secondary text (AA on ground)                      |
| `--rule`     | `0.29 0.014 262`        | `0.885 0.011 80` | hairlines                                          |
| `--lamp`     | `0.82 0.09 75`          | `0.80 0.07 80`   | warm highlight, lamp tint                          |
| `--moon`     | `0.62 0.05 250`         | `0.75 0.03 240`  | cool fill light                                    |
| `--accent`   | `L C var(--accent-hue)` | per theme        | visitor-picked; also fed to the scene as `uAccent` |

The accent hue drives one CSS variable plus one scene uniform. It tints label holders, card rules, the lamp inner shade and focus rings. Contrast is validated per hue, as the current site already does.

### 1.5 Type

- **Display:** Fraunces, variable, with `opsz` + `SOFT`. This is the thread from your current site. Used for headings and case-study titles. Optical size swings with the scale.
- **Text/UI:** Geist, variable. Neutral, very legible at 15-17px, and a clean contrast to Fraunces.
- **Catalogue labels:** Geist Mono, for metadata, dates, card numbers, kbd hints and cursor labels.
- **Loading:** all three through `next/font`. At most 3 preloaded woff2 files, 120 KB total. Italic loads on demand, as now.

Scale is fluid, a major third (1.25) on a 17px body:

| Step    | Size                                   |
| ------- | -------------------------------------- |
| mono-xs | 11                                     |
| sm      | 14                                     |
| body    | 17                                     |
| lg      | 21                                     |
| xl      | 26.5                                   |
| 2xl     | 33                                     |
| 3xl     | 41.5                                   |
| display | `clamp(2.75rem, 1.6rem + 4.8vw, 6rem)` |

Measure is 62-68ch for prose, with tabular numerals for dates.

### 1.6 Motion principles

1. **Archival physics.** Heavy things (drawers, the camera) glide on runners: 700-1200 ms, `power3.out`. Light things (paper, cards) are quick and springy: 180-320 ms. Nothing bounces except paper.
2. **Never block.** Every animation is interruptible (`overwrite: "auto"`, `quickTo`). Content never waits for the camera, and the first-visit intro never delays LCP.
3. **Compositor only in the DOM.** Animate transform, opacity, filter. No layout properties.
4. **Light before movement.** Under reduced motion, feedback becomes changes in light and colour, not position.
5. **One easing family.** Custom eases `archive-glide`, `paper-flick` and `ui-enter` are defined once, as CSS `linear()` and matching GSAP CustomEase.
6. **Duration tokens:**

| Token     | Range       |
| --------- | ----------- |
| press     | 120 ms      |
| ui        | 220-320 ms  |
| route-out | 180 ms      |
| route-in  | 260 ms      |
| camera    | 900-1200 ms |

---

## 2. Information architecture

### 2.1 Sitemap

| Route                                                   | Purpose                                                      | Scene state                                                      |
| ------------------------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| `/`                                                     | Intro, 3 featured projects, now snippet, latest Ask thread   | Whole room, three-quarter view; scroll dollies along the cabinet |
| `/projects`                                             | Featured cards + archive table (year, project, stack, links) | Specimen-box drawer pulled out                                   |
| `/projects/[slug]`                                      | Case study (new)                                             | The box lifted to the reading table, top-down, scene dimmed      |
| `/work` (labelled "Experience")                         | Timeline                                                     | Folder drawer; scroll riffles the dated folders                  |
| `/about` (new)                                          | Bio, skills, education, contact                              | Type-case compartments (skills), bound volume (education)        |
| `/now`                                                  | Now snapshot + yearly log (Changelog merged)                 | One sheet under the lamp; the log is the card catalogue          |
| `/changelog`                                            | 308 redirect to `/now#log`                                   | n/a                                                              |
| `/ask`, `/ask/[slug]`, `/ask/page/[n]`, `/ask/feed.xml` | Moderated threads                                            | Reference-desk slip tray                                         |
| `/lab`, `/lab/[slug]`                                   | Experiments                                                  | Shelf of fiddly objects, each in a drei `<View>` slot            |
| `/resume`                                               | Printable                                                    | Folded document on the table; scene hidden in print              |
| `/owner`                                                | Moderation sign-in, `noindex`                                | None                                                             |
| `/studio`                                               | Embedded Sanity Studio                                       | None                                                             |
| 404                                                     | "Misfiled"                                                   | Empty open drawer, cursor-reveal lamp                            |

- **Nav (4):** Projects, Experience, Lab, About.
- **Right side of the nav:** a quiet "Resume" link and the ⌘K trigger. No primary CTA, per your answer.
- **Footer:** Now, Ask, RSS, Resume, email, GitHub, LinkedIn, visitor counter, "last filed" date.
- **⌘K:** every route, case study and lab item; copy email; download resume; quality and motion toggles; Owner when signed in.

### 2.2 Journey per breakpoint

|          | Mobile (<640)                                                                                                              | Tablet (640-1023)                                  | Desktop (>=1024)                                                         |
| -------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------ |
| Scene    | Home: full-bleed hero, then content sheets scroll over it. Other pages: a 40svh "window" at the top that shrinks on scroll | Portrait like mobile; landscape like desktop       | Fixed full-bleed behind the DOM                                          |
| Nav      | Bottom bar within thumb reach (4 items + ⌘K), sheet menu                                                                   | Top bar                                            | Top bar + ⌘K                                                             |
| Reading  | Content on paper sheets; scene paused under the sheet                                                                      | Case studies split: sticky scene 45% / content 55% | Editorial 12-col grid with margin notes; scene dims to 35% while reading |
| 3D input | Tap objects; horizontal swipe on the drawer strip; long-press to peek; one-finger vertical is always scroll                | Same + drag                                        | Hover, drag drawers, clamped orbit on empty space                        |

Every page is fully usable, and designed, with no scene at all (see 3.4).

---

## 3. 3D and motion design

### 3.1 The room

- **Geometry:** a plan chest (8 drawers, each with a brass label holder), a card catalogue (instanced cards), a reading table, the lamp (spot light + emissive shade), window blinds (planes with a moonlight gobo), and dust motes (one small instanced points set, T2+).
- **Construction:** everything is built in code from `RoundedBox`, extrusions and instancing.
- **Colour:** vertex colours plus one palette atlas texture. That makes theme and accent changes one uniform, as in Bruno Simon and Messenger.
- **CC0 extras:** optional (Poly Haven / Kenney), only for small props such as a pen or a magnifier, run through the asset pipeline (4.4).
- **Drawer labels:** drawn with troika text (drei `<Text>`), `aria-hidden`. The DOM scene nav carries the real labels (3.5).

### 3.2 Scene per route

| Route              | Pointer / touch                                                                                                                      | Scroll                                                                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `/`                | Objects under the cursor catch the lamp (rim-light rise). Drag a drawer out and it rebounds on its runners. Clamped orbit ±20° / ±8° | Camera dollies along the cabinet; each home section eases its drawer out 4cm                                                    |
| `/projects`        | Hovering a box lifts its lid 8° with a paper rustle (opt-in sound); a click lifts it to the table and navigates                      | Rows in the DOM list sync the box highlight                                                                                     |
| `/projects/[slug]` | Specimen rotates slightly with the pointer (look-at, damped)                                                                         | Scroll-scrubbed "moments": the box opens, its contents fan out, the camera settles top-down, then the scene dims under the text |
| `/work`            | Hovering a folder raises its tab                                                                                                     | ScrollTrigger progress drives which dated folder stands up (the Lempens technique)                                              |
| `/about`           | Hovering a skill in the DOM lights its type-case compartment, and vice versa                                                         | None                                                                                                                            |
| `/now`             | Cards flick with drag; velocity from Lenis bends them                                                                                | Log year headers pin while the catalogue riffles                                                                                |
| `/ask`             | A submitted question becomes a slip that drops into the tray (optimistic, before moderation)                                         | None                                                                                                                            |
| `/lab`             | Each experiment is its own fidget (switch, pendulum, the existing signature field)                                                   | None                                                                                                                            |
| 404                | The cursor is a lamp beam revealing a misfiled card (mask shader)                                                                    | None                                                                                                                            |

### 3.3 Transitions

1. A link click starts a React `<ViewTransition>` for the DOM: out 180 ms, in 260 ms, direction-aware using `transitionTypes`.
2. At the same moment, the store's route pose changes. GSAP flies the camera rig (position + target, 900-1200 ms, `archive-glide`) and slides the relevant drawer.
3. The canvas has its own `view-transition-name: scene`, with group animation disabled, so it keeps rendering live underneath instead of freezing in the snapshot.
4. The DOM never waits for the camera. If you navigate mid-flight, the flight retargets.
5. **First visit:** the lamp flicks on (at most 1.2 s, skippable, once per session). Text is visible from first paint.

### 3.4 Fallbacks and quality tiers

The tier is decided once on the client from:

- `@pmndrs/detect-gpu` 6
- WebGL2 availability
- `saveData`, `prefers-reduced-data`
- `deviceMemory`, `hardwareConcurrency`

At runtime, drei `PerformanceMonitor` steps down (never up mid-session).

| Tier | Who                                                 | Scene                                                                                                                                                                                                                                                                      |
| ---- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T0   | No WebGL2, save-data, detect-gpu tier 0, `?noscene` | No three.js downloaded at all. **Designed fallback:** a pre-rendered AVIF "photograph" of the room per route and theme, generated at build by `scripts/posters.ts` (Playwright renders the real scene). The CSS-3D drawer strip and all CSS micro-interactions still work. |
| T1   | Low GPU / most phones                               | DPR 1, baked shadows (`BakeShadows`), no postprocessing, no dust/trail/lens, `frameloop="demand"`                                                                                                                                                                          |
| T2   | Mid (recent phones, iGPU laptops)                   | DPR up to 1.5, lamp spot with a static shadow map, dust motes                                                                                                                                                                                                              |
| T3   | Desktop dGPU / Apple silicon                        | DPR up to 2, contact shadows, subtle bloom + vignette + grain (pmndrs postprocessing), cursor trail, glass lens on 404/hero                                                                                                                                                |

The poster doubles as the loading state, so the canvas slot never shifts (CLS 0) and there's no blank canvas while three.js loads.

### 3.5 Scene navigation, keyboard and screen readers

- **DOM first.** The drawer strip is a real, visible `<nav>` list of links styled as brass label holders, docked along the bottom edge of the scene.
- **Focus, hover and tap stay in sync.** Focusing or hovering a label highlights the matching mesh, and clicking a mesh calls the same `router.push`.
- **Keys:** arrow keys move between drawers (roving tabindex), Enter opens, Esc returns to the room.
- **Canvas:** `aria-hidden`. No information exists only in the canvas.

### 3.6 Reduced motion (`prefers-reduced-motion` or the Customize toggle)

- No Lenis: native scroll.
- No SplitText animation; camera cuts with a 200 ms crossfade.
- No idle motion. `frameloop="demand"` only.
- Micro-interactions switch to light/colour versions (5).
- It stays beautiful: the lamp still warms what you focus, and the accent still re-tints over 400 ms.

---

## 4. Technical architecture

### 4.1 Stack: latest stable, with a reason for each

"Latest and greatest" is applied as the latest **stable** release of each library. Alphas are excluded because they would break the "no compromise" rule on reliability.

| Library                                             | Version (verified 2026-09-26) | Why                                                                                                                                |
| --------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Next.js                                             | 16.3.x                        | App Router, stable `<ViewTransition>`, Cache Components, Turbopack                                                                 |
| React                                               | 19.3                          | `<ViewTransition>` + `addTransitionType` are stable                                                                                |
| TypeScript                                          | 6.0                           | Matches the reference                                                                                                              |
| Tailwind CSS                                        | 4.3                           | Tokens in `@theme`, `light-dark()`                                                                                                 |
| three                                               | 0.186 (WebGLRenderer, WebGL2) | See the WebGPU note below                                                                                                          |
| @react-three/fiber                                  | 9.8                           | Production line; v10 is alpha with open WebGL-fallback bugs                                                                        |
| @react-three/drei                                   | 10.7                          | `View`, `PerformanceMonitor`, `AdaptiveDpr`, `RoundedBox`, `Text`, `useGLTF` (meshopt), `BakeShadows`, `ContactShadows`, `StatsGl` |
| @react-three/postprocessing / postprocessing        | 3.1 / 6.39                    | T3 only, lazy chunk                                                                                                                |
| gsap + @gsap/react                                  | 3.15 / 2.1                    | Now 100% free incl. SplitText, Flip, CustomEase; `useGSAP` cleanup; `quickTo` for pointer work                                     |
| lenis                                               | 1.3 (`lenis/react`)           | Smooth scroll driven from gsap.ticker; `syncTouch` off (native touch scroll)                                                       |
| zustand                                             | 5.x                           | Tiny scene store (route pose, hovered object, tier) read inside `useFrame` via `getState()`, without re-renders                    |
| maath                                               | latest                        | `damp3`/`dampE` for look-at and camera smoothing (already a drei dependency)                                                       |
| @pmndrs/detect-gpu                                  | 6.0                           | GPU tiering; the unscoped package is abandoned                                                                                     |
| cmdk + tinykeys                                     | latest                        | ⌘K (ported behaviour)                                                                                                              |
| @base-ui/react                                      | latest                        | Accessible dialog/popover/switch primitives; one library, not Base UI + Radix                                                      |
| @number-flow/react                                  | latest                        | Visitor counter (ported)                                                                                                           |
| web-vitals                                          | 5.x                           | LCP/INP/CLS + LoAF attribution in the `?debug` overlay                                                                             |
| @gltf-transform/cli + KTX-Software                  | 4.5                           | Asset pipeline (meshopt + KTX2)                                                                                                    |
| Vitest, Playwright, @axe-core/playwright, @lhci/cli | latest                        | Testing and performance gates                                                                                                      |

**Cut, with reasons:**

- **Theatre.js:** no release since May 2024, and 1.0 moved to a private repo. Studio is 242 KB and AGPL. Camera sequences are GSAP timelines on the camera rig instead.
- **motion:** redundant with GSAP. One animation engine only.
- **WebGPU/TSL:** +100 KB gz, and it breaks pmndrs postprocessing, for no visible gain in a flat-lit low-poly scene. The scene code keeps materials in one folder, so switching later is contained. Revisit when R3F v10 is stable.
- **r3f-scroll-rig and r3f-perf:** both stale since late 2024. We copy the scroll-rig tracking pattern and use `stats-gl` instead.
- **tunnel-rat:** not needed. Routes don't inject meshes; they set a pose in the store.

### 4.2 Folder structure (new UI; backend is ported)

```
app/
  (site)/                  pages: server components, real DOM content
    layout.tsx             shell: header, footer, <SceneSlot/>, skip link
    page.tsx  projects/  projects/[slug]/  work/  about/  now/  ask/  lab/  resume/  owner/
  api/  md/  studio/  llms.txt  sitemap.ts ...   (ported)
components/
  scene/                   client only, loaded lazily after LCP
    scene-slot.tsx         poster + lazy boundary (server-safe)
    scene-root.tsx         <Canvas>, providers, tier gating
    archive/               room, plan-chest, drawer, card-catalogue, specimen-box, reading-table, lamp, blinds, dust
    camera/                camera-rig.tsx, poses.ts (route -> pose)
    materials/             palette-material.ts, paper-material.ts, brass-material.ts
    effects/               post.tsx (T3), cursor-trail.tsx, glass-lens.tsx, reveal-mask.tsx
    views/                 dom-plane.tsx (DOM-synced media planes), lab-view.tsx
    quality/               tier.ts, performance-monitor.tsx
  shaders/                 <name>.vert.ts / <name>.frag.ts exporting /* glsl */ strings; chunks/ (noise, palette, fresnel)
  motion/                  ticker.ts (gsap + lenis + r3f advance), smooth-scroll.tsx, split-heading.tsx, route-transition.tsx, eases.ts
  interaction/             pointer.ts (single listener), cursor.tsx, magnetic.tsx, tilt-card.tsx, press.tsx, hover-preview.tsx
  site/ ui/ ask/ command/ customize/ projects/ work/ now/ about/ lab/ resume/ og/
lib/                       ported backend + lib/scene/store.ts, lib/scene/routes.ts, lib/motion/policy.ts
scripts/                   ported + assets.ts (gltf-transform), posters.ts (Playwright scene renders)
public/models  public/posters
```

**Shaders** are TypeScript modules exporting tagged GLSL strings. That needs no bundler loader, so it's Turbopack-safe, gets editor highlighting via `/* glsl */`, and allows shared chunks by string composition. Each effect keeps its vertex shader, fragment shader and uniform types together.

### 4.3 How R3F, GSAP, Lenis and React coexist

- **One clock.** `gsap.ticker` is the only rAF.
  - It calls `lenis.raf(t)`.
  - When the scene is awake, it calls R3F's `advance(t)`, with `frameloop="never"`.
  - When the scene is idle (no tween, no pointer on the canvas, not scrolling), it stops advancing. `invalidate()` wakes it.
  - `lagSmoothing(0)`.
- **One scroll source.** Lenis → `ScrollTrigger.update` → per-route progress written into refs in the zustand store. `useFrame` reads refs and never reads `window.scrollY`. Reduced motion: native scroll feeds ScrollTrigger directly.
- **One pointer source.** A single passive `pointermove` on `window` stores x/y (the handler does less than 0.1 ms of work). One ticker callback writes `--mx/--my` on the hovered element, plus a shared vector for three. No React state on pointer moves. `getBoundingClientRect` is read only on `pointerenter`.
- **React owns structure, GSAP owns time.** Components declare meshes; GSAP tweens mutate three objects and CSS variables directly inside `useGSAP` contexts, which revert on unmount.
- **The canvas persists.** It's mounted once in `(site)/layout.tsx`, so it survives navigations. Pages don't render 3D; they set the route pose.
- **Lazy by design.** `next/dynamic(ssr:false)` imports the scene after LCP (`requestIdleCallback` with a timeout fallback), and never on T0.

### 4.4 Asset pipeline

- **Code-built geometry first.** Instancing for cards and drawers. Merged static geometry for the room shell. `raycast = null` on non-interactive meshes; interaction targets are simplified proxy boxes.
- **External glTF:** `scripts/assets.ts` runs `gltf-transform optimize --compress meshopt --texture-compress ktx2`, with budgets checked per file. Loaded with drei `useGLTF(url, false, true)` (meshopt).
- **Textures:** one palette atlas (PNG 64x64), a paper normal + grain KTX2 at 512², and baked soft shadow textures. No HDRI; the lighting is analytic.
- **Posters:** `scripts/posters.ts` renders every route pose × theme to AVIF (1600w + 800w) at build, for the T0 fallback and the loading state.
- **Case-study media:** AVIF/WebP via `next/image` with Sanity image URLs. Loops as AV1 WebM + H.264 MP4 with an AVIF poster. See the shot list in 6.
- **Disposal hygiene:** on tier change and unmount, especially for iOS Safari.

### 4.5 Rendering strategy

- **Every public page is statically generated at build from Sanity.** A signed webhook calls `POST /api/revalidate`, which invalidates the right cache tags. This is ported unchanged in behaviour.
- **Adopt Next 16 Cache Components:** `'use cache'` + `cacheTag(type)` + `cacheLife('max')` in the data accessors, giving a static shell for every route.
  - `/ask` dynamic bits (viewer, owner state) move behind Suspense as the dynamic holes.
  - If the `/ask` owner flows fight it, fall back to the current `force-cache` fetch-tag approach. Behaviour is identical either way.
- **Draft mode + Presentation:** unchanged.

### 4.6 Security

- **Headers, from `next.config` headers:**
  - CSP: `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-ancestors 'none'`, and allow-lists for Sanity images, media and API.
  - `script-src` must include `'unsafe-inline'`. Pages are static, so they can't carry per-request nonces, and Next inlines its RSC payload scripts. The trade-off is documented in `next.config.ts`.
  - Studio gets its own relaxed policy on `/studio` only.
  - HSTS, `X-Content-Type-Options`, `Referrer-Policy: strict-origin-when-cross-origin`, COOP, `X-Frame-Options: DENY`.
  - `Permissions-Policy`: `gyroscope=(self), accelerometer=(self)` for opt-in tilt; everything else denied.
- **Ported /ask hardening stays:** rate limits, honeypot, heuristics, HMAC cookies, circuit breaker, private dataset, private fields never selected.
- **Link previews:** check for SSRF guards (M0 review item).
- **Trust boundaries:** zod at every input. Env validated, tokens server-only.
- **Supply chain:** `bun audit` in CI, Renovate, exact versions in the lockfile, no CDN scripts.
- **Sound and tilt:** only start from a user gesture. The iOS motion permission prompt appears only after an explicit opt-in.

---

## 5. Micro-interactions and cursor system

Rules for the whole system:

- All pointer work goes through the single pointer source (4.3).
- Hover effects are gated by `@media (hover:hover) and (pointer:fine)`.
- `:focus-visible` triggers the same effect as hover.
- `will-change` is added on enter and removed on leave; cards use `contain: layout paint`.

| #   | Interaction                                                                                                                      | Where                       | Build                                                                          | Touch                     | Keyboard                        | Reduced motion                       |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------ | ------------------------- | ------------------------------- | ------------------------------------ |
| 1   | Cursor: dot + ring (quickTo), `mix-blend-mode: difference`, contextual labels via `data-cursor` ("Open", "Drag", "Read", "Copy") | Global, fine pointers       | CSS + GSAP                                                                     | None                      | Focus ring takes the ring shape | Dot only, no lag                     |
| 2   | Magnetic nav and actions (pull ≤10px, label 1.5x)                                                                                | Nav, footer, CTAs           | CSS vars                                                                       | `:active` scale .97       | Pulls to centre on focus        | Underline/colour only                |
| 3   | Tilt card + glare (≤6°, radial-gradient at `--mx/--my`)                                                                          | Project cards, lab tiles    | CSS                                                                            | Tilt from scroll progress | Lifted pose                     | Glare opacity only                   |
| 4   | Press-down buttons (`translateZ` + inner shadow)                                                                                 | All buttons                 | CSS                                                                            | Same on touch             | Same on Enter/Space             | Shadow/brightness only               |
| 5   | List hover preview: one floating media plane with RGB shift                                                                      | Projects archive, Work rows | WebGL DOM-synced plane (CSS `<img>` on T0)                                     | Long-press peek           | Shows for the focused row       | Crossfade                            |
| 6   | Image distortion on hover + scroll velocity                                                                                      | Case-study media, projects  | DOM-synced planes in the shared canvas                                         | Scroll velocity drives it | Focus = hover                   | Crossfade                            |
| 7   | Scene objects catch the light and look at the cursor (damped)                                                                    | Home, projects, case study  | R3F `useFrame` + maath                                                         | Follows scroll / last tap | Follows focused label           | Frozen; lamp rim-light rises instead |
| 8   | Drawer drag with runner resistance                                                                                               | Home, projects              | R3F pointer events, 6px tap-vs-drag threshold, pointer capture after threshold | Horizontal swipe          | Arrow keys                      | Instant open                         |
| 9   | Heading letters react to cursor proximity (weight/`opsz` axis)                                                                   | Page H1s, in view only      | SplitText + CSS vars (variable font axes, no layout shift)                     | Scroll-in reveal only     | None                            | Static                               |
| 10  | Accent re-tint: UI + scene over 400ms, one CSS var + one uniform                                                                 | Customize panel             | CSS + uniform                                                                  | Same                      | Same                            | Same (colour only)                   |
| 11  | Cursor lamp trail: ¼-res FBO, only while the pointer moves                                                                       | Home hero, T3               | Shader                                                                         | Off                       | Off                             | Off                                  |
| 12  | Glass lens / reveal mask                                                                                                         | 404, hero easter egg, T3    | Shader                                                                         | Tap to place              | None                            | Off                                  |
| 13  | Paper slip drop on /ask submit                                                                                                   | /ask                        | R3F + GSAP (DOM echo on T0)                                                    | Same                      | Same                            | Fade                                 |
| 14  | Opt-in sound: drawer thud, paper rustle, lamp click                                                                              | Scene + buttons             | Ported `lib/sound.ts` (Web Audio), samples lazy-loaded                         | Same                      | Same                            | Same (sound isn't motion)            |

**Without WebGL,** items 1-4, 9 and 10 work unchanged. Items 5-8 and 11-13 fall back to CSS crossfades or DOM echoes.

---

## 6. Sanity integration

- **Reuse** `y9f5m131` / `production` with a new server-only viewer token. The schemas and data layer are ported from the reference branch.
- **Additive, optional fields only.** The reference site ignores them, so both sites read the same data.

| Type      | New field    | Shape                                                                                                                                                                                                                                                                          |
| --------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `project` | `coverVideo` | `{ webm: file, mp4: file, poster: image+alt }` (existing `image` stays the cover still)                                                                                                                                                                                        |
| `project` | `gallery`    | array of `{ kind: image \| video, image, file, alt, caption, aspect }`                                                                                                                                                                                                         |
| `project` | `mobileShot` | image + alt                                                                                                                                                                                                                                                                    |
| `project` | `caseStudy`  | object: `tldr` (3 strings), `role`, `timeline`, `team`, `context` (rich text), `moments[]` `{ heading, body, media }`, `underTheHood` (rich text incl. code blocks), `diagram` (SVG file), `metrics[]` `{ label, before, after, unit }`, `reflection` (rich text), `credits[]` |
| `project` | `specimen`   | string list: box style for the scene (`card`, `crate`, `tin`, `folio`)                                                                                                                                                                                                         |
| `profile` | `principles` | optional string array for /about (only if you want it; otherwise skipped)                                                                                                                                                                                                      |

- **Queries and accessors:**
  - `getProject(slug)`, new, cached, tagged `project`.
  - `getProjects` gains the cover and specimen fields.
  - Mappers absorb the changes. Typegen reruns.
- **Migration:** none required. `scripts/seed.ts` and the fallback content gain example case-study data, so the site stays complete without Sanity.
- **Media hosting:** Sanity file assets on its CDN. That's fine for 10-15 s loops under 5 MB. If you want adaptive streaming later, the Mux plugin is additive.
- **Shot list per featured project:**

| #   | Asset                               | Master         | Delivered                                                                               |
| --- | ----------------------------------- | -------------- | --------------------------------------------------------------------------------------- |
| 1   | Hero still, 16:10                   | 2880x1800 PNG  | AVIF + WebP, hero under 200 KB                                                          |
| 2   | Hero loop, 10-15 s, muted, seamless | 60 fps capture | 1920x1200 at 30 fps, AV1 WebM under 2.5 MB + H.264 MP4 under 5 MB, poster = first frame |
| 3   | 3-6 detail crops                    | 2x retina      | 1:1 or 4:5, AVIF under 120 KB each                                                      |
| 4   | 1-2 interaction micro-loops         | 3-6 s          | Under 1 MB each                                                                         |
| 5   | Mobile capture                      | 1179x2556      | Still + optional 8 s loop                                                               |
| 6   | Architecture diagram                |                | SVG                                                                                     |
| 7   | Performance proof                   |                | Real numbers as text                                                                    |
| 8   | Code excerpt                        |                | Real text, never an image                                                               |
| 9   | Card thumbnail + OG                 |                | 800 px card + 1200x630 OG                                                               |

A full spec doc ships in M4.

---

## 7. Performance budget

| Metric                     | Target                                                                      | How it's enforced                                             |
| -------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Initial JS, text pages     | ≤ 170 KB gz (`/ask` ≤ 230)                                                  | `scripts/check-budget.ts` in CI, per route                    |
| Deferred 3D chunk          | ≤ 300 KB gz; never before LCP; never on T0                                  | Budget script parses the chunk graph                          |
| T3 postprocessing chunk    | ≤ 80 KB gz, desktop only                                                    | Same                                                          |
| Fonts                      | ≤ 3 preloads, ≤ 120 KB                                                      | Same                                                          |
| Scene assets               | ≤ 400 KB first view, ≤ 1.2 MB total; GPU memory < 100 MB                    | `scripts/assets.ts` budget + `renderer.info` check in e2e     |
| Draw calls                 | < 100 (T1 < 50)                                                             | e2e reads `renderer.info`                                     |
| LCP (p75, mid Android, 4G) | ≤ 2.0 s (the LCP element is a DOM heading, never the canvas)                | Lighthouse CI mobile preset + WebPageTest per milestone       |
| INP                        | ≤ 150 ms                                                                    | Lighthouse timespan + web-vitals attribution in `?debug`      |
| CLS                        | ≤ 0.05 (poster reserves the canvas slot)                                    | Lighthouse CI                                                 |
| TBT (Lighthouse mobile)    | ≤ 150 ms                                                                    | Lighthouse CI                                                 |
| Frame                      | JS ≤ 2 ms, GPU ≤ 8 ms at the tier's DPR; 60 fps desktop, ≥ 50 fps mid phone | `stats-gl` in `?debug`; Playwright trace with 4x CPU throttle |
| Idle                       | 0 frames rendered when nothing moves                                        | e2e asserts the frame counter stays flat                      |

Lighthouse CI asserts ≥ 95 on Performance, Accessibility, Best Practices and SEO (mobile) for every route. A build fails if any budget fails.

---

## 8. Accessibility and SEO

- **Real text:** all content is DOM text, server-rendered, readable with JS off. The scene is progressive enhancement, and `<noscript>` shows the poster.
- **Structure:** semantic landmarks, one H1 per page, skip link, `lang`.
- **Focus:** a visible accent `:focus-visible` ring at ≥ 3:1 contrast.
- **Keyboard:** the scene nav is visible and keyboard-operable. Esc works everywhere, and focus returns after dialogs.
- **Contrast:** WCAG 2.2 AA in both themes for every accent hue; axe runs in e2e on every route.
- **Touch targets:** ≥ 44px; no hover-only information.
- **Reduced motion:** honoured, plus a site toggle in Customize and ⌘K.
- **Metadata:**
  - Per-page title and description, canonical, OG/Twitter images (ported generators, restyled).
  - JSON-LD: `Person` on `/` and `/about`, `CreativeWork` per case study, `QAPage` per `/ask` thread.
  - Sitemap, robots, RSS, markdown mirrors, `/llms.txt` (ported).
  - `/owner` is `noindex`.

---

## 9. Testing

| Layer             | Tooling                                  | Covers                                                                                                                                                                                                                                                |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit              | Vitest                                   | Ported suites (ask, visits, markdown, data, prefs) + tier decision, route→pose map, motion policy, pointer store, new project mappers                                                                                                                 |
| E2E               | Playwright                               | Every route renders content; nav and ⌘K; the keyboard-only journey through the scene nav; `/ask` submit + moderation; print; Customize; `?noscene` and a WebGL-disabled Chromium show the poster; reduced-motion emulation; mobile + tablet viewports |
| A11y              | @axe-core/playwright                     | Every route, both themes                                                                                                                                                                                                                              |
| Visual regression | Playwright `toHaveScreenshot`            | DOM with the deterministic poster (`?noscene`), 3 viewports × 2 themes; plus scene snapshots under SwiftShader with a fixed seed and loose threshold                                                                                                  |
| Perf              | Lighthouse CI, budget script, trace test | Section 7                                                                                                                                                                                                                                             |
| Devices / GPUs    | Manual per milestone                     | Chrome (dGPU + iGPU), Safari macOS, Firefox, iPhone 12/13 Safari, a mid Android (Pixel 6a / Galaxy A5x) over remote debugging, forced T1 with 6x CPU throttle                                                                                         |

---

## 10. Milestones

Every milestone ends with:

- type-check, lint, unit, e2e, budget and Lighthouse passing
- a short changelog
- how to preview it: `bun run dev --port 3001` in the worktree, next to the reference site on `:3000`
- suggested commit messages (I never commit unless you ask)

| M                       | Scope                                                                                                                                                                                                                                                                                                                             | What you review                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **M0** (running)        | Branch/worktree; master's old site removed; backend ported (lib, sanity, api, md, og, studio, scripts, fallback content); dependencies bumped to latest stable; checks green                                                                                                                                                      | `bun run build` passes; bare placeholder home shows your profile       |
| **M1** Foundations      | Tokens, fonts, theme + accent + prefs pre-paint; shell (header, bottom bar, footer, drawer-strip nav); ⌘K; Customize; **all pages as finished DOM designs** (the T0 site); motion core (ticker, Lenis, ViewTransition, SplitText headings); pointer system + cursor + magnetic + press + tilt; security headers; Cache Components | The whole site, beautiful with no 3D: keyboard, reduced motion, mobile |
| **M2** Scene core       | Lazy SceneRoot, tiers, room + plan chest + lamp + palette material, camera rig + route poses + transitions, posters script, reduced motion                                                                                                                                                                                        | The room on every route, camera flights between pages, on your phone   |
| **M3** Deep interaction | Drawer drag, specimen boxes, work folders on scroll, now catalogue, about type-case, ask slips, 404 reveal; scene-nav/mesh sync                                                                                                                                                                                                   | Every route's scene behaviour, touch + keyboard                        |
| **M4** Case studies     | Additive schema + typegen + mappers + seed; `/projects/[slug]` template; media components; DOM-synced planes (hover preview, distortion); shot-list doc                                                                                                                                                                           | A case study with placeholder media; Studio shows the new fields       |
| **M5** Polish           | T3 postprocessing, cursor trail, glass lens, heading proximity, opt-in sound, opt-in tilt, Lab with Views                                                                                                                                                                                                                         | The award polish pass                                                  |
| **M6** Hardening        | Device/GPU matrix, Lighthouse/WebPageTest, visual regression baselines, axe, security review, docs                                                                                                                                                                                                                                | Final report: numbers per route, device results                        |

### How the work is split across agents (model per task)

- **Opus (me):** architecture, scene/camera/shader work, motion choreography, integration, reviews of every agent's output.
- **Sonnet:** porting, page and component implementation from the specs above, schema + mappers, e2e and unit tests, performance fixes.
- **Haiku:** mechanical work, such as lint/format fixes, file moves, doc updates, dependency changelog summaries, copy checks.
- **Machine safety (11 cores, 18 GB):**
  - At most 2 agents run Node at once, and each runs one Node process at a time. No dev servers inside agents; I run the single preview server.
  - Code-only agents work in parallel on disjoint folders. A single verifier agent runs install/build/test.

---

## 11. Risks and mitigations

| Risk                                      | Mitigation                                                                                               |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Literal scene reads as cliché             | Strict art direction: archive, not bedroom; no RGB, no neon, no floating island                          |
| iOS Safari GPU memory limits              | Tiers, texture budget, disposal, T1 default on phones                                                    |
| ViewTransition + persistent canvas quirks | Canvas excluded from the snapshot (tested in e2e); fallback to a DOM-only crossfade                      |
| Cache Components vs `/ask` owner flows    | Suspense holes; fallback to the proven fetch-tag strategy                                                |
| No project media yet                      | Designed placeholders (specimen-box renders); shot list in M4                                            |
| Scope for one engineer                    | T0 site complete first (M1), so every later milestone is additive and the site is shippable at each step |
| Library staleness                         | Stale libraries avoided (Theatre, r3f-perf, scroll-rig, tunnel-rat); Renovate on                         |

## 12. Open questions (only you can answer)

1. **Which 3-4 projects get case studies?** Default: the ones with `featured: true` in Sanity.
2. **`profile.principles` for /about:** a short list of how you work. Include it, or skip? Default: skip.

Everything else (concept, stack, IA, motion) is decided above from the research. Tell me what to change, or say "approved" and M1 starts as soon as M0 lands.
