# Architecture

Last verified: 2026-09-27 at `b50faeb`.

Sections 3, 4 (with its Sound subsection) and 9 describe the Minimal edition. Each other edition has its own prefs, deferred interaction layer and visitor counter under `flavors/<id>/`, on the shared mechanics listed in [flavors.md](flavors.md); Field Survey and Press Proof adopt the shared standard schema in `lib/prefs/standard.ts`.

This document records the decisions that shape the codebase and why each was made. For setup, see [sanity.md](sanity.md) and [ask.md](ask.md).

The governing design rule: the site is minimal and text-first, and interaction is a thin layer of small, precise moments on top. Any effect that makes text slower to read or harder to select, or that works worse with a keyboard, a screen reader, reduced motion or a touch device, is cut.

## 1. Static rendering with tag revalidation

**Decision.** Every public page is statically rendered. Each Sanity read is a `force-cache` fetch tagged with its document type and has no time-based revalidation. A signed Sanity webhook calls `POST /api/revalidate`, which calls `revalidateTag(<type>)`. The next request then re-renders the affected pages, and they are cached again. `cacheComponents` stays off.

**Why not the Live Content API.** A portfolio is read far more often than it changes. The owner wanted pages served as fast as possible: fresh shortly after an edit, and fully static the rest of the time. Live mode (`defineLive` with `<SanityLive>` on every page) makes each page subscribe and keeps rendering dynamic. That buys sub-second freshness nobody needs, at the cost of a slower, costlier default. Tag revalidation gives static pages that turn over within one request of a publish.

**Where live still exists.** `<SanityLive>` (with `<VisualEditing>`, in `sanity/components/draft-mode-tools.tsx`) renders only in draft mode, which Studio's Presentation tool enables for the owner. Only Minimal's root layout mounts it today, so live draft refresh works in the default edition only. In draft mode `sanityFetch` reads drafts with the viewer token and skips the cache. Public visitors never enter it.

**Consequences.**

- Public pages must never read cookies, headers or `searchParams`, because any of them makes a page dynamic. `/ask` pagination therefore uses static segments (`/ask/page/2`) instead of `?page=2`.
- Dynamic segments that grow over time (`/ask/[slug]`, `/ask/page/[page]`) prerender what exists at build time and keep `dynamicParams = true`. A new entry is rendered on its first request and then cached like the rest.
- Without a webhook (for example on localhost with no tunnel), `bun run build` is the way to pick up changes.

Tags, one per document type: `profile`, `experience`, `project`, `now`, `update`, `skillGroup`, `education`, `question`. They are defined in `sanity/lib/fetch.ts`, and the webhook route accepts only these.

## 2. The data-layer contract

Pages depend on a small contract, not on Sanity:

- **Domain types** in `lib/data/types.ts`: `Profile`, `Experience`, `Project`, `Now`, `Update`, `SkillGroup`, `Education` and `Question`. Rich text is Portable Text blocks (`RichText`). Pages never touch raw Sanity documents or generated query types.
- **Accessors** in `lib/data/index.ts`: `getProfile`, `getExperience`, `getProjects`, `getNow`, `getChangelog`, `getSkills`, `getEducation` and `getQuestions({ page, pageSize })`. They are async, server-only and deduplicated per render with React `cache()`. Ordering is part of the contract: experience is newest first with `continuedFrom` derived, projects are featured first, and questions are published only, newest first. `lib/markdown/questions.ts`'s `findPublishedQuestion(slug)` looks up one published thread, from the same cached pages `getQuestions` already fetched.
- **Mappers** (`lib/data/<type>.ts`) convert GROQ results into domain types. Schema changes are absorbed there, not in pages.

**The fallback is isolated and temporary.** When `NEXT_PUBLIC_SANITY_PROJECT_ID` is empty (`isSanityConfigured === false` in `lib/env.ts`), accessors serve the bundled content in `content/fallback/`. `lib/data/fallback.ts` is the only module that imports it, and pages never do. The same content is what `scripts/seed.ts` writes into Sanity. This keeps the site buildable and complete before a Sanity project exists.

