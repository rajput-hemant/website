# /ask runbook

Anonymous messages posted to `/ask` go through `POST /api/ask` and land in
Sanity. Nothing is ever published automatically: every message waits for the
owner in Studio.

## Moderation in Studio

1. Open `/studio` → **Inbox**. Lists: Pending, Published, Rejected, Spam, All.
2. New messages arrive as **Pending**. Ones the heuristics flagged arrive as
   **Spam** and only show up if you open that list.
3. Open a message, optionally write an **answer**, then use a document action:
   - **Publish answer**: sets `status: published` and `publishedAt`, and makes it
     public on `/ask` and `/ask/<slug>`.
   - **Reject**: hides it for good.
   - **Mark spam**: moves it to the Spam list.
4. The **Private** tab shows `author.email`, `author.anonId` and `moderation`
   (heuristics score and reasons, IP hash, user agent, time to submit). These are
   never selected by public queries.

## What the route checks, in order

Cheapest first, so a refused request costs as little as possible:

| Step | Check                                                               | Refusal                                    |
| ---- | ------------------------------------------------------------------- | ------------------------------------------ |
| 1    | Body over 4 KB                                                      | 413                                        |
| 2    | JSON, Zod shapes and lengths                                        | 400 with `fieldErrors`                     |
| 3    | Honeypot `website` filled, or sent under 3 s after the form mounted | 200, nothing written                       |
| 4    | Form open longer than 6 h                                           | 400 "reload and try again"                 |
| 5    | Sanity or the cookie secret not configured                          | 503 "The inbox isn't connected yet"        |
| 6    | Circuit breaker: pending count at the cap (count cached 30 s)       | 503 "Not accepting new messages right now" |
| 7    | Same visitor has an open thread, or an answer under 24 h old        | 429 with a message                         |
| 8    | Identical body already pending                                      | 200, nothing written                       |
| 9    | Heuristics (links, repeated characters, all caps, profanity)        | Written as `spam`, still 200               |
| 10   | Write as `pending`                                                  | 200 `{ ok: true, slug }`                   |

A thread is open while it is pending, flagged as spam, or published without an
answer, for up to 7 days after submission. The visitor is identified by the signed
`hr_anon` cookie; when it is missing or forged, the salted IP hash is checked too.

## Where the limits live

Every number is in `lib/ask/config.ts`: field lengths, the 4 KB request cap,
the 3 s to 6 h window, the 7-day open thread and 24 h cooldown, the replies-per-day
value (kept for the future reply route), heuristic weights and the spam threshold,
the circuit-breaker cap and cache time, cookie name and lifetime.

## Changing the circuit-breaker cap

Set `ASK_PENDING_CAP` (a positive integer, default 200) and restart the server.
The form closes once that many messages are pending and reopens as you clear the
inbox (within 30 seconds, the cache lifetime). Rejecting or publishing pending
messages is the usual way to reopen it.

## Environment variables

| Variable                        | Required | Purpose                                                                                                                                            |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes      | Sanity project. Empty means the route answers 503.                                                                                                 |
| `NEXT_PUBLIC_SANITY_DATASET`    | no       | Defaults to `production`.                                                                                                                          |
| `SANITY_API_WRITE_TOKEN`        | yes      | Editor token used to read counts and create questions.                                                                                             |
| `ASK_COOKIE_SECRET`             | yes      | Signs the `hr_anon` cookie and salts IP hashes. Use 32+ random bytes, e.g. `openssl rand -base64 32`. Changing it resets every visitor's identity. |
| `ASK_PENDING_CAP`               | no       | Circuit-breaker cap, default 200.                                                                                                                  |

## Trying it locally

```sh
T=$(( $(date +%s%3N) - 10000 ))
curl -i -X POST localhost:3000/api/ask -H 'content-type: application/json' \
  -d "{\"body\":\"Hello there, testing the inbox\",\"t\":$T}"
```
