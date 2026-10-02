# Control Surface edition

Status: DRAFT, not live-verified. Last live proof: none. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (shared entries WEB-G1 to WEB-G11 apply to every edition; entries naming this edition are in its Surface field).

Control Surface (registry id `surface`) is one of the eleven live editions: the same content and routes as every other edition, told in its own visual language. Spec: `docs/surface.md`. Faceplate controls are real controls; the theme control is a switch, not a button.

## Sub-features

- `surface-entry` reaches the edition from the picker, the `hr_flavor` cookie and `?flavor=surface`.
- `surface-routes` renders every public route with one visible h1, plus the edition's own 404.
- `surface-theme` flips light and dark through header switch named "Black edition (dark theme)", also on phones and keeps the choice across a reload under `hr.cs.prefs`.
- `surface-customize` opens the settings surface: no Customize panel (e2e shape `customize: null`).
- `surface-command` opens the command menu from the keyboard (desktop) and from its Search button, filters, and navigates.
- `surface-scene` shows the poster first, the live scene when the tier allows, and the poster again when the scene is off. Scene: plain three.js knob with its own frame loop (`flavors/surface/lib/knob/frame-loop.ts`); shares only tier detection. Wave 4 Surface is an in-progress lane, so scene code is moving.
- `surface-identity` names the profile everywhere it appears (see [identity-profile.md](identity-profile.md)).
- `surface-motion-a11y` honors reduced motion, keyboard operation and focus order (see [motion-and-a11y.md](motion-and-a11y.md)).

## How to get to it (user POV)

- Open `/flavors`, choose the card named `Control Surface`; the site then serves it at `/`.
- Visit any path with the cookie `hr_flavor=surface` set.
- Add `?flavor=surface` to any URL; the proxy sets the cookie and redirects to the clean URL.
- On a build pinned with `NEXT_PUBLIC_FLAVOR=surface` there is no picker and `/f/<other>/...` redirects to the clean path (see [editions-and-routing.md](editions-and-routing.md)).

## Driving it with the chosen browser skill (not supplied; hold in force)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving` for an instance started by `scripts/serve.sh start 3071`.
- Empty browser profile with only the cookie `hr_flavor=surface` on `127.0.0.1`.
- Desktop 1440x900 and the Pixel 7 profile are both required; run each recipe at both.
- Existing coverage to cite, not duplicate: shared shell (`editions`, `a11y`, `command-dialog`; projects `desktop-surface`, `mobile-surface`).

- **Entry.** Open `/flavors`, activate `Control Surface`. The URL becomes `/`, the page has exactly one visible `h1`, and the cookie `hr_flavor` equals `surface`. Evidence: ARIA snapshot, screenshot, cookie list.
- **Routes.** Visit `/`, `/work`, `/projects`, `/projects/infinitunes`, `/now`, `/changelog`, `/about`, `/resume`, `/ask`, `/lab`, `/lab/signature-field`, `/owner`. Each answers 200 with one visible `h1` and a clean console (no Sanity means the counter makes no request, see ledger WEB-H3). Evidence: status and h1 text per route, console log.
- **Edition 404.** Visit `/does-not-exist`. The response is 404 and the page is this edition's own (its chrome, not the bare global page). Evidence: status, screenshot.
- **Theme.** Use the theme control named above, then reload. `html[data-theme]` flips to `dark`, survives the reload, and `localStorage["hr.cs.prefs"]` records it. Flip back. Evidence: attribute before and after, stored prefs JSON, screenshots in both themes at both widths.
- **Customize.** Open the settings surface. Its controls are reachable by Tab in reading order, Escape closes it and returns focus to the trigger. Evidence: focus order transcript.
- **Command menu.** On desktop press Control+K: a dialog opens with its search field focused; type a page name; Enter navigates; Escape closes. On both sizes the Search button opens it. Evidence: ARIA snapshot of the open dialog, final URL.
- **Scene.** At each viewport record the tier signals first (WebGL2, `navigator.deviceMemory`, `matchMedia("(pointer: coarse)")`, `html[data-scene]`). With scene `auto` on a WebGL2 browser, the slot starts with `[data-scene-poster]`, then the poster reads `data-scene-poster="hidden"` once a frame is live. Set scene to `off` in Customize (where offered) and confirm the poster returns and no three.js chunk is requested. Evidence: attribute transitions, network list filtered to chunks, screenshots. Without a GPU this proves only the poster state; say so.
- **Reduced motion.** Emulate `prefers-reduced-motion: reduce`, reload: `html[data-motion]` is `off`, nothing animates endlessly, content is visible, the scene (if any) uses its reduced path. Evidence: attribute, a short animation-count read, screenshots.

## Gotchas

- todo.md item 6 (`lane/w4-surface`) is open: bench refactor and parts library done, home placement edits pending; do not treat the scene as stable.
- Without Sanity the visitor counter hides itself and `/api/visits` answers 503 on purpose; do not "fix" that during a drive. The e2e helper's claim that this keeps `networkidle` unreachable may be stale (ledger WEB-H3); `gotoSettled` in `e2e/support/site.ts` bounds the wait either way.
- Starting state matters: a stale `hr_flavor` cookie or `hr.cs.prefs` value from an earlier drive changes what the first screen shows.
- A headless browser without GPU cannot prove the 3D. Record the tier, and report the scene feature as poster-only proof if that is all it showed.
- The e2e suite for this edition passing is not evidence for any step above that the suite does not assert; check `playwright.config.ts` for what actually runs.