With Sanity configured, accessors read only from Sanity. A failed request or a missing singleton throws, so the build fails loudly instead of silently shipping stale bundled content. Once Sanity is the only source, `lib/data/fallback.ts` and `content/fallback/` can be deleted along with the `isSanityConfigured` branches, and no page needs to change.

## 3. The preference system

The Customize panel, the theme toggle and the interaction layer all share one preference system instead of several libraries. It replaces `next-themes`, which would have been a second system doing the same job.

- **Model:** `flavors/minimal/lib/prefs.ts` defines `Prefs` (theme, accent hue, reading font, texture, and the motion, scene, smooth-scroll, cursor, sound and link-preview settings) with `defaultPrefs`. The defaults are calm: smooth scroll, cursor, sound and texture are off; motion and link previews are on. Preferences persist as JSON in `localStorage` under `hr.prefs`, and `migrateStoredPrefs` drops unknown keys (such as the retired `radius`, now a fixed token).
- **Pre-hydration script:** `flavors/minimal/components/prefs/prefs-script.tsx` inlines a render-blocking script in `<head>` (through the shared `PrePaintScript`). It reads the stored preferences and applies them before first paint, so there is no flash of the wrong theme, font or accent. It embeds `migrateStoredPrefs` and `applyPrefs` (`components/prefs/apply-prefs.ts`) through `toString()`, so both must stay self-contained and tolerate malformed stored values.
- **`data-*` attributes:** `applyPrefs` writes `data-theme`, `data-accent`, `data-font`, `data-texture`, `data-motion`, `data-scene`, `data-smooth-scroll`, `data-cursor`, `data-sound` and `data-link-previews` onto `<html>`, plus the `--accent-hue` CSS variable. CSS keys off these attributes, so styling needs no JavaScript at render time. `data-theme` resolves `system` through the colour-scheme media query. `data-motion` is off when either the preference is off or the OS asks for reduced motion.
- **Store:** `flavors/minimal/lib/prefs-store.ts` binds the shared `createPrefsStore` (`lib/prefs/store.ts`), a `useSyncExternalStore` store (`usePrefs`, `setPrefs`, `resetPrefs`, `subscribePrefs`). It returns the defaults during SSR and hydration, which keeps server HTML identical for every visitor and the pages static. It also syncs across tabs through the `storage` event.
- **Sync:** `flavors/minimal/components/prefs/prefs-sync.tsx` re-applies attributes after hydration when preferences or OS media queries change. It deliberately does nothing on mount, because the script already applied the stored values and the store briefly reports defaults.

## 4. Interaction-layer gating

`flavors/minimal/components/interaction/interaction-layer.tsx` mounts the optional effects client-side. Each effect mounts only when its preference is on and the device suits it:

| Effect                  | Preference (default) | Also requires                                              |
| ----------------------- | -------------------- | ---------------------------------------------------------- |
| Smooth scroll (Lenis)   | `smoothScroll` (off) | Fine pointer with hover, `motion` on, no reduced motion    |
| Cursor follower         | `cursor` (off)       | Fine pointer with hover, `motion` on, no reduced motion    |
| Live texture            | `texture` (none)     | A live texture, `motion` on, no reduced motion             |
| Link previews           | `linkPreviews` (on)  | Fine pointer with hover; no animation under reduced motion |
| Click sound             | `sound` (off)        | Fine pointer with hover (confirmations play on touch too)  |
| Reveals, page crossfade | `motion` (on)        | No reduced motion                                          |
| `/lab` scenes           | `motion` (on)        | WebGL support, no reduced motion (else static image)       |

The Customize panel's "3D" row (`scene`, default auto) writes `data-scene`, but no Minimal code reads it yet: the `/lab` stage gates on motion and WebGL only.

The rules behind the table:

