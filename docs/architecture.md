# Architecture

This document records the decisions that shape the codebase and why each was made. For setup, see [sanity.md](sanity.md) and [ask.md](ask.md).

The governing design rule: the site is minimal and text-first, and interaction is a thin layer of small, precise moments on top. Any effect that makes text slower to read or harder to select, or that works worse with a keyboard, a screen reader, reduced motion or a touch device, is cut.

## 1. Static rendering with tag revalidation

**Decision.** Every public page is statically rendered. Each Sanity read is a `force-cache` fetch tagged with its document type and has no time-based revalidation. A signed Sanity webhook calls `POST /api/revalidate`, which calls `revalidateTag(<type>)`. The next request then re-renders the affected pages, and they are cached again. `cacheComponents` stays off.

**Why not the Live Content API.** A portfolio is read far more often than it changes. The owner wanted pages served as fast as possible: fresh shortly after an edit, and fully static the rest of the time. Live mode (`defineLive` with `<SanityLive>` on every page) makes each page subscribe and keeps rendering dynamic. That buys sub-second freshness nobody needs, at the cost of a slower, costlier default. Tag revalidation gives static pages that turn over within one request of a publish.

**Where live still exists.** `<SanityLive>` renders only in draft mode, which Studio's Presentation tool enables for the owner. In draft mode `sanityFetch` reads drafts with the viewer token and skips the cache. Public visitors never enter it.

**Consequences.**

- Public pages must never read cookies, headers or `searchParams`, because any of them makes a page dynamic. `/ask` pagination therefore uses static segments (`/ask/page/2`) instead of `?page=2`.
- Dynamic segments that grow over time (`/ask/[slug]`, `/ask/page/[page]`) prerender what exists at build time and keep `dynamicParams = true`. A new entry is rendered on its first request and then cached like the rest.
- Without a webhook (for example on localhost with no tunnel), `bun run build` is the way to pick up changes.

Tags, one per document type: `profile`, `experience`, `project`, `now`, `update`, `skillGroup`, `education`, `question`. They are defined in `sanity/lib/fetch.ts`, and the webhook route accepts only these.

## 2. The data-layer contract

Pages depend on a small contract, not on Sanity:

- **Domain types** in `lib/data/types.ts`: `Profile`, `Experience`, `Project`, `Now`, `Update`, `SkillGroup`, `Education` and `Question`. Rich text is Portable Text blocks (`RichText`). Pages never touch raw Sanity documents or generated query types.
- **Accessors** in `lib/data/index.ts`: `getProfile`, `getExperience`, `getProjects`, `getNow`, `getChangelog`, `getSkills`, `getEducation`, `getQuestions({ page, pageSize })` and `getQuestion(slug)`. They are async, server-only and deduplicated per render with React `cache()`. Ordering is part of the contract: experience is newest first with `continuedFrom` derived, projects are featured first, and questions are published only, newest first.
- **Mappers** (`lib/data/<type>.ts`) convert GROQ results into domain types. Schema changes are absorbed there, not in pages.

**The fallback is isolated and temporary.** When `NEXT_PUBLIC_SANITY_PROJECT_ID` is empty (`isSanityConfigured === false` in `lib/env.ts`), accessors serve the bundled content in `content/fallback/`. `lib/data/fallback.ts` is the only module that imports it, and pages never do. The same content is what `scripts/seed.ts` writes into Sanity. This keeps the site buildable and complete before a Sanity project exists.

With Sanity configured, accessors read only from Sanity. A failed request or a missing singleton throws, so the build fails loudly instead of silently shipping stale bundled content. Once Sanity is the only source, `lib/data/fallback.ts` and `content/fallback/` can be deleted along with the `isSanityConfigured` branches, and no page needs to change.

## 3. The preference system

The Customize panel, the theme toggle and the interaction layer all share one preference system instead of several libraries. It replaces `next-themes`, which would have been a second system doing the same job.

