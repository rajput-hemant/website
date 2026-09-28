# Sanity setup (localhost)

Last verified: 2026-09-27 at `b50faeb`.

Sanity is the source of truth for all site content. The site is fully static:
pages are rendered at build time from Sanity and only change when a cache tag is
revalidated or the site is rebuilt. Without a Sanity project the site renders the
bundled bootstrap content in `content/fallback/`, and the build logs a
`[data] Sanity not configured` warning once (`lib/data/fallback.ts`).

The project in use is `y9f5m131`, dataset `production`. It is shared by every
edition and by other branches, so schema changes must stay additive.

## 1. Create the project

1. Sign in at <https://www.sanity.io/manage> with GitHub or Google.
2. Create a project (Free plan) and a dataset named `production`.
3. **Make the dataset private** (Datasets > production > Visibility). Question
   documents store private fields (`author.email`, `author.anonId`,
   `moderation`). The site's public queries never select them, but a public
   dataset lets anyone query them directly through the API.

## 2. Tokens

API > Tokens:

- **Viewer** token, used by the site for every read (required with a private
  dataset) and for draft mode. Put it in `SANITY_API_READ_TOKEN`.
- **Editor** token, used by the seed script and the `/ask` submission route.
  Put it in `SANITY_API_WRITE_TOKEN`.

Tokens are only read on the server; never prefix them with `NEXT_PUBLIC_`.

## 3. CORS

API > CORS origins: add `http://localhost:3000` with **Allow credentials**
checked. The embedded Studio at `/studio` and the draft-mode live preview need it.

## 4. Environment

Copy `.env.example` to `.env.local` and fill in:

| Variable                        | Value                                               |
| ------------------------------- | --------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Project id from the manage page                     |
| `NEXT_PUBLIC_SANITY_DATASET`    | `production`                                        |
| `SANITY_API_READ_TOKEN`         | Viewer token                                        |
| `SANITY_API_WRITE_TOKEN`        | Editor token                                        |
| `SANITY_REVALIDATE_SECRET`      | Any long random string, e.g. `openssl rand -hex 32` |

The `/ask` variables (`ASK_COOKIE_SECRET`, `ASK_OWNER_PASSPHRASE`,
`ASK_PENDING_CAP`, `ASK_TRUST_PROXY`) are in [ask.md](ask.md). Every variable is
read through T3Env (`lib/env.ts` and the server-only `lib/env.server.ts`) and
is optional: the build succeeds with none set.

Restart `bun run dev` after changing env vars.

## 5. Seed

```sh
bun run seed
```

This writes the bootstrap content from `content/fallback/` into the dataset:
the `profile` and `now` singletons plus experience, projects, changelog, skill
groups and education. Document ids are deterministic (`experience-zunta`,
`project-infinitunes`, ...) and FastLane → Blai and Proghit → Zunta are linked
through `continuedInto`. Re-running replaces every seeded document, including
edits you made to them in Studio, so seed once and edit in Studio afterwards.

Once seeded, the site no longer reads `content/fallback/` at all. With Sanity
configured, a failed query or a missing `profile`/`now` document fails the
build instead of falling back.

## 6. Studio

Open <http://localhost:3000/studio> and log in with the same account.

- **Profile** and **Now** are pinned singletons (no create, delete or duplicate).
- **Experience**, **Projects**, **Changelog**, **Skills**, **Education** are lists.
- **Inbox** lists `/ask` threads by status: Pending, Published, Rejected,
  Spam, All threads. Open one, reply in `replies[]`, then use **Publish** (or
  **Update** once it is already live), **Approve reply**/**Approve N
  replies**, **Reject** or **Mark spam**. See [ask.md](ask.md) for the full
  moderation walkthrough.
- **Presentation** previews the site in draft mode (uses the viewer token).
  Live draft refresh is mounted in the Minimal edition's layout only.
- **Vision** (GROQ playground) appears in development only.

## 7. Getting changes onto the site

Pages are static, so an edit in Studio reaches the site in one of two ways.

### Webhook revalidation (no rebuild)

Every query is cached under a tag named after its document type (`profile`,
`experience`, `project`, `now`, `update`, `skillGroup`, `education`,
`question`). A signed Sanity webhook tells `/api/revalidate` which type
changed, and that tag is expired so the next request re-renders the affected
pages statically.

In the manage page, API > Webhooks > Create webhook:

- **URL**: `https://<public-host>/api/revalidate`
- **Dataset**: `production`
- **Trigger on**: Create, Update, Delete
- **Filter**: `_type != "siteStats"` (every counted visit writes the visitor-counter document; without this filter each visit would fire the webhook)
- **Projection**: `{_type, _id}`
- **HTTP method**: POST
- **Secret**: the value of `SANITY_REVALIDATE_SECRET`
- **Drafts** and **Versions**: off

The route answers `401` for a bad signature and
`{"revalidated": ["<type>"]}` on success.

A webhook needs a publicly reachable URL, so for local testing either run a
tunnel to `localhost:3000` (for example `cloudflared tunnel --url
http://localhost:3000`) and use its URL, or skip the webhook (see below).
In `bun run dev` the fetch cache is also used, but a hard reload
(Cmd/Ctrl+Shift+R) bypasses it.

### Rebuild

`bun run build` fetches everything from Sanity again and pre-renders every
page. Without a webhook, rebuild (or hard-reload in `bun run dev`) to see changes.

## Draft mode

Presentation enables draft mode through `/api/draft-mode/enable`; it is
disabled with `/api/draft-mode/disable`. In draft mode pages read drafts with
the viewer token, skip the cache and refresh live as you edit. Public visitors
never enter draft mode.

## Types

`bun run typegen` extracts the schema to `sanity/extract.json` (git-ignored)
and regenerates `sanity.types.ts` from the GROQ queries in `sanity/lib/queries.ts`.
Run it after changing a schema or query. It works offline.