- **Nothing renders on the server or during hydration.** The media-query hooks and the store report `false` and defaults, so the first paint is plain, readable HTML.
- **Reduced motion always wins.** Reveals are pure CSS, gated by the `data-motion` attribute `applyPrefs` writes to `<html>` under a `prefers-reduced-motion: no-preference` media query. `PageTransition` (React `<ViewTransition>`) reads `usePrefersReducedMotion()` directly to fall back to a plain crossfade. The only animation library on this edition is Motion (`motion/react`), used by the live texture and loaded only when that texture is on. Either the OS reduced-motion setting or the `motion` preference being off is enough to stop all of it.
- **Native behaviour is preserved.** Lenis is native-scroll based, uses `syncTouch: false` and resolves anchors itself, so keyboard scrolling, find-in-page, `:target` and touch momentum stay native. The cursor is a follower: the native cursor stays visible, and the follower is `aria-hidden` and never hit-testable.
- **Loops sleep.** The Lenis and cursor rAF loops park when idle or when the tab is hidden. Lab canvases render on demand, cap DPR at 1.5, and stop entirely offscreen or in a background tab.
- **Code stays off routes that don't need it.** Every piece of the layer, and the lab scenes, load through `next/dynamic` with `ssr: false` only for visitors who get them, so the defaults ship none of that code and three.js appears only on `/lab/[slug]`.
- **Studio is exempt.** The interaction layer and the page transition render nothing under `/studio`.

### Sound: paper and nib (`lib/sound/voices.ts`, tested)

Off by default; turning it on in Customize previews `setOn`, and that click unlocks audio. Every voice is synthesized by the shared engine (`lib/sound.ts`), with no samples, and every voice peaks at gain 0.07 or less. The recipes and the click mapping live in `flavors/minimal/lib/sound/voices.ts`. Press owns the stamp and Drawing Set the pencil (improvements audit 2.2), so Minimal confirms with `blot` and links with `flick`.

| Voice            | Where it plays                                                    | Recipe                                                                                                                  |
| ---------------- | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `flick`          | Internal links                                                    | 8ms of noise highpassed at 5kHz, gain 0.03.                                                                             |
| `flickOut`       | External links, `target="_blank"` and `mailto:`                   | Two flicks 40ms apart, the second at half, gain 0.03.                                                                   |
| `set`            | Buttons and radios                                                | 6ms of noise highpassed at 1.8kHz over a triangle body 620 to 420Hz in 25ms, gain 0.055.                                |
| `setOn/Off`      | Switches, by the state the click turns them to                    | The `set` body at 700Hz (on) or 520Hz (off).                                                                            |
| `setLight/Dark`  | The theme toggle and the Customize Light and Dark options         | The `set` body at 760Hz (light) or 380Hz (dark), gain 0.05.                                                             |
| `leafOpen/Close` | Every `Disclosure` (`<details>`), through ClickSound's `onToggle` | Noise bandpassed Q 0.9, swept 1.2 to 3.8kHz on open (panned +0.15) or 3.8 to 1.2kHz on close (-0.15), 140ms, gain 0.03. |
| `blot`           | Email copied (the copy button and the ⌘K action)                  | Sine 140 to 90Hz plus noise lowpassed at 600Hz, 40ms, gain 0.07: a felt thud.                                           |
| `sent`           | Ask message or reply sent, owner signed in                        | Noise bandpassed 600 to 2400Hz over 240ms, then sines at 1320 and 1760Hz (0.3), gain 0.04.                              |
| `knock`          | A send that failed with a general error, a wrong passphrase       | Two `set` bodies at 420Hz, lowpassed at 1.5kHz, 70ms apart, gain 0.05.                                                  |