- **Model:** `lib/prefs.ts` defines `Prefs` (theme, accent hue, body font, radius, texture, and the motion, smooth-scroll, cursor and sound flags) with `defaultPrefs`. Preferences persist as JSON in `localStorage` under `hr.prefs`.
- **Pre-hydration script:** `components/prefs/prefs-script.tsx` inlines a render-blocking script in `<head>`. It reads the stored preferences and applies them before first paint, so there is no flash of the wrong theme, font or accent. It embeds `applyPrefs` through `toString()`, so that function must stay self-contained and tolerate malformed stored values.
- **`data-*` attributes:** `applyPrefs` writes `data-theme`, `data-accent`, `data-font`, `data-texture`, `data-motion`, `data-smooth-scroll`, `data-cursor` and `data-sound` onto `<html>`, plus the `--accent-hue` and `--radius` CSS variables. CSS keys off these attributes, so styling needs no JavaScript at render time. `data-theme` resolves `system` through the colour-scheme media query. `data-motion` is off when either the preference is off or the OS asks for reduced motion.
- **Store:** `lib/prefs-store.ts` is a `useSyncExternalStore` store (`usePrefs`, `setPrefs`, `resetPrefs`, `subscribePrefs`). It returns the defaults during SSR and hydration, which keeps server HTML identical for every visitor and the pages static. It also syncs across tabs through the `storage` event.
- **Sync:** `components/prefs/prefs-sync.tsx` re-applies attributes after hydration when preferences or OS media queries change. It deliberately does nothing on mount, because the script already applied the stored values and the store briefly reports defaults.

## 4. Interaction-layer gating

`components/interaction/interaction-layer.tsx` mounts the optional effects client-side. Each effect mounts only when its preference is on and the device suits it:

| Effect                  | Preference (default) | Also requires                                        |
| ----------------------- | -------------------- | ---------------------------------------------------- |
| Smooth scroll (Lenis)   | `smoothScroll` (on)  | Fine pointer with hover, no reduced motion           |
| Cursor follower         | `cursor` (on)        | Fine pointer with hover, no reduced motion           |
| Click sound             | `sound` (off)        | Fine pointer with hover                              |
| Reveals, page crossfade | `motion` (on)        | No reduced motion                                    |
| `/lab` scenes           | `motion` (on)        | WebGL support, no reduced motion (else static image) |

The rules behind the table:

- **Nothing renders on the server or during hydration.** The media-query hooks and the store report `false` and defaults, so the first paint is plain, readable HTML.
- **Reduced motion always wins.** `MotionConfig` uses `reducedMotion="user"`, and the `motion` preference forces `"always"` when it is off.
- **Native behaviour is preserved.** Lenis is native-scroll based, uses `syncTouch: false` and resolves anchors itself, so keyboard scrolling, find-in-page, `:target` and touch momentum stay native. The cursor is a follower: the native cursor stays visible, and the follower is `aria-hidden` and never hit-testable.
- **Loops sleep.** The Lenis and cursor rAF loops park when idle or when the tab is hidden. Lab canvases render on demand, cap DPR at 1.5, and stop entirely offscreen or in a background tab.
- **Code stays off routes that don't need it.** Lenis and the lab scenes load through `next/dynamic` with `ssr: false`, so three.js appears only on `/lab/[slug]`.
- **Studio is exempt.** The interaction layer and the page transition render nothing under `/studio`.

## 5. Route map

Public pages live under the `app/(site)/` route group, whose layout renders the header, `<main id="content">`, the footer, the motion provider and the interaction layer. `app/layout.tsx` is the bare `<html>`/`<body>` with the preference script. Studio and the API sit outside the group, so they get none of the site chrome.

