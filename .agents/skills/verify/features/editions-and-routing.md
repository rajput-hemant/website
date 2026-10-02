# Editions and routing

Status: PARTIALLY live-verified. Last live proof: Live proof 2026-10-02 at `82ec737`, evidence `$FM_DATA/website-browser-verification/evidence/`; exercised: picker lists eleven editions, card click sets the edition, cookie-keyed route sweep over all eleven (curl and browser), 308 redirects `/about`->`/work`, `/projects/<slug>`->`/projects`, `/changelog`->`/now#log`. NOT exercised: `?flavor=` header check, mirrors/`Accept: text/markdown`, pinned build. Open problems and gaps: [verification ledger](../../../../docs/checks/verification-issues.md) (entries tagged `routing`).

The site serves one of eleven editions per visitor. The picker at `/flavors` sets the `hr_flavor` cookie; `proxy.ts` rewrites every page path to `/f/<edition>/<path>`; a build pinned with `NEXT_PUBLIC_FLAVOR` has one edition and no picker. Public URLs never name the edition. Rules live in `lib/flavor-routing.ts` and are unit-tested in `lib/__tests__`; this map covers what only a running server shows.

## Sub-features

- `routing-picker` shows eleven live cards (no future editions remain) at `/` for a cookieless first visit.
- `routing-cookie` serves the chosen edition on every path and keeps it across navigation.
- `routing-query` sets the edition with `?flavor=<id>` and redirects to the clean URL, which also works with JavaScript off.
- `routing-deeplink` gives a cookieless deep link (any path except `/`) the default edition, Minimal.
- `routing-pinned` (needs a separate build with `NEXT_PUBLIC_FLAVOR=<id>`) removes the picker, ignores the cookie and `?flavor=`, redirects `/f/<other>/<path>` to `/<path>` with 307, and answers `/flavors` with the edition's 404.
- `routing-mirrors` serves markdown mirrors: `/<page>.md`, `/md/<slug>`, and the page URL itself when `Accept` prefers `text/markdown`; unknown mirrors are 404 plain text.
- `routing-static` keeps every public route prerendered (no per-request rendering).

## How to get to it (user POV)

- Open `/` in a profile with no cookies.
- Open `/work` (or any path) in a profile with no cookies.
- Open `/?flavor=press` or `/projects?flavor=calibre`.
- Request `/index.md`, `/work.md`, `/llms.txt`, `/sitemap.xml`, `/robots.txt`, or send `Accept: text/markdown` to `/work`.
- Choose "Change edition" in an edition's footer.

## Driving it with chrome-devtools-axi (authorized 2026-10-02)

Preconditions:

- `scripts/doctor.sh 3071` printed `worth driving`; empty profile for each step; HTTP steps may use `curl` against the instance.
- Existing coverage to cite, not duplicate: `e2e/static-routes.spec.ts` (static output), `e2e/markdown.spec.ts` (mirrors, llms.txt, sitemap, robots, Accept negotiation, desktop project only).

- **Picker.** Load `/` with no cookie. The page is the picker: one `h1` reading "One portfolio, told in several editions.", eleven edition cards, no "in the works" cards. Evidence: ARIA snapshot, screenshot at both widths.
- **Choose.** Activate a card. The URL is `/`, `hr_flavor` is the card's id, and the page is that edition. Repeat for all eleven ids (`minimal`, `drawing-set`, `surface`, `timetable`, `survey`, `press`, `darkroom`, `jacquard`, `maquette`, `mission`, `calibre`). Evidence: cookie and h1 per id.
- **Query without JavaScript.** `curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' 'http://127.0.0.1:3071/work?flavor=press'` returns a redirect to `/work` with `Set-Cookie: hr_flavor=press`. Evidence: headers.
- **Deep link default.** `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3071/work` is 200 and the body is Minimal (no picker). Evidence: status and the `<h1>`.
- **Mirrors.** `curl -s -H 'Accept: text/markdown' http://127.0.0.1:3071/work` returns markdown starting with a top-level heading; `curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3071/nope.md` is 404. Evidence: first lines, statuses.
- **Pinned build.** Only on a second build with the variable set at build time (it is inlined), in its own checkout and port: `/flavors` is that edition's 404, `/f/<other>/work` redirects 307 to `/work`, the cookie and `?flavor=` change nothing, and no "Change edition" link renders. Evidence: statuses, redirect targets.

## Gotchas

- The pin is read at build time. Starting `bun run start` with the variable set but a build made without it proves nothing. `serve.sh` builds with the variable unset on purpose, so the pinned recipe needs a manual build and is not covered by the helpers.
- The picker sets the cookie with `?flavor=` as well; a stale cookie from an earlier drive changes the answer to `/`.
- Playwright's `storageState` seeds the cookie `hr_flavor`; a manual drive must clear it between editions.
