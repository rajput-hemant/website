# rajputhemant.dev (3D rebuild)

The personal site of Hemant Rajput, being rebuilt on `portfolio-3d` with a 3D/WebGL front end.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![React 19.3](https://img.shields.io/badge/React-19.3-149eca) ![Sanity 6](https://img.shields.io/badge/Sanity-6-f03e2f) ![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## Status

The site ships as several complete **editions** of one portfolio: the same content, URLs, Sanity data, APIs and markdown mirrors, each with its own visual design, motion and 3D. Six are live (Minimal, the default; Drawing Set; Control Surface; Timetable; Field Survey; Press Proof), and five more are designed as mocks in `docs/mocks/`. On a first visit `/` shows an edition picker; the choice is kept in a cookie and every URL renders in that edition. The architecture is in [docs/flavors.md](docs/flavors.md), and the docs index is [docs/README.md](docs/README.md).

## Stack

- **Framework:** Next.js 16 (App Router, React Compiler), React 19.3, TypeScript 6 (strict, with `exactOptionalPropertyTypes` and `verbatimModuleSyntax`)
- **Styling:** Tailwind CSS 4, one stylesheet per edition; class merging with the `cn` package
- **Motion and 3D:** GSAP, Lenis, three.js and React Three Fiber, loaded after first paint and only where an edition uses them
- **UI primitives:** Base UI, cmdk for ⌘K
- **Content:** Sanity 6, with the Studio embedded at `/studio`
- **Validation:** Zod, with environment variables through T3Env
- **Testing:** Vitest (unit), Playwright with axe (browser), a build-time JS and font budget
- **Tooling:** Bun, ESLint (type-aware), Prettier, Husky and commitlint

## Features

- **Static by default.** Every public page is pre-rendered. Edits in Sanity reach the site through on-demand tag revalidation, with no time-based revalidation and no rebuild.
- **Editions without URL changes.** `proxy.ts` rewrites each request to the visitor's edition tree, so pages stay static and URLs stay clean.
- **Markdown mirrors.** Every page is also available as markdown at `/<page>.md` (or by sending `Accept: text/markdown`), with an index at `/llms.txt`.
- **Moderated `/ask`.** Visitor threads and replies with moderation and owner sign-in, on static pages.

## Getting started

Requirements: Node.js ≥ 22.12 and [Bun](https://bun.sh).

```sh
bun install
cp .env.example .env.local
bun run dev
```

Then open <http://localhost:3000>.

**Without Sanity.** Leave `NEXT_PUBLIC_SANITY_PROJECT_ID` empty and the site renders the bundled fallback content in `content/fallback/`. Every page builds and looks complete. `/ask` lists no conversations, and a message is refused with "The inbox isn't connected yet".

**With Sanity.** Follow [docs/sanity.md](docs/sanity.md) to create the project, a private dataset, the tokens and the CORS origin. Then fill in `.env.local` and seed the dataset once:

```sh
bun run seed   # writes the bootstrap content into Sanity
bun run dev
```

Edit content in the Studio at <http://localhost:3000/studio>.

## Environment variables

All of them are optional. With none set, the site runs on fallback content.

| Variable                        | Required            | Purpose                                                                                     | Where to get it                                       |
| ------------------------------- | ------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | For Sanity          | Selects the Sanity project. Leave it empty to use the fallback content.                     | [sanity.io/manage](https://www.sanity.io/manage)      |
| `NEXT_PUBLIC_SANITY_DATASET`    | No                  | Dataset name, `production` by default. Keep the dataset **private**.                        | Sanity manage > Datasets                              |
| `SANITY_API_READ_TOKEN`         | With Sanity         | **Viewer** token. The site uses it for every read and for draft-mode preview.               | Sanity manage > API > Tokens                          |
| `SANITY_API_WRITE_TOKEN`        | For seed and `/ask` | **Editor** token. The seed and doctor scripts and the `/ask` routes use it.                 | Sanity manage > API > Tokens                          |
| `SANITY_REVALIDATE_SECRET`      | For the webhook     | Verifies the signature on the Sanity webhook that calls `/api/revalidate`.                  | Any random string (`openssl rand -hex 32`)            |
| `NEXT_PUBLIC_SITE_URL`          | No                  | Canonical URL for metadata, the sitemap and the mirrors. Default: `localhost:3000`.         | Your own domain                                       |
| `NEXT_PUBLIC_FLAVOR`            | No                  | Pins the deploy to one live edition id (e.g. `press`): no picker, no switching. Build time. | See [docs/flavors.md](docs/flavors.md#pinned-edition) |
| `ASK_COOKIE_SECRET`             | For `/ask`          | Signs the visitor and owner cookies and salts IP hashes.                                    | 32+ random bytes (`openssl rand -base64 32`)          |
| `ASK_OWNER_PASSPHRASE`          | For owner mode      | The passphrase `/owner` accepts to reply and moderate on the site.                          | A long random string (`openssl rand -base64 32`)      |
| `ASK_PENDING_CAP`               | No                  | Circuit-breaker ceiling on pending messages. Default: 200.                                  | Your choice. See [docs/ask.md](docs/ask.md)           |
| `ASK_TRUST_PROXY`               | No                  | Number of reverse proxies that append to `X-Forwarded-For`. Unset: ignored.                 | Your deployment. See [docs/ask.md](docs/ask.md)       |

Tokens and secrets are server-only. Never give them a `NEXT_PUBLIC_` prefix. Every variable is read through T3Env (`lib/env.ts`, `lib/env.server.ts`).

## Scripts

| Command                   | What it does                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------- |
| `bun run dev`             | Starts the dev server                                                                 |
| `bun run build`           | Production build, which pre-renders every public page                                 |
| `bun run start`           | Serves the production build                                                           |
| `bun run lint`            | Runs ESLint                                                                           |
| `bun run lint:fix`        | Runs ESLint with autofix                                                              |
| `bun run type-check`      | Generates route types (`next typegen`), then runs `tsc --noEmit`                      |
| `bun run fmt:check`       | Checks formatting with Prettier                                                       |
| `bun run fmt:write`       | Formats with Prettier                                                                 |
| `bun run test`            | Runs the unit tests once (Vitest)                                                     |
| `bun run test:watch`      | Runs Vitest in watch mode                                                             |
| `bun run test:e2e`        | Runs the Playwright suite against a production server on port 3020                    |
| `bun run visual-baseline` | Captures and compares screenshots of the editions (`scripts/visual-baseline.ts`)      |
| `bun run budget`          | Checks the prerendered pages' gzipped JS against `scripts/check-budget.ts`            |
| `bun run typegen`         | Extracts the Sanity schema and regenerates `sanity.types.ts` from the GROQ queries    |
| `bun run seed`            | Writes `content/fallback/` into the Sanity dataset, replacing seeded documents        |
| `bun run doctor`          | Lists duplicate content documents and legacy answers; `--fix` cleans them up          |
| `bun run signature`       | Regenerates Minimal's handwritten signature strokes (`scripts/generate-signature.ts`) |

## Content and freshness

Pages are rendered statically. Each Sanity query is cached under a tag named after its document type: `profile`, `experience`, `project`, `now`, `update`, `skillGroup`, `education` and `question`.

```text
Studio publish ─▶ Sanity webhook (signed) ─▶ POST /api/revalidate ─▶ revalidateTag(<type>)
                                                                          │
                              next request re-renders affected pages ◀────┘
```

1. You publish a change in Studio.
2. A Sanity webhook sends `{_type, _id}` to `/api/revalidate`, signed with `SANITY_REVALIDATE_SECRET`.
3. The route verifies the signature and expires the tag for that type.
4. The next request re-renders the affected pages and markdown mirrors, and they are cached statically again.

A webhook needs a public URL. On localhost you can use a tunnel, or skip the webhook and run `bun run build` to fetch everything again. The webhook setup is in [docs/sanity.md](docs/sanity.md#7-getting-changes-onto-the-site). Draft mode (Studio's Presentation tool) bypasses the cache so the owner can preview drafts live.

## Project structure

The app lives at the repository root. There is no `src/`, and `@/*` maps to the root.

```text
app/
  f/<edition>/     Each edition's pages and root layout (reached through the proxy rewrite)
  flavors/         The edition picker
  api/             Route handlers: ask (threads, replies, moderation), owner session, visits, revalidate, draft-mode
  ask/feed.xml/    The /ask RSS feed
  md/              Markdown mirrors, reached through the proxy rewrite
  studio/          Embedded Sanity Studio
  llms.txt/        Index of pages and their mirrors
flavors/
  registry.ts      Every edition: live or future, name, tagline, swatch
  <edition>/       The edition's components, lib, content and styles
components/
  semantic/        Headless hooks shared by the editions (no styling)
  og/              Server-only OG image rendering
content/
  site.ts          Site identity and the list of mirrored pages
  lab.ts           The /lab experiment registry
  fallback/        Bootstrap content, used when Sanity is not configured and by the seed script
lib/
  data/            Domain types, the server-only data accessors and page loaders
  ask/             /ask validation, limits, identity, heuristics, storage and page loaders
  scene/           The shared 3D scene store, clock, tiers and DOM contract
  prefs/           The preference store factory and the standard schema
  markdown/        Markdown rendering for mirrors and llms.txt
sanity/            Schemas, Studio structure, document actions, client, queries
scripts/           seed, doctor (find-duplicates), budget, visual baseline, redundancy inventory
e2e/               Playwright specs
proxy.ts           Markdown mirrors, then the edition rewrite
docs/              Architecture, runbooks, edition design docs, handoffs and mocks
```

## Docs

- [docs/README.md](docs/README.md): the index of every live doc
- [docs/flavors.md](docs/flavors.md): the editions architecture, rules, budgets and how to add an edition
- [docs/architecture.md](docs/architecture.md): key decisions and why they were made
- [docs/sanity.md](docs/sanity.md): Sanity project setup, seeding, Studio, webhook and draft mode
- [docs/ask.md](docs/ask.md): the `/ask` chat, owner mode, moderation, abuse controls and the doctor script
- [docs/prose-notes.md](docs/prose-notes.md): content facts that still need confirming

## License

[MIT](LICENSE) © Hemant Rajput
