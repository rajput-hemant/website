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
8. Seed missing documents: `bun run seed`. Use `bun run seed --force` only when you intend to replace existing Studio edits.

Regenerate TypeScript types after schema changes:

```bash
bun run typegen
```

Content pages read Sanity through `src/lib/data` accessors, including skills and education. Pages that prerender content need a real Sanity project to build. `SKIP_ENV_VALIDATION=1` can skip T3Env validation for offline tooling, but it does not provide content or substitute for a project.

## Ask: sign-in setup (local)

Sign-in for `/ask` uses Auth.js with GitHub (required) and Google (optional).

1. Open [github.com/settings/developers](https://github.com/settings/developers) → **OAuth Apps** → **New OAuth App**:
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
2. Register the app, then **Generate a new client secret**.
3. Set in `.env.local`:
   - `AUTH_SECRET` - output of `openssl rand -base64 32`
   - `AUTH_GITHUB_ID` - the app's Client ID
   - `AUTH_GITHUB_SECRET` - the client secret from step 2
4. Optional Google: in Google Cloud Console create an OAuth client (Web application) with redirect URI `http://localhost:3000/api/auth/callback/google`, then set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
5. Set `ASK_OWNER_IDS` to comma-separated owner account ids in `provider:id` form, e.g. `github:1234567`. Your GitHub numeric id is the `id` field of `https://api.github.com/users/<login>`.
6. Set `ASK_SUBMISSION_SECRET` (at least 32 random characters).
7. Restart `bun run dev`.

Dev-only test login: `AUTH_DEV_LOGIN=1` works only under `bun run dev` (`NODE_ENV` development) and lets you sign in with any name as `dev:<name>`. Add `dev:<name>` to `ASK_OWNER_IDS` to test the owner badge.

`SANITY_WRITE_DRY_RUN=1` switches all Ask reads and writes to an in-memory fixture store, so nothing touches the dataset during local testing. Never set it in production.

## Sanity cache revalidation

Public pages are prerendered and cached. Draft mode reads drafts on the server and shows changes after a reload. No Sanity token is sent to the browser.

Open the Presentation tool in `/studio` to enter draft preview. Visit `/api/draft-mode/disable` to leave draft mode.

When the site has a public origin, create one Sanity webhook with these settings:

- URL: `<site-origin>/api/revalidate`
- Method: `POST`
- Dataset: `production`
- Trigger on: create, update, and delete
- Filter: `_type in ["profile", "experience", "project", "now", "update", "skillGroup", "education"]`
- Projection: `{_id, _type}`
- Secret: the exact value of `SANITY_REVALIDATE_SECRET`

The signed route immediately expires the changed document type and document ID tags. The next request fetches fresh content without a full rebuild.