| Route                                               | Rendering               | Purpose                                               |
| --------------------------------------------------- | ----------------------- | ----------------------------------------------------- |
| `/`                                                 | Static                  | Home and about: intro, now teaser, selected projects  |
| `/work`                                             | Static                  | Experience as prose, plus skills and education        |
| `/projects`                                         | Static                  | All projects, featured first                          |
| `/now`                                              | Static                  | Current focus, with an "as of" date                   |
| `/changelog`                                        | Static                  | Dated one-liners grouped by year                      |
| `/resume`                                           | Static                  | Print-styled resume from the same data                |
| `/ask`, `/ask/page/[page]`                          | Static, paginated       | Chat feed of published threads, with the composer     |
| `/ask/[slug]`                                       | Static, grows on demand | One thread and its reply composer, with an OG image   |
| `/ask/feed.xml`                                     | Static                  | RSS feed of threads, replies included                 |
| `/owner`                                            | Static, `noindex`       | Owner sign-in for replying and moderating on the site |
| `/lab`, `/lab/[slug]`                               | Static                  | Experiment index and one canvas per experiment        |
| `/<page>.md`, `/llms.txt`                           | Static (through proxy)  | Markdown mirrors and their index                      |
| `/sitemap.xml`, `/robots.txt`, OG and icons         | Static                  | Metadata routes                                       |
| `/studio/[[...tool]]`                               | Static shell            | Embedded Sanity Studio                                |
| `POST /api/ask`, `POST /api/ask/[slug]/replies`     | Dynamic                 | Start a thread, reply to one                          |
| `GET`/`POST`/`DELETE /api/owner/session`            | Dynamic                 | Owner session: check, sign in, sign out               |
| `GET /api/ask/moderation`, `POST /api/ask/moderate` | Dynamic, owner only     | Moderation queue and actions                          |
| `POST /api/revalidate`                              | Dynamic                 | Sanity webhook target                                 |
| `/api/draft-mode/enable`, `/api/draft-mode/disable` | Dynamic                 | Draft preview for the owner                           |

`content/site.ts` defines the primary navigation and `pages`, the list of mirrored pages. That list drives the sitemap, `llms.txt` and the mirror slugs. The lab experiments are registered in `content/lab.ts`.

## 6. `/ask`: a moderated chat on static pages

`/ask` is a threaded chat: visitors start threads and reply to published ones, and the owner replies on the site. A thread is one `question` document with a `replies[]` array; each reply carries its own moderation `status`. Replies are appended atomically, and `lastActivityAt` orders the feed.

**Static pages, instant publishing.** The feed, permalinks, RSS and markdown mirrors are static and tagged `question`. Every publish (an owner message, or an approval) calls `revalidateTag("question")` in the same request, so the next load shows it without the webhook. After posting, the client calls `router.refresh()`. A visitor's own pending messages are echoed from `localStorage` until they appear in the published data, so nothing personal is ever rendered on the server.

**Owner mode without an auth library.** One passphrase (`ASK_OWNER_PASSPHRASE`) is exchanged at `/owner` for `hr_owner`, an HMAC-signed 30-day cookie signed with `ASK_COOKIE_SECRET` by the same helpers as the visitor cookie. Pages never read it: an `OwnerProvider` asks `GET /api/owner/session` once per load, and the moderation queue comes from an owner-only endpoint. Owner messages skip moderation; every visitor message is still reviewed.

**Abuse-control order.** The write routes share one pipeline in `lib/ask/submit.ts`, cheapest first, and nothing touches Sanity before the global ceiling has been checked:

1. Same-origin, JSON-only and body size (4 KB) guards, checked before JSON parsing.
2. JSON and Zod validation of shapes and lengths.
3. Honeypot field and minimum time-to-submit (3 s). A failure gets a fake success and nothing is written, so bots learn nothing.
4. Maximum composer age (6 h).
5. Configuration: without Sanity or `ASK_COOKIE_SECRET`, the route answers 503. Replies to a thread that isn't published answer 404.
6. A valid owner cookie publishes at once and skips the rest.
7. Circuit breaker: when pending threads and replies (cached for 30 s) reach `ASK_PENDING_CAP`, the route answers 503.
8. Rate limits: daily caps per connection, replies per identity per day, and at most one pending thread and three pending replies per identity. The visitor is identified by the signed `hr_anon` cookie, with a salted IP hash as the fallback.
9. Duplicate of a pending body: a fake success.
10. Heuristics (links, repeated characters, all caps, profanity) choose `spam` or `pending`.
11. Write. The owner approves, rejects or marks spam on the site or in Studio.

The circuit breaker needs no store: the pending count bounds the Sanity quota a flood can consume. Private fields (`author.anonId`, `moderation`, and their per-reply equivalents) are never selected by public queries, and the dataset should be private. The details and every limit are in [ask.md](ask.md) and `lib/ask/config.ts`.

## 7. Markdown mirrors through the proxy rewrite

