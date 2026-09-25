# rajputhemant.dev

The personal site of Hemant Rajput: a minimal, text-first portfolio with a small layer of interaction on top.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![React 19.3](https://img.shields.io/badge/React-19.3-149eca) ![Sanity 6](https://img.shields.io/badge/Sanity-6-f03e2f) ![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## Stack

- **Framework:** Next.js 16 (App Router), React 19.3, TypeScript 6
- **Styling:** Tailwind CSS 4
- **Content:** Sanity 6, with the Studio embedded at `/studio`
- **Interaction:** Motion, Lenis (smooth scroll), Three.js and React Three Fiber (only in `/lab`)
- **Validation:** Zod
- **Testing:** Vitest (unit), Playwright (browser)
- **Tooling:** Bun, ESLint, Prettier

## Features

- **Static by default.** Every public page is pre-rendered. Edits in Sanity reach the site through on-demand tag revalidation, with no time-based revalidation and no rebuild.
- **Customize panel.** Visitors pick the theme, accent colour, body font, corner radius, background texture, and motion, smooth scroll, cursor and sound settings. The choices persist in the browser and apply before first paint.
- **Markdown mirrors.** Every page is also available as markdown at `/<page>.md` (or by sending `Accept: text/markdown`), with an index at `/llms.txt`.
- **Moderated `/ask` inbox.** Visitors can send anonymous messages. Nothing appears on the site until the owner answers and publishes it in Studio.
- **`/lab`.** Interactive WebGL experiments, each on its own route and each with a static fallback.
- **Print resume.** `/resume` renders from the same data and is styled for print, so "Download PDF" is the browser's print dialog.

## Getting started

Requirements: Node.js ≥ 22.12 and [Bun](https://bun.sh).

```sh
bun install
cp .env.example .env.local
bun run dev
```

Then open <http://localhost:3000>.

**Without Sanity.** Leave `NEXT_PUBLIC_SANITY_PROJECT_ID` empty and the site renders the bundled fallback content in `content/fallback/`. Every page builds and looks complete. `/ask` lists no entries, and a submission is refused with "The inbox isn't connected yet".

**With Sanity.** Follow [docs/sanity.md](docs/sanity.md) to create the project, a private dataset, the tokens and the CORS origin. Then fill in `.env.local` and seed the dataset once:

```sh
bun run seed   # writes the bootstrap content into Sanity
bun run dev
```

Edit content in the Studio at <http://localhost:3000/studio>.

## Environment variables

All of them are optional. With none set, the site runs on fallback content.

| Variable                        | Required            | Purpose                                                                             | Where to get it                                  |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | For Sanity          | Selects the Sanity project. Leave it empty to use the fallback content.             | [sanity.io/manage](https://www.sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET`    | No                  | Dataset name, `production` by default. Keep the dataset **private**.                | Sanity manage > Datasets                         |
| `SANITY_API_READ_TOKEN`         | With Sanity         | **Viewer** token. The site uses it for every read and for draft-mode preview.       | Sanity manage > API > Tokens                     |
| `SANITY_API_WRITE_TOKEN`        | For seed and `/ask` | **Editor** token. The seed script and `POST /api/ask` use it.                       | Sanity manage > API > Tokens                     |
| `SANITY_REVALIDATE_SECRET`      | For the webhook     | Verifies the signature on the Sanity webhook that calls `/api/revalidate`.          | Any random string (`openssl rand -hex 32`)       |
| `NEXT_PUBLIC_SITE_URL`          | No                  | Canonical URL for metadata, the sitemap and the mirrors. Default: `localhost:3000`. | Your own domain                                  |
| `ASK_COOKIE_SECRET`             | For `/ask`          | Signs the anonymous identity cookie and salts IP hashes.                            | 32+ random bytes (`openssl rand -base64 32`)     |
| `ASK_PENDING_CAP`               | No                  | Circuit-breaker ceiling on pending messages. Default: 200.                          | Your choice. See [docs/ask.md](docs/ask.md)      |

Tokens and secrets are server-only. Never give them a `NEXT_PUBLIC_` prefix.

## Scripts

| Command              | What it does                                                                       |
| -------------------- | ---------------------------------------------------------------------------------- |
| `bun run dev`        | Starts the dev server                                                              |
| `bun run build`      | Production build, which pre-renders every public page                              |
| `bun run start`      | Serves the production build                                                        |
| `bun run lint`       | Runs ESLint                                                                        |
| `bun run lint:fix`   | Runs ESLint with autofix                                                           |
| `bun run type-check` | Runs `tsc --noEmit`                                                                |
| `bun run fmt:check`  | Checks formatting with Prettier                                                    |
| `bun run fmt:write`  | Formats with Prettier                                                              |
| `bun run test`       | Runs the unit tests once (Vitest)                                                  |
| `bun run test:watch` | Runs Vitest in watch mode                                                          |
| `bun run typegen`    | Extracts the Sanity schema and regenerates `sanity.types.ts` from the GROQ queries |
| `bun run seed`       | Writes `content/fallback/` into the Sanity dataset, replacing seeded documents     |

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
  (site)/          Public pages (home, work, projects, now, changelog, resume, ask, lab) and their shared layout
  api/             Route handlers: ask, revalidate, draft-mode
  md/              Markdown mirrors, reached through the proxy rewrite
  studio/          Embedded Sanity Studio
  llms.txt/        Index of pages and their mirrors
components/        UI grouped by feature (site shell, ui primitives, interaction, customize, lab, ...)
content/
  site.ts          Site name, navigation and the list of mirrored pages
  lab.ts           The /lab experiment registry
  fallback/        Bootstrap content, used when Sanity is not configured and by the seed script
lib/
  data/            Domain types and the server-only data accessors
  ask/             /ask validation, limits, identity, heuristics and storage
  markdown/        Markdown rendering for mirrors and llms.txt
  prefs.ts         Visitor preference model (plus prefs-store.ts)
sanity/            Schemas, Studio structure, document actions, client, queries
scripts/seed.ts    Seeds Sanity from content/fallback/
proxy.ts           Rewrites /<page>.md and markdown requests to the mirror route
docs/              Setup guides and architecture notes
```

## Docs

- [docs/architecture.md](docs/architecture.md): key decisions and why they were made
- [docs/sanity.md](docs/sanity.md): Sanity project setup, seeding, Studio, webhook and draft mode
- [docs/ask.md](docs/ask.md): the `/ask` moderation runbook and abuse controls
- [docs/prose-notes.md](docs/prose-notes.md): content facts that still need confirming

## License

[MIT](LICENSE) © Hemant Rajput
