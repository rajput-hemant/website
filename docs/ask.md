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

| Step | Check                                                                       | Refusal                                    |
| ---- | --------------------------------------------------------------------------- | ------------------------------------------ |
| 1    | `Sec-Fetch-Site` present and not `same-origin` or `none`                    | 403                                        |
| 2    | `Content-Type` is not `application/json`                                    | 415                                        |
| 3    | Body over 4 KB                                                              | 413                                        |
| 4    | JSON, Zod shapes and lengths                                                | 400 with `fieldErrors`                     |
| 5    | Honeypot `website` filled, or sent under 3 s after the form mounted         | 200, nothing written                       |
| 6    | Form open longer than 6 h                                                   | 400 "reload and try again"                 |
| 7    | Sanity or the cookie secret not configured                                  | 503 "The inbox isn't connected yet"        |
| 8    | Circuit breaker: pending + spam from the last 24 h at the cap (cached 30 s) | 503 "Not accepting new messages right now" |
| 9    | Daily cap for the connection (see below), cookie or not                     | 429 with a message                         |
| 10   | Same visitor has an open thread, or an answer under 24 h old                | 429 with a message                         |
| 11   | Identical body already pending or flagged as spam                           | 200, nothing written                       |
| 12   | Heuristics (links, repeated characters, all caps, profanity)                | Written as `spam`, still 200               |
| 13   | Write as `pending`                                                          | 200 `{ ok: true, slug }`                   |

Steps 1 and 2 stop cross-site posts: a form or `no-cors` fetch on another site
cannot send `application/json`, and browsers label such requests
`Sec-Fetch-Site: cross-site`. Clients that omit the header (curl, old browsers)
still have to send JSON.

A thread is open while it is pending, flagged as spam, or published without an
answer, for up to 7 days after submission. The visitor is identified by the signed
`hr_anon` cookie; when it is missing or forged, the salted IP hash is checked too,
but only when the address comes from a trusted proxy.

## Client addresses and the daily cap

Clearing cookies mints a new identity, so the IP hash is what bounds a
determined sender. It is only as good as the address behind it:

- **No proxy (the default, `ASK_TRUST_PROXY` unset).** Next receives requests
  directly and `X-Forwarded-For` is whatever the client sent, so it is ignored.
  Every visitor falls into one shared bucket, and its daily cap (30 messages in
  24 hours) is effectively a global one. The bucket never counts as an identity
  for open threads, or one visitor's thread would block everyone else.
- **Behind a reverse proxy.** Set `ASK_TRUST_PROXY` to the number of proxies
  that append to `X-Forwarded-For` (usually `1`, e.g. nginx with
  `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for`). The client
  address is read that many entries from the right, so values a client prepends
  are ignored. Each address then gets its own cap (5 messages in 24 hours),
  which applies even to visitors with a valid cookie.

Spam counts toward the caps and the breaker like any other submission, so a
flood of flagged messages closes the form instead of writing documents without
bound. Spam older than 24 hours stops counting toward the breaker, so an
uncleared Spam list does not keep the form closed.

## Where the limits live

Every number is in `lib/ask/config.ts`: field lengths, the 4 KB request cap,
the 3 s to 6 h window, the 7-day open thread and 24 h cooldown, the daily caps
per address and for the shared bucket, the replies-per-day value (kept for the
future reply route), heuristic weights and the spam threshold, the
circuit-breaker cap, spam window and cache time, cookie name and lifetime.

## Changing the circuit-breaker cap

Set `ASK_PENDING_CAP` (a positive integer, default 200) and restart the server.
The form closes once that many messages are pending (plus spam from the last
24 hours) and reopens as you clear the inbox (within 30 seconds, the cache
lifetime). Rejecting or publishing pending messages, or deleting recent spam, is
the usual way to reopen it.

## Environment variables

| Variable                        | Required | Purpose                                                                                                                                            |
| ------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes      | Sanity project. Empty means the route answers 503.                                                                                                 |
| `NEXT_PUBLIC_SANITY_DATASET`    | no       | Defaults to `production`.                                                                                                                          |
| `SANITY_API_WRITE_TOKEN`        | yes      | Editor token used to read counts and create questions.                                                                                             |
| `ASK_COOKIE_SECRET`             | yes      | Signs the `hr_anon` cookie and salts IP hashes. Use 32+ random bytes, e.g. `openssl rand -base64 32`. Changing it resets every visitor's identity. |
| `ASK_PENDING_CAP`               | no       | Circuit-breaker cap, default 200.                                                                                                                  |
| `ASK_TRUST_PROXY`               | no       | Number of reverse proxies that append to `X-Forwarded-For`. Unset or `0` ignores the header. See "Client addresses and the daily cap".             |

## Request body

```json
{
  "body": "10 to 1000 characters",
  "name": "optional",
  "email": "optional",
  "website": "",
  "elapsed": 12000
}
```

`website` is the honeypot and must stay empty. `elapsed` is the whole number of
milliseconds between the form mounting and the submit, measured in the browser
with `performance.now()`. It is a duration, not a timestamp, so a visitor whose
clock is off is never mistaken for a bot; the server only checks that it falls
inside the 3 s to 6 h window.

## Trying it locally

```sh
curl -i -X POST localhost:3000/api/ask -H 'content-type: application/json' \
  -d '{"body":"Hello there, testing the inbox","elapsed":10000}'
```
