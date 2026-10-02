# Drawing Set edition

Status: DRAFT, not live-verified. Last live proof: none. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (shared entries WEB-G1 to WEB-G11 apply to every edition; entries naming this edition are in its Surface field).

Drawing Set (registry id `drawing-set`) is one of the eleven live editions: the same content and routes as every other edition, told in its own visual language. Spec: `docs/drawing-set.md, docs/design.md, docs/m2-scene-spec.md`. Sheet index nav; `/now` is a log with `#log-<year>` drawers; `/changelog` redirects into `/now`.

## Sub-features

- `drawing-set-entry` reaches the edition from the picker, the `hr_flavor` cookie and `?flavor=drawing-set`.
- `drawing-set-routes` renders every public route with one visible h1, plus the edition's own 404.
- `drawing-set-theme` flips light and dark through Customize and the command menu and keeps the choice across a reload under `hr.ds.prefs`.
- `drawing-set-customize` opens the settings surface: Customize panel (theme persisted in `hr.ds.prefs`).
- `drawing-set-command` opens the command menu from the keyboard (desktop) and from its Search button, filters, and navigates.
- `drawing-set-scene` shows the poster first, the live scene when the tier allows, and the poster again when the scene is off. Scene: R3F desk and plan chest through the shared loader (`useSceneMount`), drei `PerformanceMonitor` in `world.tsx`; six tracked views and seven glyph kinds.
- `drawing-set-identity` names the profile everywhere it appears (see [identity-profile.md](identity-profile.md)).
- `drawing-set-motion-a11y` honors reduced motion, keyboard operation and focus order (see [motion-and-a11y.md](motion-and-a11y.md)).

## How to get to it (user POV)

- Open `/flavors`, choose the card named `Drawing Set`; the site then serves it at `/`.
- Visit any path with the cookie `hr_flavor=drawing-set` set.
- Add `?flavor=drawing-set` to any URL; the proxy sets the cookie and redirects to the clean URL.
- On a build pinned with `NEXT_PUBLIC_FLAVOR=drawing-set` there is no picker and `/f/<other>/...` redirects to the clean path (see [editions-and-routing.md](editions-and-routing.md)).

## Driving it with the chosen browser skill (not supplied; hold in force)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving` for an instance started by `scripts/serve.sh start 3071`.
- Empty browser profile with only the cookie `hr_flavor=drawing-set` on `127.0.0.1`.
- Desktop 1440x900 and the Pixel 7 profile are both required; run each recipe at both.
- Existing coverage to cite, not duplicate: bespoke: `e2e/drawing-set.spec.ts` (projects `desktop-drawing-set`, `mobile-drawing-set`).

- **Entry.** Open `/flavors`, activate `Drawing Set`. The URL becomes `/`, the page has exactly one visible `h1`, and the cookie `hr_flavor` equals `drawing-set`. Evidence: ARIA snapshot, screenshot, cookie list.
- **Routes.** Visit `/`, `/work`, `/projects`, `/projects/infinitunes`, `/now`, `/changelog`, `/about`, `/resume`, `/ask`, `/lab`, `/lab/signature-field`, `/owner`. Each answers 200 with one visible `h1` and a clean console (no Sanity means the counter makes no request, see ledger WEB-H3). Evidence: status and h1 text per route, console log.
- **Edition 404.** Visit `/does-not-exist`. The response is 404 and the page is this edition's own (its chrome, not the bare global page). Evidence: status, screenshot.
- **Theme.** Use the theme control named above, then reload. `html[data-theme]` flips to `dark`, survives the reload, and `localStorage["hr.ds.prefs"]` records it. Flip back. Evidence: attribute before and after, stored prefs JSON, screenshots in both themes at both widths.
- **Customize.** Open the settings surface. Its controls are reachable by Tab in reading order, Escape closes it and returns focus to the trigger. Evidence: focus order transcript.
- **Command menu.** On desktop press Control+K: a dialog opens with its search field focused; type a page name; Enter navigates; Escape closes. On both sizes the Search button opens it. Evidence: ARIA snapshot of the open dialog, final URL.
- **Scene.** At each viewport record the tier signals first (WebGL2, `navigator.deviceMemory`, `matchMedia("(pointer: coarse)")`, `html[data-scene]`). With scene `auto` on a WebGL2 browser, the slot starts with `[data-scene-poster]`, then the poster reads `data-scene-poster="hidden"` once a frame is live. Set scene to `off` in Customize (where offered) and confirm the poster returns and no three.js chunk is requested. Evidence: attribute transitions, network list filtered to chunks, screenshots. Without a GPU this proves only the poster state; say so.
- **Reduced motion.** Emulate `prefers-reduced-motion: reduce`, reload: `html[data-motion]` is `off`, nothing animates endlessly, content is visible, the scene (if any) uses its reduced path. Evidence: attribute, a short animation-count read, screenshots.

## Gotchas

- home mobile fit, `/ask` slot under the dock on phones, AVIF posters, phones lost MSAA and desktop DPR up to 2 (todo.md).
- Without Sanity the visitor counter hides itself and `/api/visits` answers 503 on purpose; do not "fix" that during a drive. The e2e helper's claim that this keeps `networkidle` unreachable may be stale (ledger WEB-H3); `gotoSettled` in `e2e/support/site.ts` bounds the wait either way.
- Starting state matters: a stale `hr_flavor` cookie or `hr.ds.prefs` value from an earlier drive changes what the first screen shows.
- A headless browser without GPU cannot prove the 3D. Record the tier, and report the scene feature as poster-only proof if that is all it showed.
- The e2e suite for this edition passing is not evidence for any step above that the suite does not assert; check `playwright.config.ts` for what actually runs.
