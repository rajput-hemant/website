# Docs index

Live docs only. Superseded docs are in `archive/` (see `archive/README.md`). Dated names (`name-YYYY-MM-DD.md`) are snapshots: the newest date is the current one. Undated names are living docs, kept current in place; each one's header says when it was last verified against the code.

## Start here

| Doc                                   | What it covers                                                                                                                                      |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handoff/cloud-handoff-2026-09-27.md` | The current handoff: owner rules, what's done, what's agreed next                                                                                   |
| `handoff/open-items-2026-09-27.md`    | Every open item carried from the archived docs, what landed since, the work in flight, and the findings of the latest refresh                       |
| `flavors.md`                          | The editions architecture, its rules, the toolchain, the performance and accessibility contracts, and how to add an edition. The most important doc |

## In flight (2026-09-27)

- **Darkroom** and **Jacquard** editions are being built now; their design docs will join the table below when they land. Until then the mocks in `mocks/` are the spec.
- **Sound palettes** (Press and Timetable first) and the **performance fixes** from the performance audit are in progress. See `handoff/open-items-2026-09-27.md`.

## Architecture and runbooks

| Doc                | Last verified | What it covers                                                                                                     |
| ------------------ | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| `architecture.md`  | `b50faeb`     | Decisions: static rendering, the data contract, prefs, interaction gating, the route map, `/ask`, markdown mirrors |
| `sanity.md`        | `b50faeb`     | Sanity setup, seeding, Studio, revalidation                                                                        |
| `ask.md`           | `b50faeb`     | The `/ask` runbook: chat model, moderation, limits, environment                                                    |
| `m2-scene-spec.md` | `b50faeb`     | The Drawing Set 3D scene contract, and the shared scene loader, clock, store and tiers                             |
| `prose-notes.md`   | `b50faeb`     | Facts in the fallback content still to confirm                                                                     |

## Edition design docs

| Doc               | Last verified                  | Edition                                                    |
| ----------------- | ------------------------------ | ---------------------------------------------------------- |
| `architecture.md` | `b50faeb`                      | Minimal (sections 3, 4 and 9: prefs, interaction, counter) |
| `design.md`       | Not re-verified (being edited) | Drawing Set                                                |
| `surface.md`      | `b50faeb`                      | Control Surface                                            |
| `timetable.md`    | `b50faeb`                      | Timetable                                                  |
| `survey.md`       | Not re-verified (being edited) | Field Survey                                               |
| `press.md`        | `b50faeb`                      | Press Proof                                                |
| `mission.md`      | `3ea9661`                      | Flight Plan                                                |
| `maquette.md`     | `4a80678`                      | Maquette                                                   |
| `calibre.md`      | `f57e6f1`                      | Calibre                                                    |
| `mocks/`          | Design inputs, not maintained  | The 10 design mocks (HTML, nine with notes) and `BRIEF.md` |

## Audits (dated snapshots)

| Doc                                        | Base commit        | What it covers                                                                                                                                 |
| ------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `handoff/improvements-audit-2026-09-27.md` | `b71fb63`          | Design, animation, sound and 3D backlog for all six editions                                                                                   |
| `handoff/performance-audit-2026-09-27.md`  | `f250b8d`          | Bundle, budget and trace findings                                                                                                              |
| `redundancy-audit-2026-09-27.md`           | `2a5f42a..b71fb63` | Shared vs edition code after the refactor; the inventory is `redundancy-inventory.tsv` (regenerate with `bun scripts/redundancy-inventory.ts`) |