- **Mapping.** `interaction/sound-layer.tsx` mounts `ClickSound` with `voiceFor` and `voiceForToggle`. ClickSound hears clicks in the capture phase, so `aria-checked` and `data-theme` still hold the state before the click. `data-voice="<name>"` picks a voice (`theme` resolves the direction), `data-voice="none"` silences a control (the copy button, which blots only once the copy lands), and `SegmentedOption.voice` sets it on an option. The option already chosen and everything inside ⌘K stay silent.
- **Hit areas.** Customize's labelled effect switches stretch the Base UI root over the row, so a click on the text lands on `role=switch` instead of the hidden input.
- **Confirmations** (`blot`, `sent`, `knock`) go through `lib/sound/confirm.ts`, which loads the recipes and the engine only when `data-sound` is on, and play on their own budget so the click that caused one never starves it.
- **Touch:** UI clicks are silent (the click layer mounts for fine pointers only); confirmations still play. **Keyboard:** link activation is silent; buttons and switches keep their sound. **Reduced motion:** event sounds stay; this edition has no ambient or scroll-linked sound. **Hidden tab or sound off:** nothing plays and the context suspends. A disclosure opened by a hash on load stays quiet (`navigator.userActivation.isActive`).

## 5. Route map

Public URLs stay clean (`/work`, `/projects`, …). There is no shared `app/layout.tsx`: every edition has its own static tree under `app/f/<flavor>/` with its own root layout (the `<html>`, the pre-paint preference script, fonts and chrome), and the picker (`app/flavors`) and Studio have theirs. Shared routes (`app/api/**`, `app/md/**`, `app/ask/feed.xml`, `app/search.json`, `app/studio`, `app/flavors`) are never rewritten; `proxy.ts` rewrites every other page request to the visitor's edition tree from the `hr_flavor` cookie (see [flavors.md](flavors.md)). Studio and the API sit outside the edition trees, so they get none of the site chrome.

| Route (clean URL)                                   | Rendering               | Purpose                                                                 |
| --------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| `/`                                                 | Static                  | Home: intro, experience, selected projects, now (per edition)           |
| `/work`                                             | Static                  | Experience, plus skills and education where the edition shows them      |
| `/projects`                                         | Static                  | All projects (each edition picks its order)                             |
| `/projects/[slug]`                                  | Static or redirect      | One project; Minimal redirects to `/projects`                           |
| `/now`                                              | Static                  | Current focus; some editions also host the changelog log                |
| `/changelog`                                        | Static or redirect      | Dated one-liners on Minimal; other live editions redirect to `/now#log` |
| `/about`                                            | Static or redirect      | Static on every edition except Minimal, which redirects to `/work`      |
| `/resume`                                           | Static                  | Print-styled resume from the same data                                  |
| `/ask`, `/ask/page/[page]`                          | Static, paginated       | Chat feed of published threads, with the composer                       |
| `/ask/[slug]`                                       | Static, grows on demand | One thread and its reply composer, with an OG image                     |
| `/ask/feed.xml`                                     | Static                  | RSS feed of threads, replies included                                   |
| `/owner`                                            | Static, `noindex`       | Owner sign-in for replying and moderating on the site                   |
| `/lab`, `/lab/[slug]`                               | Static                  | Experiment index and one canvas per experiment                          |
| `/<page>.md`, `/llms.txt`                           | Static (through proxy)  | Markdown mirrors and their index                                        |
| `/sitemap.xml`, `/robots.txt`, OG and icons         | Static                  | Metadata routes                                                         |
| `/flavors`                                          | Static                  | Edition picker                                                          |
| `/studio/[[...tool]]`                               | Static shell            | Embedded Sanity Studio                                                  |
| `POST /api/ask`, `POST /api/ask/[slug]/replies`     | Dynamic                 | Start a thread, reply to one                                            |
| `GET`/`POST`/`DELETE /api/owner/session`            | Dynamic                 | Owner session: check, sign in, sign out                                 |
| `GET /api/ask/moderation`, `POST /api/ask/moderate` | Dynamic, owner only     | Moderation queue and actions                                            |
| `POST /api/revalidate`                              | Dynamic                 | Sanity webhook target                                                   |
| `/api/draft-mode/enable`, `/api/draft-mode/disable` | Dynamic                 | Draft preview for the owner                                             |

