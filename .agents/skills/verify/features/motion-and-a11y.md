# Reduced motion, keyboard and accessibility

Status: PARTIALLY live-verified. Last live proof: Live proof 2026-10-02 at `82ec737`, evidence `$FM_DATA/website-browser-verification/evidence/`; exercised: `html[data-motion=off]` and no infinite CSS animation under `--force-prefers-reduced-motion` in all eleven, skip link first Tab stop with visible outline in all eleven, no horizontal overflow on 13 paths x 11 editions at 1440 and 412. Follow-up spot checks 2026-10-02 at `cc3e42b` (session `portfolio-verified-ui-fixes`, no new screenshots): no overflow at 390 on Minimal and Press 404s, no overflow at 768 on Minimal 404 and `/work`, Ctrl+K opens the Minimal command menu focused in the combobox and Escape closes it. NOT exercised: axe, full 768 sweep, CLS, print, touch targets, scene reduced path. Open problems and gaps: [verification ledger](../../../../docs/verification/verification-issues.md) (entries tagged `a11y`).

Contract from `docs/flavors/README.md`: all content is server-rendered DOM text; 3D, cursors and sound are enhancements; canvases, posters and decorative chrome are `aria-hidden`; reduced motion is honored from the OS plus a motion switch in each edition's prefs and in the command menu, and never falls to zero feedback; the skip link is first in tab order; targets and focus are keyboard-operable. `html[data-motion]` is `off` when the OS asks for reduced motion.

## Sub-features

- `a11y-reduced-motion` turns off Lenis, the cursor follower, reveals and endless loops under `prefers-reduced-motion: reduce`, while leaving content visible and colour or light feedback intact.
- `a11y-keyboard` operates the skip link, header and mobile menu, Customize, the command menu and every edition control without a pointer.
- `a11y-focus` keeps visible focus, returns it to the trigger when a dialog or menu closes, and traps and releases it correctly.
- `a11y-axe` has no serious or critical axe violations on any route in light and dark.
- `a11y-names` gives every control an accessible name that says where it takes you (the theme toggles are named per state).
- `a11y-touch` removes hover-only affordances, the cursor and Lenis on touch devices.
- `a11y-print` hides chrome and glyphs in print (Minimal `/resume` asserted; other editions open).
- `a11y-layout` has no horizontal overflow and CLS at or under 0.05 on desktop (1440) and phone widths.

## How to get to it (user POV)

- Press Tab from the top of any page; press Control+K (desktop; `/` also works in Minimal); open Customize; use the mobile menu on a phone.
- Switch the OS or browser to reduce motion, reload.
- Resize to 390 and 768 wide; print `/resume`.

## Driving it with chrome-devtools-axi (authorized 2026-10-02)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving`; empty profile with the cookie `hr_flavor=<id>`; run per edition at desktop 1440x900 and the Pixel 7 profile.
- Existing coverage to cite, not duplicate: `e2e/a11y.spec.ts` (axe, light and dark, reduced motion on, every route, all editions), `e2e/motion.spec.ts` (Minimal: reduced motion, touch, fine pointer), `e2e/command-dialog.spec.ts` (command dialog contracts, nine shared editions), `e2e/navigation.spec.ts` (skip link, mobile menu, Minimal), `e2e/drawing-set.spec.ts` (768 overflow, Drawing Set only), `e2e/print.spec.ts` (Minimal).

- **Skip link.** Tab once from a fresh load: the first focus lands on the skip link; activating it moves focus to `main`. Evidence: focus transcript, ARIA snapshot. Cited e2e covers Minimal only.
- **Reduced motion.** Emulate reduce, reload an edition's home and `/work`: `html[data-motion]` is `off`, no running infinite animation, all content visible without scrolling reveals. Evidence: attribute, `document.getAnimations()` count excluding finite ones, screenshots. The shared-shell editions have no reduced-motion spec beyond axe (ledger WEB-G4).
- **Keyboard tour.** Tab through the header, Customize (open, change theme with arrow keys, Escape), command menu (Control+K, filter, Enter, Escape returns focus to the trigger), footer. No keyboard trap, visible focus ring at every stop. Evidence: ordered focus list with accessible names.
- **Phone.** In the Pixel 7 profile open the menu button, navigate, close with Escape and the close button; no cursor follower and no Lenis. Evidence: ARIA snapshots, absence checks.
- **Overflow and CLS.** At 390 and 768 wide, `document.documentElement.scrollWidth <= innerWidth` on `/`, `/work`, `/projects`, `/lab`; record layout-shift entries on `/work` under reduced motion at 390 (ledger WEB-H1). Evidence: numbers per route.
- **Axe.** Run only if the chosen skill can; otherwise cite the e2e result and say the live run is a gap. Evidence: violation list, empty or itemized.

## Gotchas

- The command menu's keyboard shortcut is desktop only (Control+K everywhere; `/` is asserted for Minimal only). Every edition has a Search button, and phones open it from the mobile menu.
- The command menu's Base UI Dialog sets no `aria-modal`; scroll containment relies on the body lock (todo.md follow-up).
- Darkroom hides frame tags after idle: wait for animations to settle before reading the page (`waitForAnimationsSettled`).
- axe passing is not a keyboard test and a keyboard pass is not a screen-reader test. Report which one ran.
- "No horizontal overflow" is only checked at 768 for Drawing Set in e2e; every other edition and width is open.
