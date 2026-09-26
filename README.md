# rajputhemant.dev (3D rebuild)

The personal site of Hemant Rajput, being rebuilt on `portfolio-3d` with a 3D/WebGL front end.

![Next.js 16](https://img.shields.io/badge/Next.js-16-black) ![React 19.3](https://img.shields.io/badge/React-19.3-149eca) ![Sanity 6](https://img.shields.io/badge/Sanity-6-f03e2f) ![License: MIT](https://img.shields.io/badge/license-MIT-blue)

## Status: Milestone 0

This branch currently holds only the non-UI backend, ported from
`claude/serene-hawking-jxyjn0`: data layer, Sanity, the `/ask` chat API,
markdown mirrors, sitemap/robots/manifest/OG images and the embedded Studio.
`app/page.tsx` is a bare placeholder (renders the profile name from
`getProfile()`); every other public page, the design system and the 3D/motion
layer are rebuilt from scratch in later milestones. Not yet in this branch:
`motion`, `lenis`, `three`/`@react-three/*` and the old UI component tree.

## Stack

- **Framework:** Next.js 16 (App Router), React 19.3, TypeScript 6
- **Styling:** Tailwind CSS 4
- **Content:** Sanity 6, with the Studio embedded at `/studio`
- **Validation:** Zod
- **Testing:** Vitest (unit), Playwright (browser, not wired up yet)
- **Tooling:** Bun, ESLint, Prettier

## Backend features already in place

- **Static by default.** Every public page is pre-rendered. Edits in Sanity reach the site through on-demand tag revalidation, with no time-based revalidation and no rebuild.
- **Markdown mirrors.** Every page is also available as markdown at `/<page>.md` (or by sending `Accept: text/markdown`), with an index at `/llms.txt`.
- **Moderated `/ask` API.** Visitor threads, replies and moderation, with owner sign-in; the chat UI itself comes back with the rest of the front end.

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

| Variable                        | Required            | Purpose                                                                             | Where to get it                                  |
| ------------------------------- | ------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------ |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | For Sanity          | Selects the Sanity project. Leave it empty to use the fallback content.             | [sanity.io/manage](https://www.sanity.io/manage) |
| `NEXT_PUBLIC_SANITY_DATASET`    | No                  | Dataset name, `production` by default. Keep the dataset **private**.                | Sanity manage > Datasets                         |
| `SANITY_API_READ_TOKEN`         | With Sanity         | **Viewer** token. The site uses it for every read and for draft-mode preview.       | Sanity manage > API > Tokens                     |
| `SANITY_API_WRITE_TOKEN`        | For seed and `/ask` | **Editor** token. The seed and doctor scripts and the `/ask` routes use it.         | Sanity manage > API > Tokens                     |
| `SANITY_REVALIDATE_SECRET`      | For the webhook     | Verifies the signature on the Sanity webhook that calls `/api/revalidate`.          | Any random string (`openssl rand -hex 32`)       |
| `NEXT_PUBLIC_SITE_URL`          | No                  | Canonical URL for metadata, the sitemap and the mirrors. Default: `localhost:3000`. | Your own domain                                  |
| `ASK_COOKIE_SECRET`             | For `/ask`          | Signs the visitor and owner cookies and salts IP hashes.                            | 32+ random bytes (`openssl rand -base64 32`)     |
| `ASK_OWNER_PASSPHRASE`          | For owner mode      | The passphrase `/owner` accepts to reply and moderate on the site.                  | A long random string (`openssl rand -base64 32`) |
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
| `bun run budget`     | Checks the prerendered pages' gzipped JS against `scripts/check-budget.ts`         |
| `bun run typegen`    | Extracts the Sanity schema and regenerates `sanity.types.ts` from the GROQ queries |
| `bun run seed`       | Writes `content/fallback/` into the Sanity dataset, replacing seeded documents     |
| `bun run doctor`     | Lists duplicate content documents and legacy answers; `--fix` cleans them up       |

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
  (site)/ask/      The parts of /ask that are pure rendering: OG images and _lib helpers
  api/             Route handlers: ask (threads, replies, moderation), owner session, revalidate, draft-mode
  md/              Markdown mirrors, reached through the proxy rewrite
  studio/          Embedded Sanity Studio
  llms.txt/        Index of pages and their mirrors
  page.tsx         Placeholder home page (Milestone 0 only)
components/og/     Server-only OG image rendering, reused as-is until the design is restyled
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
scripts/          seed.ts seeds Sanity from content/fallback/; find-duplicates.ts is `bun run doctor`
proxy.ts           Rewrites /<page>.md and markdown requests to the mirror route
docs/              Setup guides and architecture notes (some describe pages not yet rebuilt here)
```

## Docs

- [docs/architecture.md](docs/architecture.md): key decisions and why they were made
- [docs/sanity.md](docs/sanity.md): Sanity project setup, seeding, Studio, webhook and draft mode
- [docs/ask.md](docs/ask.md): the `/ask` chat, owner mode, moderation, abuse controls and the doctor script
- [docs/prose-notes.md](docs/prose-notes.md): content facts that still need confirming

## License

[MIT](LICENSE) © Hemant Rajput
