# Portfolio

Personal portfolio built with Next.js, React, TypeScript, Tailwind CSS, and Sanity.

```bash
bun install
bun run dev
```

Run `bun run type-check`, `bun run lint`, and `bun run build` to validate the app.

## Sanity setup (local)

There is no hosted deploy for this rebuild yet. Do this once so Studio, draft preview, and seeding work against your project.

1. Sign in at [sanity.io/manage](https://www.sanity.io/manage) with GitHub or Google.
2. Create a project named `website` on the Free plan.
3. Create a dataset named `production` (public).
4. Under **API → Tokens**, create two tokens:
   - Viewer token - copy into `SANITY_API_READ_TOKEN` for server-rendered draft previews.
   - Editor token - copy into `SANITY_API_WRITE_TOKEN` for the seed script.
5. Under **API → CORS origins**, add `http://localhost:3000` with **Allow credentials** checked (required by the embedded Studio).
6. Copy `.env.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID` (from the project settings)
   - `NEXT_PUBLIC_SANITY_DATASET=production`
   - `SANITY_API_READ_TOKEN`
   - `SANITY_API_WRITE_TOKEN`
   - `SANITY_REVALIDATE_SECRET` (at least 32 random characters)
7. Restart `bun run dev`. Open `/studio` to edit content.
8. Seed the dataset once: `bun run seed`.

Regenerate TypeScript types after schema changes:

```bash
bun run typegen
```

Content pages read Sanity through `src/lib/data` accessors. Skills and education are typed files under `src/content/` and are also reached only through those accessors.

## Sanity cache revalidation

Public pages are prerendered and cached. Draft mode reads drafts on the server and shows changes after a reload. No Sanity token is sent to the browser.

When the site has a public origin, create one Sanity webhook with these settings:

- URL: `<site-origin>/api/revalidate`
- Method: `POST`
- Dataset: `production`
- Trigger on: create, update, and delete
- Filter: `_type in ["profile", "experience", "project", "now", "update"]`
- Projection: `{_id, _type}`
- Secret: the exact value of `SANITY_REVALIDATE_SECRET`

The signed route invalidates the changed document type and document ID tags. Sanity content is refreshed on the next request without a full rebuild.