Every page in `content/site.ts`, plus each published `/ask/<slug>`, has a markdown mirror for agents and readers who prefer plain text.

- `app/md/[...slug]/route.ts` renders the mirrors from the same data accessors. It is `force-static` with `generateStaticParams`, so the mirrors are prerendered and refreshed by the same tag revalidation as the HTML.
- `proxy.ts` rewrites `/<page>.md` (and `/index.md` for `/`) to `/md/<slug>`. When a request's `Accept` header prefers `text/markdown` at least as strongly as `text/html`, it also rewrites the page URL itself.
- The proxy matcher lists only `.md` paths, `/md/*` and the mirrored page paths when they carry a markdown `Accept` header. For ordinary HTML requests the proxy never runs, and pages stay static. The proxy answers malformed slugs with 404 itself, so the mirror route never renders or caches arbitrary paths.
- Mirrors send `Link: rel="canonical"` pointing to the HTML page, and `/md/` is disallowed in `robots.txt`, so search engines index the HTML page and not the duplicate mirror. `/llms.txt` indexes the pages and their mirrors.

## 8. Deferred: sign-in tier and deployment

**The sign-in tier is cut.** The original plan had a second `/ask` tier where visitors signed in with GitHub or Google (Auth.js) could post without moderation. The owner dropped it. Every visitor message is moderated, which removes the main abuse risk of unreviewed public posts. It also removes the need for an auth library, OAuth apps, public callback URLs and a privacy page. The only signed-in role is the owner, through a passphrase (section 6).

**Deployment is deferred.** The site is built and tested on localhost only, so nothing depends on host-specific services. Bot protection, WAF rules and analytics from the original plan are out, and the store-free circuit breaker covers availability. What deployment would add:

- A public URL for the Sanity revalidation webhook. Until then, use a tunnel or rebuild.
- `NEXT_PUBLIC_SITE_URL` set to the real domain.
- That domain added to the Sanity CORS origins.

No code change is expected when that happens.

## 9. Visitor counter

The footer shows "12,408 visitors" without making any page dynamic and without a database beyond Sanity.

- **Storage.** A singleton `siteStats` document (`_id: "siteStats"`, fields `visitors` and `updatedAt`), read-only in Studio under "Site stats". `POST /api/visits` creates it on the first visit and increments it in one transaction (`createIfNotExists`, then `setIfMissing({ visitors: 0 }).inc({ visitors: 1 })`), so concurrent visits never lose a count. It needs `SANITY_API_WRITE_TOKEN` and `ASK_COOKIE_SECRET`; without them both routes answer 503 and the counter renders nothing.
- **Unique per day.** A counted browser gets `hr_seen`, an httpOnly cookie holding `<UTC day>.<HMAC>` (signed with the `/ask` helpers) that expires at the next UTC midnight. It carries no identifier. With a valid cookie for today, the route returns the count without incrementing.
- **Not counted.** Crawler, unfurler, monitor and scripted user agents, and any request without `Sec-Fetch-*` headers, read the count without adding to it. Cross-site requests and non-JSON bodies are refused, and an in-memory fixed window limits each client address (10 a minute, or 120 for the shared bucket when no trusted proxy is configured).
- **Reads.** `GET /api/visits` returns `{ visitors }` with `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- **Client.** `components/visitor-counter/visitor-counter.tsx` posts once per tab session (a `sessionStorage` flag; later loads use the cached GET) inside `requestIdleCallback`. When the count arrives, it lazy-loads `animated-count.tsx`, which renders [NumberFlow](https://number-flow.barvian.me) (`@number-flow/react`, about 6 KB gzipped, kept out of the shared bundle) and rolls from the last count this browser saw (`localStorage`, else 0) to the new one. NumberFlow skips the animation under `prefers-reduced-motion`, and the site's motion preference turns it off through `animated`. Screen readers get the plain formatted number. Space for "000,000 visitors" is reserved up front so nothing shifts.
- **Webhook.** Every counted visit writes a document, so the revalidation webhook should use the filter `_type != "siteStats"`, or it fires (and is ignored) on each visit.

The logic lives in `lib/visits/` (`handler.ts` takes its store, clock and limiter as arguments and is tested without Next or Sanity). The route file only wires in the real ones.
