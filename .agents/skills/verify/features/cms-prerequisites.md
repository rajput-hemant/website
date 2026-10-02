# CMS prerequisites and fallback content

Status: DRAFT, not live-verified. Last live proof: none. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (entries tagged `cms`).

Content comes from Sanity when `NEXT_PUBLIC_SANITY_PROJECT_ID` is set, else from the bundled `content/fallback/` (the build logs `[data] Sanity not configured` once, `lib/data/fallback.ts`). Every Sanity-dependent route handles absence by design: `/api/visits` and `/api/ask` answer 503, `/api/revalidate` answers 500 without its secret, draft-mode enable answers 503 without a read token, `/studio` shows "Sanity is not configured". Verification runs on fallback content. No run writes to a CMS, changes owner content, deploys, or changes credentials; the writers are listed below so nobody triggers one by accident.

## Sub-features

- `cms-fallback` renders every route from bundled content with no network call to Sanity.
- `cms-visits-off` hides the visitor counter and answers `/api/visits` 503 (GET and POST) without a project, Editor token and `ASK_COOKIE_SECRET`.
- `cms-ask-off` closes the ask composer and answers `/api/ask` 503 without Sanity (`askMessages.notConfigured`).
- `cms-owner-off` answers owner sign-in 503 without `ASK_COOKIE_SECRET` and `ASK_OWNER_PASSPHRASE`.
- `cms-draft` answers `/api/draft-mode/enable` 503 without a read token and `/api/draft-mode/disable` with a redirect to `/`.
- `cms-revalidate` answers `/api/revalidate` 500 without `SANITY_REVALIDATE_SECRET` and 401 on a bad signature.
- `cms-studio` shows the unconfigured notice at `/studio`.
- `cms-live` (needs a disposable dataset, not available) covers real content: seeded documents, drafts, threads, replies, moderation, counts.

## How to get to it (user POV)

- Load any page with no `.env*` files present.
- Look at the footer for the visitor counter; open `/ask` and try to send a message; open `/owner` and try to sign in; open `/studio`.

## Driving it with the chosen browser skill (not supplied; hold in force)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving`; its checks (no env files, no Sanity or ask variables, `/api/visits` is 503) are exactly this feature's safety gate.
- Existing coverage to cite, not duplicate: `e2e/navigation.spec.ts` (counter hides on 503, shows when `/api/visits` is mocked), `e2e/ask.spec.ts` (Minimal only; routes mocked with `page.route`, so it proves the UI, not the server), `e2e/markdown.spec.ts`.

- **Fallback render.** `curl -s -o /dev/null -w '%{http_code}\n'` on the twelve routes in the edition files returns 200 and the server log shows the single fallback warning. Evidence: statuses, `server.log`.
- **Counter off.** `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3071/api/visits` is 503; the page footer shows no counter. Evidence: status, ARIA snapshot of the footer. Never POST to `/api/visits` against a configured project: it increments a stored count.
- **Ask off.** On `/ask` the composer is closed or answers with the not-configured message; no thread appears. Evidence: ARIA snapshot, response. Never submit against a configured project.
- **Owner off.** On `/owner` submitting the form shows an error, not a session. Evidence: response and ARIA snapshot.
- **Draft and revalidate.** `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3071/api/draft-mode/enable` is 503 and `-X POST http://127.0.0.1:3071/api/revalidate` is 500. Evidence: statuses.
- **Studio.** `/studio` renders the heading "Sanity is not configured". Evidence: ARIA snapshot.
- **Live content.** Not driven. It needs a disposable dataset and a read-only token the captain supplies; no write token, no seed, no moderation, no visit POST. Recorded as a gap.

## Gotchas

- Any `.env.local` in the checkout turns the whole drive into a configured-CMS run. Doctor refuses it; do not bypass doctor.
- The write paths when configured: `POST /api/visits` (counter increment), `POST /api/ask` and the reply routes, `/api/ask/moderate*` (owner), `bun run seed` (replaces every seeded document), `bun run typegen` (reads the project). None belongs in a verification run.
- `docs/sanity.md` and `docs/flavors.md` name project `y9f5m131`; `docs/handoff/todo.md` names a new project `mfx2gwza` that still needs seeding. Treat both as unverified until the owner confirms (ledger WEB-C1).
- With Sanity configured, a failed query fails the build instead of falling back (`docs/sanity.md`).
