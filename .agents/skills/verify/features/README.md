# Website verification map

Status: DRAFT, not live-verified. Last live proof: none, for every file in this directory. Nothing here has been run in a browser; the browser hold of 2026-10-02 is in force until the captain supplies the chosen browser skill. Read [../SKILL.md](../SKILL.md) first for launch, doctor, evidence and cleanup, and the [verification ledger](../../../../docs/checks/verification-issues.md) for confirmed issues, hypotheses and live-proof gaps. Feature files link to the ledger and do not repeat it.

Base: branch `fm/website-pstack-verification` on `portfolio-3d` at `e271043` (2026-10-02). Surface and Survey are mid-lane (todo.md items 6 and 7); their scene claims are weaker than the others.

## Baseline preconditions

- One instance from `scripts/serve.sh start <port>` on a task-specific port (not 3000, not 3020), on bundled fallback content, with `scripts/doctor.sh <port>` reporting `worth driving`.
- Empty browser profile per feature, the cookie `hr_flavor=<id>` set for edition drives (what `playwright.config.ts` seeds), desktop 1440x900 and the Pixel 7 profile both run.
- No CMS writes, no owner content changes, no deploys, no credential changes, no shared authenticated sessions.

## Driving conventions

- Handles in order: ARIA role and name, route path, `html[data-theme|data-motion|data-scene]`, `[data-scene-poster]`, the `hr.*.prefs` storage key. No coordinates.
- Record the browser's tier signals with every scene proof; no GPU means poster-only proof.
- Reuse `e2e/` as cited evidence of what it asserts; never copy its assertions into a second suite.

## Proof and skip reporting

- Capture the action and the state after it (ARIA snapshot, screenshot, console, network).
- Update a file's `Last live proof:` line only after the real flow ran: date, commit, evidence path.
- Report an unreachable path with the attempted step and unmet precondition; never claim another path covered it.

## Features

Shared behavior:

- [Editions and routing](./editions-and-routing.md): picker, cookie, `?flavor=`, pinned builds, markdown mirrors, static output.
- [Identity and profile](./identity-profile.md): the site identity in text, scenes, metadata and the branding flag.
- [CMS prerequisites and fallback content](./cms-prerequisites.md): what runs without Sanity, what must never be written.
- [Scene, loading and error states](./scene-states.md): poster, tiers, lazy load, pause, failure.
- [Reduced motion, keyboard and accessibility](./motion-and-a11y.md): motion, keyboard, axe, touch, print, layout.

Editions (all eleven live editions in `flavors/registry.ts`):

- [Minimal](./edition-minimal.md), the default.
- [Drawing Set](./edition-drawing-set.md)
- [Control Surface](./edition-surface.md)
- [Timetable](./edition-timetable.md)
- [Field Survey](./edition-survey.md)
- [Press Proof](./edition-press.md)
- [Darkroom](./edition-darkroom.md)
- [Jacquard](./edition-jacquard.md)
- [Maquette](./edition-maquette.md)
- [Flight Plan](./edition-mission.md)
- [Calibre](./edition-calibre.md)
