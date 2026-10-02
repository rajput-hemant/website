# Drawing Set

The architect's drawing-set edition (`flavors/drawing-set`, `app/f/drawing-set`). Its scene contract is `m2-scene-spec.md` (the desk, the slot, the tags); the visual language is `design.md`. This page holds what the Wave 4 slices added.

## 3D: tracked views and glyphs

The edition runs on the shared viewport session (`lib/scene/session.tsx`): one fixed canvas, the slot's desk as view 0, and one drei `View` per `[data-scene-view]` placeholder. `components/scene/scene-root.tsx` registers the views in `components/scene/views/index.tsx`. At most four views are live on a page, the slot included, in document order; a placeholder past the cap, or with no view, keeps its poster.

- **Placeholders.** `components/site/scene-view.tsx` (`SceneView`) renders the box, its `data-*` inputs and the poster. Posters are server-rendered SVG: `view-posters.tsx` for the sized views, `glyph-posters.tsx` for the glyphs, `scene-posters.tsx` (`StackPoster`) for the stack. They hold the box (CLS 0), stay at T0 and fade once the view has drawn.
- **Views are factories** (`views/kit.tsx`): `createX()` returns `{ group, aim, frame, bind }` and `TrackedView` draws it through its own orthographic camera in CSS pixels (1 world unit = 1px). `frame` uses the damped `approach` from `ViewFrame`, so the clock sleeps once a view settles. Reduced motion draws them still or snapped.

| View              | Where                               | What it does                                                                                                             |
| ----------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `scale` (H2)      | home, under the hero dimension      | Architect's scale on the dimension; drag or click turns it to one of three faces (years, months, plain 10px)             |
| `stack` (J1)      | project view B                      | Exploded axonometric of the stack; slabs part on scroll, a Stack schedule row (`stack:<i>`) redlines and slides its slab |
| `year-scale` (W1) | work, the year rail (lg)            | Sticky scale beside the year links, turning with the active year                                                         |
| `dividers` (B1)   | about, the notes gutter (lg)        | Dividers that step down the General notes with scroll                                                                    |
| `piles` (N2)      | now, the year index (lg)            | A pile of sheets per year (one per entry); hover lifts, the category filter redlines                                     |
| `flight` (K1)     | ask, over the composer and the slot | A sent RFI folds off the composer and flies to the tray (`views/flight-bus.ts`); no tray or no motion: it drops in       |
| `glyph-a/b/c`     | see below                           | Small objects that answer to the nearest `[data-glyph-host]`                                                             |

### Glyphs (`views/glyph-view.ts`, `site/scene-glyph.tsx`)

`<SceneGlyph kind slot>` places a glyph. `slot` picks one of three ids (`glyph-a`, `-b`, `-c`) because the session tracks views by id, so a page uses each at most once. A glyph is driven by its host element: pointer or focus lifts it, a click steps it, a form submit turns the dial, `aria-invalid` shakes it, and the scene's active item (`data-scene-item` on the host) locks the pin. `data-press` sets when a stamp presses ("hover" while pointed at, "enter" once as it scrolls into view, otherwise on click).

| Kind      | Where                                                                                                          | Behaviour                                                                     |
| --------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `sheet`   | home, the first two selected sheets (H3)                                                                       | The title block lifts 0.12 and the sheet tilts 4 degrees                      |
| `stamp`   | projects legend (P3), about copy email (B2, with an ink pad), answered threads in the ask feed (K2, first two) | Presses on hover, click or scroll-in; the sound stays on the existing click   |
| `pin`     | work, the first two roles (W2)                                                                                 | The links straighten (lock) as the role goes active; hover spins the pin      |
| `clip`    | an RFI thread page (R2)                                                                                        | The inner loop opens 15 degrees on hover                                      |
| `solid`   | lab study cards, up to three (L2)                                                                              | The study's solid turns at 0.6 rad/s only while hovered                       |
| `plotter` | resume Print button (U2)                                                                                       | The carriage steps along its rail on a click, never delaying `window.print()` |
| `dial`    | owner sign-in (O2)                                                                                             | A notch per submit; shakes back on a failed attempt                           |

Deferred (see `handoff/todo.md`): P2 (the register preview's mini sheet), S2 (the study page's drawer glyph, since `/lab/[slug]` has no slot), S1 (the view cube, since the experiment's camera belongs to the shared lab scene), and a 3D stamp for every answered thread past the first two.

## Inspect controls (wired)

Zoom and 360 degree turn from `lib/scene/inspect.ts` (recipe: "Inspect controls" in `m2-scene-spec.md`) on two objects:

- **The home desk and chest** (view 0, the hero): the eye orbits the desk, so a drag, pinch, ctrl/cmd + scroll or the keyboard twin turns it all the way round, tips it 0.6 radian either way and zooms 0.8 to 1.8 (`World` reads the pose off a stand-in object in `createWorld`, since the desk is instanced linework and nothing turns). This replaces the old clamped drag orbit and the lab's free turntable drag (the lab desk now orbits like every other route); a route change resets the viewer's turn and zoom to the page's pose. Hover leaders, tags and part clicks are unchanged (a drag does not click). The keyboard twin and hint sit beside the host in `scene-loader.tsx`.
- **The `stack` axonometric** (View B on a project page): the same inspect drives the view's `aim` (yaw about the stack, pitch -0.4 to 0.6) and scales its group (0.8 to 2); `site/inspect-view.tsx` renders the placeholder with the keyboard twin and hint beside it.

Skipped: the `scale` view (a 36px strip that already turns on click or drag), the `solid` glyph on the lab cards (32px) and the list glyphs and strips.

## Motion

Every view and glyph is damped through `approach`, so an idle page draws zero frames and a hover or click settles back to zero. Reduced motion keeps the redline and the click response but drops tilts, lifts, spins and flights.
