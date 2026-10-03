# Local development

Last verified: 2026-10-03 at `6dd5254`, host Bun 1.4.2.

## Runtime

Host Bun 1.4.2 is the single version across projects (`package.json`
`packageManager`). Confirm with `bun --version`.

| Requirement              | Source                                                        |
| ------------------------ | ------------------------------------------------------------- |
| Bun 1.4.2                | `package.json` `packageManager`; hosts dev, build and start   |
| Node.js 22.23.3 or later | `package.json` `engines` (one-shot CLIs and toolchain, below) |

The `dev`, `build` and `start` servers run on Bun 1.4.2: the scripts force
it with `bun --bun`, because the plain `next` bin carries a Node shebang and
would otherwise execute under Node. Verified 2026-10-03: under both
`run dev` and `run start` the `next-server` worker executes the Bun 1.4.2
binary, and the fallback site answers 200. The `bun scripts/*.ts` helpers
run on Bun natively.

May still use Node: one-shot CLIs (`next typegen`) and the toolchain
(ESLint, `tsc`, Vitest, Prettier, Playwright) and git hooks. `node:` imports
in tests and configs are standard-library specifiers, not a second
toolchain. Vercel build compatibility with the Bun-hosted output is an open
gap (see the todo follow-ups): the local Bun build passes and CI covers the
gates, and no preview deploy is needed for this local-dev scope. Framework
versions are whatever `package.json` pins (Next 16.3.8, React 19.3,
TypeScript pinned to 6.0.3 per WEB-C2 in
`docs/checks/verification-issues.md`); that file is the source of truth, not
this doc.

## No Docker container

This project needs no Docker container, so there is none to prune or restart:

- No `Dockerfile`, `compose.*`, `docker-compose.*` or `.dockerignore` exists
  in the tree.
- The only `docker` string in dependencies is the transitive `is-docker`
  package inside `bun.lock`, not a service.
- The `postgres`/`redis`/`docker` strings in source are labels and content,
  not infrastructure: Jacquard's technology taxonomy
  (`flavors/jacquard/lib/weave.ts`) and skill lists
  (`content/fallback/skills.ts`).
- The database is the external Sanity CMS, not a local Postgres, and there is
  no Redis. There is no local Sanity server and no local Postgres schema;
  do not invent either.

Docker is for local databases and resources only. With no such dependency,
the app stays on the host: run it with `bun run dev` below, never add a
Docker app or Next.js service.

## Start

```sh
bun install
cp .env.example .env.local
bun run dev
```

Open <http://localhost:3000>. With no Sanity variables set, the site renders
the bundled fallback content in `content/fallback/` and makes no CMS calls.
For a connected CMS, follow [the Sanity setup guide](sanity.md), which also
covers Studio, webhooks and draft mode. `/ask` needs its own variables
(see [ask.md](ask.md)); without them it answers 503 by design.

Port notes: `3000` is the dev default, `3020` belongs to the Playwright
config (`reuseExistingServer` is on outside CI, so keep it free), and
verification runs use an isolated port with one server per checkout because a
build overwrites `.next` (see `.agents/skills/verify/SKILL.md`).

## Checks

Run serially, one heavy job at a time:

```sh
bun run type-check
bun run lint
bun run test
bun run build
bun run budget
```

`bun run check:identity` guards owner-identity hygiene. `bun run test:e2e`
and `bun run visual-baseline` are manual only. The `.agents/skills/verify`
harness (`scripts/doctor.sh`, `scripts/serve.sh`) is manual-only browser
verification; its non-browser gates above are free to run any time.

## Seed (local-only, writes to the real CMS)

`bun run seed` writes the bundled fallback content into the configured Sanity
dataset: the `profile` and `now` singletons plus experience, projects,
changelog, skill groups and education. Limits:

- It targets the real Sanity project, not a local fixture. It needs
  `NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_WRITE_TOKEN`.
- It is destructive to seeded documents: ids are deterministic and every
  document is replaced, so re-running overwrites edits made in Studio. Seed
  once, then edit in Studio.
- Never run it in CI, on a schedule, or against a dataset you do not own.
  There is no local-only seeding path and no fake Sanity server; do not
  create one.

## No shared local login

This site has no user table and no login, so the cross-project shared local
user does not apply here:

- Visitors are anonymous (`hr_anon` cookie). Owner mode is a passphrase
  session at `/owner` (`ASK_OWNER_PASSPHRASE` plus `ASK_COOKIE_SECRET`), not
  an account row.
- There is no shared credentials constant to keep in this repo. Referencing
  another project's `local-dev/fixtures.json` as a login for this site would
  be fabricated: website identity comes from Sanity content or the bundled
  fallback, never from a user table.
- `docs/mocks/` holds static edition design inputs (HTML plus notes), not
  runnable API or auth mocks.

## Troubleshooting

- `bun run dev` after every `.env.local` change; env vars are read at boot
  and `NEXT_PUBLIC_*` values are baked in at build time.
- Fallback build pages showing `localhost:3000` in metadata come from the
  default `NEXT_PUBLIC_SITE_URL`; set it for real URLs.
- `/api/visits` answering 503 on a fallback build is correct: the visitor
  counter cannot write without a CMS.
