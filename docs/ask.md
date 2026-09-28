# /ask runbook

`/ask` is a moderated, threaded chat. Visitors start **threads** (a question,
a comment, a hello) and reply inside published ones. The owner replies on the
site itself. Every visitor message waits for approval; the owner's messages
publish at once. The pages stay statically rendered: publishing expires the
`question` cache tag in the same request, so the next page load shows it.

## The chat model

- **Thread:** one Sanity `question` document. Its opening message is `body`,
  written by a visitor (`by: visitor`) or the owner (`by: owner`), with a
  `status` of `pending`, `published`, `rejected` or `spam`.
- **Replies:** the thread's `replies[]` array. Each reply has a `_key`, `by`,
  `authorName`, `body`, `createdAt` and its own `status`, plus private
  `anonId` and `moderation` fields. Replies are appended atomically
  (`setIfMissing({ replies: [] }).append(...)`), so concurrent replies never
  overwrite each other.
- **Feed order:** `lastActivityAt`, set when the thread is published and on
  every published reply. `/ask` lists 20 threads per page (`/ask/page/2`, ...),
  latest activity first. Each thread has a permalink at `/ask/<slug>`.
- **Public reads** select only published threads and filter replies to
  `status == "published"`. Private fields (`author.anonId`, `moderation`, and
  each reply's `anonId` and `moderation`) are never selected.
- **Pending echo:** after sending, a visitor sees their own message in place,
  dimmed and labelled "Only you can see this until it's approved". It lives in
  `localStorage` (`hr.ask.pending`) and disappears once the message shows up in
  the published data, or after 14 days. The display name is remembered in
  `hr.ask.name`. There is no email field.
- **Legacy answers:** threads from the old form stored the owner's reply in an
  `answer` field. The data layer shows it as an owner reply, and
  `bun run doctor --fix` moves it into `replies[]` for good (see below).

## Owner mode

Sign in on the site to reply, and to moderate without opening Studio.

1. Set `ASK_OWNER_PASSPHRASE` in `.env.local` to a long random string
   (`openssl rand -base64 32`) and restart the server. It never reaches the
   browser. `ASK_COOKIE_SECRET` must be set too: it signs the session cookie.
2. Open `/owner` (not linked anywhere, `noindex`) and enter the passphrase.
   `POST /api/owner/session` compares SHA-256 digests with `timingSafeEqual`,
   allows 5 failed attempts per 15 minutes per client-address bucket, and sets
   `hr_owner`: an HMAC-signed cookie (signed with `ASK_COOKIE_SECRET`, bound to
   the passphrase) that lasts 30 days, `httpOnly`, `SameSite=Strict`, and
   `Secure` in production.
3. While signed in, on `/ask` and every permalink:
   - the composer posts as the owner, and new threads and replies publish
     immediately;
   - a **Moderation** strip above the feed lists pending threads and replies
     (and recent spam), each with **Approve**, **Reject** and **Spam**;
   - each published visitor message has a small menu to **Hide** (reject) or
     **Mark spam**.
4. Sign out from `/owner` (`DELETE /api/owner/session`). Changing
   `ASK_OWNER_PASSPHRASE` or `ASK_COOKIE_SECRET` signs out every device.

The sign-in lock counts failed attempts per client-address bucket, held in
the server's memory (a restart clears it). Without `ASK_TRUST_PROXY` every
visitor shares one bucket (see "Client addresses and the daily cap"), so
anyone's five wrong guesses lock **you** out for 15 minutes too. Behind a
reverse proxy, set `ASK_TRUST_PROXY` so each address gets its own bucket.

Pages never read the cookie, so they stay static. The client asks
`GET /api/owner/session` once per page load (`{ owner: boolean }`, not cached)
and loads the queue from the owner-only `GET /api/ask/moderation`.

## Moderation flows

**On the site (owner mode).** Approve, Reject and Spam call
`POST /api/ask/moderate` with `{ slug, target, action }`, where `target` is
`"thread"` or a reply's `_key` and `action` is `publish`, `reject` or `spam`.
Publishing sets the status, stamps `publishedAt` (threads) and
`lastActivityAt`, and expires the `question` tag, so the message is public on
the next load.

**In Studio.** Open `/studio` → **Inbox**:

1. Lists: Pending, Published, Rejected, Spam, All threads. Pending also lists
   threads with pending replies, and Spam threads with replies flagged as spam.
2. New messages arrive as **Pending**. Ones the heuristics flagged arrive as
   **Spam** and only show up if you open that list.
3. Document actions on a thread:
   - **Publish** (or **Update** once it is live): sets `status: published`,
     `publishedAt` and `lastActivityAt`.
   - **Approve reply** / **Approve N replies**: publishes every pending reply
     in the thread and bumps `lastActivityAt`. To approve, hide or flag a single
     reply, set its **status** field in the replies list and publish.
   - **Reject** and **Mark spam**.

   Studio publishes reach the site through the signed webhook (see
   [sanity.md](sanity.md)); the site's own moderation revalidates at once.

4. The **Private** tab shows `author.anonId` and `moderation` (heuristics score
   and reasons, IP hash, user agent, time to submit).

## What the routes check, in order

`POST /api/ask` (start a thread) and `POST /api/ask/<slug>/replies` (reply)
share one pipeline, cheapest first, so a refused request costs as little as
possible:

| Step | Check                                                                                                                    | Refusal                                    |
| ---- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| 1    | `Sec-Fetch-Site` present and not `same-origin` or `none`                                                                 | 403                                        |
| 2    | `Content-Type` is not `application/json`                                                                                 | 415                                        |
| 3    | Body over 4 KB                                                                                                           | 413                                        |
| 4    | JSON, Zod shapes and lengths                                                                                             | 400 with `fieldErrors`                     |
| 5    | Honeypot `website` filled, or sent under 3 s after the composer mounted                                                  | 200, nothing written                       |
| 6    | Composer open longer than 6 h                                                                                            | 400 "reload and try again"                 |
| 7    | Sanity or the cookie secret not configured                                                                               | 503 "The inbox isn't connected yet"        |
| 8    | Replies only: the thread isn't published                                                                                 | 404                                        |
| 9    | A valid owner cookie: publish at once and revalidate, skipping steps 10 to 14                                            | 200 `status: "published"`                  |
| 10   | Circuit breaker: pending threads and replies, plus spam from the last 24 h, at the cap (cached 30 s)                     | 503 "Not accepting new messages right now" |
| 11   | Daily cap for the connection (see below), threads and replies together, cookie or not; replies also per identity per day | 429 with a message                         |
| 12   | Pending limit in the last 7 days: 1 pending thread, or 3 pending replies, per identity                                   | 429 with a message                         |
| 13   | Identical body already pending or flagged as spam                                                                        | 200, nothing written                       |
| 14   | Heuristics (links, repeated characters, all caps, profanity)                                                             | Written as `spam`, still 200               |
| 15   | Write as `pending`                                                                                                       | 200 `status: "pending"`                    |

Steps 1 and 2 stop cross-site posts: a form or `no-cors` fetch on another site
cannot send `application/json`, and browsers label such requests
`Sec-Fetch-Site: cross-site`. Clients that omit the header (curl, old browsers)
still have to send JSON. The owner routes (`/api/owner/session`,
`/api/ask/moderation`, `/api/ask/moderate`) keep the same origin, JSON and size
guards, and the moderation routes answer 401 without a valid owner cookie.

A message counts as pending for its sender while it is pending or flagged as
spam, for up to 7 days. The visitor is identified by the signed `hr_anon`
cookie; when it is missing or forged, the salted IP hash is checked too, but
only when the address comes from a trusted proxy.

## Client addresses and the daily cap

Clearing cookies mints a new identity, so the IP hash is what bounds a
determined sender. It is only as good as the address behind it:

- **No proxy (the default, `ASK_TRUST_PROXY` unset).** Next receives requests
  directly and `X-Forwarded-For` is whatever the client sent, so it is ignored.
  Every visitor falls into one shared bucket, and its daily cap (30 messages in
  24 hours) is effectively a global one. The bucket never counts as an identity
  for the pending limits, or one visitor's message would block everyone else.
  Owner sign-in attempts share that bucket too.
- **Behind a reverse proxy.** Set `ASK_TRUST_PROXY` to the number of proxies
  that append to `X-Forwarded-For` (usually `1`, e.g. nginx with
  `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`). The client
  address is read that many entries from the right, so values a client prepends
  are ignored. Each address then gets its own cap (5 messages in 24 hours),
  which applies even to visitors with a valid cookie.

Spam counts toward the caps and the breaker like any other submission, so a
flood of flagged messages closes the composer instead of writing documents
without bound. Spam older than 24 hours stops counting toward the breaker, so
an uncleared Spam list does not keep it closed.

## Where the limits live

Every number is in `lib/ask/config.ts`: field lengths, the 4 KB request cap,
the 3 s to 6 h window, the pending limits and their 7-day window, replies per
day, the daily caps per address and for the shared bucket, heuristic weights
and the spam threshold, the circuit-breaker cap, spam window and cache time,
the owner session lifetime and sign-in attempt limit, and cookie names.

## Changing the circuit-breaker cap

Set `ASK_PENDING_CAP` (a positive integer, default 200) and restart the server.
The composer closes once that many messages are pending (plus spam from the
last 24 hours) and reopens as you clear the queue (within 30 seconds, the cache
lifetime).

## The doctor script

`bun run doctor` checks the dataset for two kinds of drift and changes nothing
unless you pass `--fix`:

- **Duplicate content documents**, grouped by what makes them the same to a
  reader: education by institution, degree and end year; experience by company
  and start date; projects by slug; skill groups by title; updates by date and
  text (text compared case- and whitespace-insensitively). For each group it
  prints which copy stays and which go. The seed-owned copy (`<type>-<id>`, as
  written by `bun run seed`) always stays, so Studio edits to it survive; when
  no copy is seed-owned, the most recently updated one stays.
- **Legacy answers:** threads that still have an `answer` field, which `--fix`
  folds into a published owner reply.

```text
Checking abc123/production…

education: gyan deep shiksha bharati | intermediate (cbse) | 2020
  keep    education-gyan-deep-intermediate  updated 2026-09-01T10:00:00Z  (seed)
  remove  8f1c2d3e4b5a                      updated 2026-09-10T08:12:44Z  (has draft)

No legacy answers to migrate.

Run `bun run doctor --fix` to delete 2 document(s) and migrate 0 answer(s).
```

`bun run doctor --fix` deletes the extra copies, with their `drafts.` versions,
and migrates the answers in one transaction. It needs
`NEXT_PUBLIC_SANITY_PROJECT_ID` and `SANITY_API_WRITE_TOKEN` in `.env.local`
and stops with a clear message without them. Studio also warns when you save an
education entry that matches another published one.

## Environment variables

| Variable                        | Required       | Purpose                                                                                                                                                             |
| ------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes            | Sanity project. Empty means the routes answer 503.                                                                                                                  |
| `NEXT_PUBLIC_SANITY_DATASET`    | no             | Defaults to `production`.                                                                                                                                           |
| `SANITY_API_WRITE_TOKEN`        | yes            | Editor token used to read counts, write threads and replies, moderate, and run the doctor script.                                                                   |
| `ASK_COOKIE_SECRET`             | yes            | Signs the `hr_anon` and `hr_owner` cookies and salts IP hashes. Use 32+ random bytes, e.g. `openssl rand -base64 32`. Changing it resets every identity.            |
| `ASK_OWNER_PASSPHRASE`          | for owner mode | The passphrase `/owner` accepts. A long random string, e.g. `openssl rand -base64 32`. Owner sign-in needs it and `ASK_COOKIE_SECRET`; without them it answers 503. |
| `ASK_PENDING_CAP`               | no             | Circuit-breaker cap, default 200.                                                                                                                                   |
| `ASK_TRUST_PROXY`               | no             | Number of reverse proxies that append to `X-Forwarded-For`. Unset or `0` ignores the header. See "Client addresses and the daily cap".                              |

## Request bodies

Starting a thread (`POST /api/ask`) and replying (`POST /api/ask/<slug>/replies`)
take the same body:

```json
{
  "body": "10 to 1000 characters",
  "name": "optional",
  "website": "",
  "elapsed": 12000
}
```

`website` is the honeypot and must stay empty. `elapsed` is the whole number of
milliseconds between the composer mounting and the submit, measured in the
browser with `performance.now()`. It is a duration, not a timestamp, so a
visitor whose clock is off is never mistaken for a bot; the server only checks
that it falls inside the 3 s to 6 h window.

A thread answers `{ ok: true, slug, status }` and a reply
`{ ok: true, slug, key, status }`, where `status` is `pending`, or `published`
for the owner.

## Trying it locally

```sh
curl -i -X POST localhost:3000/api/ask -H 'content-type: application/json' \
  -d '{"body":"Hello there, testing the inbox","elapsed":10000}'
```
