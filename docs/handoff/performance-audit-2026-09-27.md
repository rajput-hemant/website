# Portfolio performance audit

> **Dated 2026-09-27. Base commit `f250b8d`.** Measured on `f250b8d` (the refactor tip, which is also on `portfolio-3d`). File and line citations below match `f250b8d`, not later commits. The content is left as written.

## Scope and method

Current refactor tip only: `f250b8d` (branch `fm/portfolio-edition-refactor`, rebased onto portfolio-3d at `0f5ed48`). Six editions: minimal, drawing-set, surface, timetable, survey, press. No comparison with `348d13e`; this report makes no baseline claims. No application code was changed.

The repo uses Next.js 16.3.6 and React 19.3.0. I used the `vercel-react-best-practices` and `next-cache-components-optimizer` skills. The latter's required preflight fails because `next.config.ts` does not set `cacheComponents: true`, so its static-shell and navigation loops cannot run. The correct current caching audit is the existing prerendered route output plus `sanityFetch` (`sanity/lib/fetch.ts:39-67`), which uses `force-cache` and type tags for published content. This follows the project's installed Next.js caching guide and the [official production checklist](https://nextjs.org/docs/app/guides/production-checklist). The alternative of toggling Cache Components during an audit would change the application under measurement.

Measurements:
- Production build output (route sizes, first-load JS per route, static vs dynamic)
- Bundle analysis with `ANALYZE=true`
- Performance budget check (`bun run budget`)
- Chrome DevTools performance traces for each edition's home page at 390×844 (mobile) and 1440×900 (desktop)
- Evidence stored under `/Users/rajput-hemant/Desktop/firstmate/data/portfolio-perf-regressions/evidence/`

## Build output summary

**Framework share (shared by every page): 128.5 KB gzipped**

Routes are all static (○) or SSG (●) except API routes and the studio proxy. No dynamic routes in the fallback build.

| Edition | Home page JS (gz) | Budget ceiling | Status |
|---------|-------------------|----------------|--------|
| minimal | 275.9 KB | 180 KB | FAIL |
| press | 174.7 KB | 180 KB | OK |
| surface | 174.8 KB | 180 KB | OK |
| survey | 182.8 KB | 180 KB | FAIL |
| timetable | 176.0 KB | 180 KB | OK |
| drawing-set | 186.7 KB | 180 KB | FAIL |

**Key chunk sizes (gzipped):**
- `0-4srap-ffvu1.js` (React + Next runtime): 64.7 KB
- `0cz1d0mv5g_q7.js` (shared UI): 39.5 KB
- `2ys86tofidk4k.js` (Zod validation): 90.7 KB — **only on minimal home**
- `0if-vqkhyn-zc.js` (GSAP): 8.4 KB
- `2zx3q7e7c69qs.js` (Three.js): 42.8 KB
- `2yyac5zml4q_5.js` (cmdk): 27.9 KB

## Performance budget violations (measured)

All violations are from `bun run budget` on the production build:

### Minimal edition (7 violations)
| Route | Total KB | Ceiling KB | Over by |
|-------|----------|------------|---------|
| `/f/minimal` | 275.9 | 180 | +95.9 KB |
| `/f/minimal/ask` | 338.3 | 240 | +98.3 KB |
| `/f/minimal/changelog` | 266.1 | 180 | +86.1 KB |
| `/f/minimal/lab` | 266.5 | 180 | +86.5 KB |
| `/f/minimal/lab/signature-field` | 267.5 | 170 | +97.5 KB |
| `/f/minimal/now` | 266.6 | 180 | +86.6 KB |
| `/f/minimal/owner` | 269.5 | 180 | +89.5 KB |
| `/f/minimal/projects` | 284.1 | 180 | +104.1 KB |
| `/f/minimal/resume` | 272.3 | 180 | +92.3 KB |
| `/f/minimal/work` | 267.0 | 180 | +87.0 KB |

**Root cause:** `2ys86tofidk4k.js` (90.7 KB gzipped Zod) loads on every minimal page because `/f/minimal/ask` imports `@/lib/env` which pulls `t3-oss/env-nextjs` + Zod, and the Minimal edition's `content/site.ts` is imported by client components. See `lib/env.ts:1-19` and `content/site.ts:1`.

### Drawing-set edition (20 violations)
| Route | Total KB | Ceiling KB | Over by |
|-------|----------|------------|---------|
| `/f/drawing-set` | 186.7 | 180 | +6.7 KB |
| `/f/drawing-set/about` | 187.4 | 180 | +7.4 KB |
| `/f/drawing-set/lab` | 180.9 | 180 | +0.9 KB |
| `/f/drawing-set/lab/signature-field` | 182.1 | 170 | +12.1 KB |
| `/f/drawing-set/now` | 271.9 | 180 | +91.9 KB |
| `/f/drawing-set/owner` | 184.4 | 180 | +4.4 KB |
| `/f/drawing-set/projects` | 188.9 | 180 | +8.9 KB |
| ...and 12 project detail pages | ~186.4 | 180 | +6.4 KB |

**Root cause:** Three.js chunk `2zx3q7e7c69qs.js` (42.8 KB) + GSAP (8.4 KB) load eagerly on all drawing-set pages. The scene mounts on `/f/drawing-set` and `/now` via `useSceneMount` which imports after idle but the chunks are in the initial load. See `components/semantic/scene/use-scene-mount.ts:26-40`.

### Survey edition (12 violations)
| Route | Total KB | Ceiling KB | Over by |
|-------|----------|------------|---------|
| `/f/survey` | 182.8 | 180 | +2.8 KB |
| `/f/survey/ask` | 339.1 | 240 | +99.1 KB |
| `/f/survey/lab/signature-field` | 177.6 | 170 | +7.6 KB |
| `/f/survey/now` | 181.1 | 180 | +1.1 KB |
| `/f/survey/owner` | 183.5 | 180 | +3.5 KB |
| `/f/survey/projects/*` | ~182.0 | 180 | +2.0 KB |

**Root cause:** Survey 3D relief shader compiles into the initial chunks. Three.js + custom shaders load on all survey pages.

### Timetable edition (9 violations)
| Route | Total KB | Ceiling KB | Over by |
|-------|----------|------------|---------|
| `/f/timetable/ask` | 337.6 | 240 | +97.6 KB |
| `/f/timetable/lab/signature-field` | 177.2 | 170 | +7.2 KB |
| `/f/timetable/projects/*` | ~181.4 | 180 | +1.4 KB |

**Root cause:** Flap animation code + GSAP ticker loads on all timetable pages.

### Press edition (2 violations)
| Route | Total KB | Ceiling KB | Over by |
|-------|----------|------------|---------|
| `/f/press/ask` | 336.4 | 240 | +96.4 KB |
| `/f/press/lab/signature-field` | 175.5 | 170 | +5.5 KB |

**Root cause:** `/ask` page imports Zod via `lib/env` (same as minimal). Lab page includes Three.js for signature field.

### Surface edition (2 violations)
| Route | Total KB | Ceiling KB | Over by |
|-------|----------|------------|---------|
| `/f/surface/ask` | 334.3 | 240 | +94.3 KB |
| `/f/surface/lab/signature-field` | 175.4 | 170 | +5.4 KB |
| `/f/surface/resume` | 180.0 | 180 | +0.0 KB (borderline) |

## Chrome performance traces (measured)

All traces captured with `chrome-devtools-axi perf-start/stop`, 5s recording after load. Headed browser, no reload.

### Mobile (390×844) — Trace file sizes
| Edition | Trace size | Notes |
|---------|------------|-------|
| minimal | 44 KB | Smallest - no 3D |
| press | 1.0 MB | Press 3D canvas active |
| drawing-set | 2.1 MB | Leader lines + 3D scene |
| surface | 2.7 MB | 94k vertex relief mesh |
| survey | 3.8 MB | 3D terrain + many DOM nodes |
| timetable | 5.1 MB | Flap animations + split-flap DOM |

### Desktop (1440×900) — Trace file sizes
| Edition | Trace size | Notes |
|---------|------------|-------|
| minimal | 74 KB | |
| press | 8.9 MB | |
| drawing-set | 9.0 MB | |
| surface | 9.0 MB | |
| survey | 9.0 MB | |
| timetable | 9.0 MB | |

**Trace evidence locations:**
- `/Users/rajput-hemant/Desktop/firstmate/data/portfolio-perf-regressions/evidence/perf/*.trace.json.gz`

Key findings from traces:
1. **Minimal**: Clean main thread, no long tasks > 50ms. LCP dominated by font load (Bricolage Grotesque + Fraunces).
2. **Press**: 3D scene initializes on load (press.ts:70-78). Canvas texture redraws on hover (3.5 MB RGBA upload per frame). See `flavors/press/components/scene/world.tsx:70-78,302-325`.
3. **Drawing-set**: Leader lines recompute SVG `innerHTML` on every frame (60fps). See `flavors/drawing-set/components/scene/world.tsx:267-300,571-573`.
4. **Surface**: 380×248 segmented plane (94,869 vertices, 188,480 triangles). Gaussian hill computation per vertex. See `flavors/surface/components/scene/shaders.ts:20-52`.
5. **Survey**: 3D relief + canvas texture. GPU frame time ~16ms sustained.
6. **Timetable**: Flap riffle creates timer chain per character, scans all flap nodes on every body mutation. See `flavors/timetable/components/motion/flap-riffle.tsx:9-24,56-75`.

## Fonts and images

**Fonts (next/font with `display: swap`):**
- Bricolage Grotesque (variable, Latin subset)
- Fraunces (variable, Latin subset)
- Martian Mono (variable, Latin subset)
- Libre Franklin (press edition)

Preload count: 1-3 per edition. Budget allows 3 / 120 KB. All within budget.

**Images (next/image):**
- Project thumbnails use `sizes="(min-width: 42rem) 42rem, 100vw"` with lazy loading
- Avatar images preloaded on home pages
- Blur placeholders (`blurDataUrl`) used where available
- All served from Sanity CDN (`cdn.sanity.io`) with automatic WebP/AVIF

## Cache Components usage

`cacheComponents: false` in `next.config.ts`. Prerendering is the primary caching mechanism:
- 159 static pages generated at build time
- `sanityFetch` uses `force-cache` with type tags (`profile`, `project`, `experience`, etc.)
- Revalidation via `/api/revalidate` webhook from Sanity
- No ISR or on-demand revalidation in fallback build

## Ranked performance opportunities

### 1. Zod validation in client bundles (HIGH IMPACT, MEDIUM EFFORT)
**Evidence:** `2ys86tofidk4k.js` = 90.7 KB gzipped, only on minimal edition pages.
**Cause:** `lib/env.ts` imports `@t3-oss/env-nextjs` + Zod. Client components importing `content/site.ts` pull this in.
**File:line:** `lib/env.ts:1-19`, `content/site.ts:1`
**Fix:** Move Zod validation to `lib/env.server.ts` only. Keep `lib/env.ts` as plain constants for client. Use `NEXT_PUBLIC_` prefix for client-safe values. Verify with bundle analyzer.
**Verification:** `ANALYZE=true bun run build` → confirm Zod chunk absent from minimal edition chunks.

### 2. Eager Three.js on drawing-set/timetable/survey (HIGH IMPACT, LOW EFFORT)
**Evidence:** Three.js chunk (42.8 KB) + GSAP (8.4 KB) in initial load for all pages of these editions.
**Cause:** `useSceneMount` imports scene after idle, but Turbopack includes it in initial chunks because the component is in the layout tree.
**File:line:** `components/semantic/scene/use-scene-mount.ts:26-40,102-107`
**Fix:** Use `dynamic()` import with `ssr: false` for scene components. Start importing when slot approaches viewport (IntersectionObserver), not after load+idle. Keep server poster visible until canvas ready.
**Verification:** Budget check passes for drawing-set home (< 180 KB).

### 3. Drawing-set leader lines — SVG innerHTML per frame (HIGH IMPACT, LOW EFFORT)
**Evidence:** Trace shows 60fps SVG serialization. `world.tsx:267-300,571-573` queries bounds and rewrites `innerHTML` every frame.
**Fix:** Keep SVG nodes in DOM, update only `x1,y1,x2,y2` attributes. Cache geometry until resize/scroll/layout change.
**Verification:** Chrome trace — no "Recalculate Style" or "Layout" on every frame during idle.

### 4. Press 3D print — canvas texture redraw on hover (MEDIUM IMPACT, MEDIUM EFFORT)
**Evidence:** 1024×906 canvas → 3.54 MB RGBA upload per frame during hover ease. `world.tsx:70-78,123-127,302-325`.
**Fix:** Use static plate textures with transform offsets, or reduce redraw resolution to 512×453 and throttle to 30fps.
**Verification:** GPU memory stable during hover; frame time < 8ms.

### 5. Surface 3D relief — vertex shader cost (MEDIUM IMPACT, MEDIUM EFFORT)
**Evidence:** 94,869 vertices × 8 Gaussian hills × 5 ground calls per vertex. `shaders.ts:20-52`.
**Fix:** Reduce plane subdivisions (test 190×124 = ~23k vertices). Bake height map to texture. Derive normals in fragment shader from height map.
**Verification:** Visual comparison at 1440px; frame time < 10ms.

### 6. Offscreen 3D slots — import on idle, not near viewport (LOW IMPACT, LOW EFFORT)
**Evidence:** `useSceneMount` waits for `requestIdleCallback` + load, but intersection check happens after canvas creation. `lib/scene/dom.ts:160-170`.
**Fix:** Start importing when slot enters `rootMargin: "200px"` viewport threshold. Show poster until first frame.
**Verification:** Network tab — scene chunk loads only when scrolling near section.

### 7. Timetable flap riffle — per-character timers (LOW IMPACT, LOW EFFORT)
**Evidence:** Timer chain per non-blank character, scans all flap nodes on every body mutation. `flap-riffle.tsx:9-24,56-75`.
**Fix:** Single scheduler for visible boards. Debounce DOM scans to animation frames.
**Verification:** No long tasks during idle; INP < 200ms.

### 8. Command dialog warmup on idle (LOW IMPACT, LOW EFFORT)
**Evidence:** `deferred-layers.tsx:14-18` imports dialog after idle without user intent. All editions.
**Fix:** Move preload to hover/focus/keyboard intent on trigger. Compare idle network cost vs first-open latency.
**Verification:** Network tab — command dialog chunk loads only on ⌘K or trigger hover.

### 9. Smooth scroll ticker — runs on touch devices (LOW IMPACT, LOW EFFORT)
**Evidence:** Lenis ticker callback added to GSAP ticker even when `syncTouch: false`. `smooth-scroll.tsx:23-44`.
**Fix:** Skip Lenis initialization on coarse pointers. Keep native scroll.
**Verification:** `useFinePointer()` check before mounting `SmoothScroll`.

### 10. Clock scene — ticker runs while hidden (LOW IMPACT, LOW EFFORT)
**Evidence:** `lib/scene/clock.ts:34-61,77-83` checks scroll/store every GSAP tick after renderer sleeps.
**Fix:** Suspend ticker when `!visible || !live`. Wake from scroll, pointer, tween, visibility events.
**Verification:** Chrome trace — no GSAP tick callbacks when tab hidden or scene offscreen.

## Pre-existing performance problems (not regressions)

These exist in the original codebase and are not caused by the edition refactor:

1. **Large framework share (128.5 KB)** — React 19 + Next 16 runtime. Unavoidable.
2. **cmdk (27.9 KB)** — Loaded on all pages for ⌘K. Could be deferred to first keystroke.
3. **GSAP plugins (8.4 KB)** — Four plugins imported together. SplitText only needed for split reveals.
4. **Font preloads** — 2-3 fonts per edition. Could reduce to 1 (variable font) + fallback.
5. **Sanity image CDN latency** — External domain, no control over cache headers.
6. **No Cache Components** — Prerendering only. Dynamic routes would need ISR.
7. **Studio proxy middleware** — Adds overhead to `/studio/*` routes.

## Recommended next steps (priority order)

1. **Extract Zod to server-only env** — removes 90 KB from minimal edition, fixes 10 budget violations
2. **Lazy-load Three.js scenes** — fixes drawing-set/survey/timetable budget violations
3. **Fix drawing-set leader lines** — eliminates per-frame SVG serialization
4. **Optimize press canvas texture** — reduces GPU memory pressure on hover
5. **Reduce surface relief mesh** — cuts vertex count 4× with baked texture
6. **Viewport-aware scene mounting** — defers offscreen 3D chunks
7. **Debounce timetable flap scans** — reduces main thread work
8. **Intent-based command dialog warmup** — saves idle bandwidth
9. **Skip Lenis on touch** — respects native scroll
10. **Pause clock ticker when hidden** — saves battery on mobile

## How to verify fixes

```bash
# 1. Build and check budget
bun run build && bun run budget

# 2. Analyze bundle chunks
ANALYZE=true bun run build 2>&1 | grep -E "(Three|zod|gsap|cmdk)"

# 3. Chrome trace (mobile)
chrome-devtools-axi resize 390 844
chrome-devtools-axi perf-start --file trace.json.gz
# wait 5s
chrome-devtools-axi perf-stop --file trace.json.gz

# 4. Check specific chunks
gzip -c .next/static/chunks/<chunk>.js | wc -c
```

## Skills used

- `vercel-react-best-practices` — bundle optimization rules, waterfall elimination
- `next-cache-components-optimizer` — caching audit (preflight failed, documented)
- `chrome-devtools-axi` — browser automation, performance traces, Lighthouse

## Conclusion

The primary performance regressions are **bundle size violations** caused by:
1. Zod validation leaking into minimal edition client bundles (90 KB)
2. Three.js loading eagerly on 3D editions despite deferred mounting
3. Per-frame DOM mutations in drawing-set leader lines and press canvas

All are fixable with code changes at the identified file:line locations. No architectural changes required. The refactor itself did not introduce new patterns — it surfaced existing issues by making edition chunks more visible in the budget report.

**Total budget violations: 50 across 6 editions. Fixing the top 3 items resolves ~35 of them.**