`content/site.ts` defines `pages`, the list of mirrored pages. That list drives the sitemap, `llms.txt` and the mirror slugs. Each edition's nav and sheet labels live in `flavors/<id>/content.ts`. The lab experiments are registered in `content/lab.ts`.

## 6. `/ask`: a moderated chat on static pages

`/ask` is a threaded chat: visitors start threads and reply to published ones, and the owner replies on the site. A thread is one `question` document with a `replies[]` array; each reply carries its own moderation `status`. Replies are appended atomically, and `lastActivityAt` orders the feed.

**Static pages, instant publishing.** The feed, permalinks, RSS and markdown mirrors are static and tagged `question`. Every publish (an owner message, or an approval) calls `revalidateTag("question")` in the same request, so the next load shows it without the webhook. After posting, the client calls `router.refresh()`. A visitor's own pending messages are echoed from `localStorage` until they appear in the published data, so nothing personal is ever rendered on the server.

**Owner mode without an auth library.** One passphrase (`ASK_OWNER_PASSPHRASE`) is exchanged at `/owner` for `hr_owner`, an HMAC-signed 30-day cookie signed with `ASK_COOKIE_SECRET` by the same helpers as the visitor cookie. Pages never read it: an `OwnerProvider` asks `GET /api/owner/session` once per load, and the moderation queue comes from an owner-only endpoint. Owner messages skip moderation; every visitor message is still reviewed.

**Abuse-control order.** The write routes share one pipeline (`lib/ask/submission-route.ts` wires `lib/ask/submit.ts`), cheapest first, and nothing touches Sanity before the global ceiling has been checked:

1. Same-origin, JSON-only and body size (4 KB) guards, checked before JSON parsing (`lib/ask/route-helpers.ts`).
2. JSON and Zod validation of shapes and lengths.
3. Honeypot field and minimum time-to-submit (3 s). A failure gets a fake success and nothing is written, so bots learn nothing. The owner skips this step and the next.
4. Maximum composer age (6 h).
5. Configuration: without Sanity or `ASK_COOKIE_SECRET`, the route answers 503.
6. Circuit breaker (visitors only): when pending threads and replies, plus spam from the last 24 hours (cached for 30 s), reach `ASK_PENDING_CAP`, the route answers 503.
7. Replies only: a thread that is missing, or not published, answers 404. The owner may reply to a thread before approving it.
8. A valid owner cookie publishes at once and skips the rest.
9. Rate limits: daily caps per connection, replies per identity per day, and at most one pending thread and three pending replies per identity. The visitor is identified by the signed `hr_anon` cookie, with a salted IP hash as the fallback.
10. Duplicate of a pending body: a fake success.
11. Heuristics (links, repeated characters, all caps, profanity) choose `spam` or `pending`.
12. Write. The owner approves, rejects or marks spam on the site or in Studio.

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
- **Client.** The shared hook `components/semantic/visitor-count/use-visitor-count.ts` posts once per tab session (a `sessionStorage` flag; later loads use the cached GET) inside `requestIdleCallback`. Minimal's `flavors/minimal/components/visitor-counter/visitor-counter.tsx` renders it: when the count arrives, it lazy-loads `animated-count.tsx`, which renders [NumberFlow](https://number-flow.barvian.me) (`@number-flow/react`, about 6 KB gzipped, kept out of the shared bundle) and rolls from the last count this browser saw (`localStorage`, else 0) to the new one. NumberFlow skips the animation under `prefers-reduced-motion`, and the site's motion preference turns it off through `animated`. Screen readers get the plain formatted number. Space for "000,000 visitors" is reserved up front so nothing shifts.
- **Webhook.** Every counted visit writes a document, so the revalidation webhook should use the filter `_type != "siteStats"`, or it fires (and is ignored) on each visit.

The logic lives in `lib/visits/` (`handler.ts` takes its store, clock and limiter as arguments and is tested without Next or Sanity). The route file only wires in the real ones.
