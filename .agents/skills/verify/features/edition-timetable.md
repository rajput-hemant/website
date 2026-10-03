# Timetable edition

Status: PARTIALLY live-verified. Last live proof: Live proof 2026-10-02 at `82ec737`, evidence `$FM_DATA/website-browser-verification/evidence/`; exercised (shared shell only): route sweep (13 paths, desktop 1440 and Pixel 7 412, `evidence/sweep/`), command menu by Ctrl+K and Search button (`evidence/shared/*-cmd-scene.tsv`), system theme dark and light plus header toggle or Customize (`evidence/shared/theme-*`), Tab order with skip link first (`keyboard-tab.tsv`), `prefers-reduced-motion` (`reduced-motion.tsv`). NOT exercised: edition-specific controls and scene interaction beyond a live canvas being present. Open problems and gaps: [verification ledger](../../../../docs/verification/verification-issues.md) (shared entries WEB-G1 to WEB-G11 apply to every edition; entries naming this edition are in its Surface field).

Timetable (registry id `timetable`) is one of the eleven live editions: the same content and routes as every other edition, told in its own visual language. Spec: `docs/flavors/timetable.md`. Home draws roles as a transit network; plate and handle are flap-atlas glyphs.

## Sub-features

- `timetable-entry` reaches the edition from the picker, the `hr_flavor` cookie and `?flavor=timetable`.
- `timetable-routes` renders every public route with one visible h1, plus the edition's own 404.
- `timetable-theme` flips light and dark through Customize only (no header control) and keeps the choice across a reload under `hr.tt.prefs`.
- `timetable-customize` opens the settings surface: Customize group "Theme", dark option "Night".
- `timetable-command` opens the command menu from the keyboard (desktop) and from its Search button, filters, and navigates.
- `timetable-scene` shows the poster first, the live scene when the tier allows, and the poster again when the scene is off. Scene: R3F through the shared loader and session root (viewport mode) with `SceneMonitor`; flap-atlas glyphs, pylon, ticket, turntable.
- `timetable-identity` names the profile everywhere it appears (see [identity-profile.md](identity-profile.md)).
- `timetable-motion-a11y` honors reduced motion, keyboard operation and focus order (see [motion-and-a11y.md](motion-and-a11y.md)).

## How to get to it (user POV)

- Open `/flavors`, choose the card named `Timetable`; the site then serves it at `/`.
- Visit any path with the cookie `hr_flavor=timetable` set.
- Add `?flavor=timetable` to any URL; the proxy sets the cookie and redirects to the clean URL.
- On a build pinned with `NEXT_PUBLIC_FLAVOR=timetable` there is no picker and `/f/<other>/...` redirects to the clean path (see [editions-and-routing.md](editions-and-routing.md)).

## Driving it with chrome-devtools-axi (authorized 2026-10-02)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving` for an instance started by `scripts/serve.sh start 3071`.
- Empty browser profile with only the cookie `hr_flavor=timetable` on `127.0.0.1`.
- Desktop 1440x900 and the Pixel 7 profile are both required; run each recipe at both.
- Existing coverage to cite, not duplicate: shared shell (projects `desktop-timetable`, `mobile-timetable`).

- **Entry.** Open `/flavors`, activate `Timetable`. The URL becomes `/`, the page has exactly one visible `h1`, and the cookie `hr_flavor` equals `timetable`. Evidence: ARIA snapshot, screenshot, cookie list.
- **Routes.** Visit `/`, `/work`, `/projects`, `/now`, `/resume`, `/ask`, `/lab`, `/lab/signature-field`, `/owner`; `/projects/<slug>`, `/changelog` and `/about` are 308 redirects (to `/projects`, `/now#log`, `/work`; verified 2026-10-02) and land on a 200 page (Minimal serves `/changelog` itself with its own h1). Each landing page answers 200 with one visible `h1` and no console error (the only message seen is the `THREE.Clock` deprecation warning, WEB-C8; the counter makes no request without Sanity, WEB-H3). Evidence: status and h1 text per route, console log.
- **Edition 404.** Visit `/does-not-exist`. The response is 404 and the page is this edition's own (its chrome, not the bare global page). Evidence: status, screenshot.
- **Theme.** Use the theme control named above, then reload. `html[data-theme]` flips to `dark`, survives the reload, and `localStorage["hr.tt.prefs"]` records it. Flip back. Evidence: attribute before and after, stored prefs JSON, screenshots in both themes at both widths.
- **Customize.** Open the settings surface. Its controls are reachable by Tab in reading order, Escape closes it and returns focus to the trigger. Evidence: focus order transcript.
- **Command menu.** On desktop press Control+K: a dialog opens with its search field focused; type a page name; Enter navigates; Escape closes. On both sizes the Search button opens it. Evidence: ARIA snapshot of the open dialog, final URL.
- **Scene.** At each viewport record the tier signals first (WebGL2, `navigator.deviceMemory`, `matchMedia("(pointer: coarse)")`, `html[data-scene]`). With scene `auto` on a WebGL2 browser, the slot starts with `[data-scene-poster]`, then the poster reads `data-scene-poster="hidden"` once a frame is live. Set scene to `off` in Customize (where offered) and confirm the poster returns and no three.js chunk is requested. Evidence: attribute transitions, network list filtered to chunks, screenshots. Without a GPU this proves only the poster state; say so.
- **Reduced motion.** Emulate `prefers-reduced-motion: reduce`, reload: `html[data-motion]` is `off`, nothing animates endlessly, content is visible, the scene (if any) uses its reduced path. Evidence: attribute, a short animation-count read, screenshots.

## Gotchas

- T2 DPR dropped to 1.25 (check flap text sharpness on retina), slot extras not built, inspect controls not wired (todo.md).
- Without Sanity the visitor counter hides itself and `/api/visits` answers 503 on purpose; do not "fix" that during a drive. The e2e helper's claim that this keeps `networkidle` unreachable may be stale (ledger WEB-H3); `gotoSettled` in `e2e/support/site.ts` bounds the wait either way.
- Starting state matters: a stale `hr_flavor` cookie or `hr.tt.prefs` value from an earlier drive changes what the first screen shows.
- A headless browser without GPU cannot prove the 3D. Record the tier, and report the scene feature as poster-only proof if that is all it showed.
- The e2e suite for this edition passing is not evidence for any step above that the suite does not assert; check `playwright.config.ts` for what actually runs.
