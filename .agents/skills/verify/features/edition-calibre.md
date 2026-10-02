# Calibre edition

Status: DRAFT, not live-verified. Last live proof: none. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (shared entries WEB-G1 to WEB-G11 apply to every edition; entries naming this edition are in its Surface field).

Calibre (registry id `calibre`) is one of the eleven live editions: the same content and routes as every other edition, told in its own visual language. Spec: `docs/calibre.md`. Beat-burst tier drop is part of the landed inspect work.

## Sub-features

- `calibre-entry` reaches the edition from the picker, the `hr_flavor` cookie and `?flavor=calibre`.
- `calibre-routes` renders every public route with one visible h1, plus the edition's own 404.
- `calibre-theme` flips light and dark through header button "Show the caseback (dark theme)" and "Show the dial (light theme)", desktop only and keeps the choice across a reload under `hr.cb.prefs`.
- `calibre-customize` opens the settings surface: Customize group "Light", dark option "Caseback".
- `calibre-command` opens the command menu from the keyboard (desktop) and from its Search button, filters, and navigates.
- `calibre-scene` shows the poster first, the live scene when the tier allows, and the poster again when the scene is off. Scene: scene loader and root; the Calibre HR-26 movement is the inspect-controls pilot (todo.md item 1, landed).
- `calibre-identity` names the profile everywhere it appears (see [identity-profile.md](identity-profile.md)).
- `calibre-motion-a11y` honors reduced motion, keyboard operation and focus order (see [motion-and-a11y.md](motion-and-a11y.md)).

## How to get to it (user POV)

- Open `/flavors`, choose the card named `Calibre`; the site then serves it at `/`.
- Visit any path with the cookie `hr_flavor=calibre` set.
- Add `?flavor=calibre` to any URL; the proxy sets the cookie and redirects to the clean URL.
- On a build pinned with `NEXT_PUBLIC_FLAVOR=calibre` there is no picker and `/f/<other>/...` redirects to the clean path (see [editions-and-routing.md](editions-and-routing.md)).

## Driving it with the chosen browser skill (not supplied; hold in force)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving` for an instance started by `scripts/serve.sh start 3071`.
- Empty browser profile with only the cookie `hr_flavor=calibre` on `127.0.0.1`.
- Desktop 1440x900 and the Pixel 7 profile are both required; run each recipe at both.
- Existing coverage to cite, not duplicate: shared shell (projects `desktop-calibre`, `mobile-calibre`).

- **Entry.** Open `/flavors`, activate `Calibre`. The URL becomes `/`, the page has exactly one visible `h1`, and the cookie `hr_flavor` equals `calibre`. Evidence: ARIA snapshot, screenshot, cookie list.
- **Routes.** Visit `/`, `/work`, `/projects`, `/projects/infinitunes`, `/now`, `/changelog`, `/about`, `/resume`, `/ask`, `/lab`, `/lab/signature-field`, `/owner`. Each answers 200 with one visible `h1` and a clean console (no Sanity means the counter makes no request, see ledger WEB-H3). Evidence: status and h1 text per route, console log.
- **Edition 404.** Visit `/does-not-exist`. The response is 404 and the page is this edition's own (its chrome, not the bare global page). Evidence: status, screenshot.
- **Theme.** Use the theme control named above, then reload. `html[data-theme]` flips to `dark`, survives the reload, and `localStorage["hr.cb.prefs"]` records it. Flip back. Evidence: attribute before and after, stored prefs JSON, screenshots in both themes at both widths.
- **Customize.** Open the settings surface. Its controls are reachable by Tab in reading order, Escape closes it and returns focus to the trigger. Evidence: focus order transcript.
- **Command menu.** On desktop press Control+K: a dialog opens with its search field focused; type a page name; Enter navigates; Escape closes. On both sizes the Search button opens it. Evidence: ARIA snapshot of the open dialog, final URL.
- **Scene.** At each viewport record the tier signals first (WebGL2, `navigator.deviceMemory`, `matchMedia("(pointer: coarse)")`, `html[data-scene]`). With scene `auto` on a WebGL2 browser, the slot starts with `[data-scene-poster]`, then the poster reads `data-scene-poster="hidden"` once a frame is live. Set scene to `off` in Customize (where offered) and confirm the poster returns and no three.js chunk is requested. Evidence: attribute transitions, network list filtered to chunks, screenshots. Without a GPU this proves only the poster state; say so.
- **Reduced motion.** Emulate `prefers-reduced-motion: reduce`, reload: `html[data-motion]` is `off`, nothing animates endlessly, content is visible, the scene (if any) uses its reduced path. Evidence: attribute, a short animation-count read, screenshots.

## Gotchas

- hover a card to enlarge the drawn jewel on the no-WebGL poster and crowded jewel tags at 390 are open (todo.md).
- Without Sanity the visitor counter hides itself and `/api/visits` answers 503 on purpose; do not "fix" that during a drive. The e2e helper's claim that this keeps `networkidle` unreachable may be stale (ledger WEB-H3); `gotoSettled` in `e2e/support/site.ts` bounds the wait either way.
- Starting state matters: a stale `hr_flavor` cookie or `hr.cb.prefs` value from an earlier drive changes what the first screen shows.
- A headless browser without GPU cannot prove the 3D. Record the tier, and report the scene feature as poster-only proof if that is all it showed.
- The e2e suite for this edition passing is not evidence for any step above that the suite does not assert; check `playwright.config.ts` for what actually runs.
