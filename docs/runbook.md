# `/api/ask` runbook

## Attack Challenge Mode

Vercel dashboard → project → **Firewall** tab → **Attack Challenge Mode**. Toggle
on during a flood; it challenges every visitor and is free on Hobby. Turn it
off once traffic normalises.

## Circuit breaker cap

`src/lib/ask/config.ts` → `askConfig.circuitBreaker.cap` (default 200) and
`askConfig.circuitBreaker.cacheLifeSeconds` (default 30, read via `'use cache'`
in `src/lib/ask/sanity.ts#getOpenQuestionCount`). Raising or lowering the cap
means editing the constant and deploying; there is no env override, so a
change always ships through review.

## Signed-in posts and the kill switch

Signed-in posts go live instantly. There is no autopublish flag; the kill
switch for a signed-in author is **Ban author** in Studio's Ask inbox. Posts
are held only when the heuristics filter trips, which marks them Flagged for
review. Anonymous posts still wait for Approve.

## Moderation

Studio → **Ask inbox** → Pending / Recent / Flagged / Hidden / Banned.
Actions: **Approve**, **Hide**, **Unhide**, **Ban author**. To unban, delete
the author's document under Banned.

## BotID dev bypass

`checkBotId()` (from `botid/server`) checks `process.env.NODE_ENV`: outside
`production` it skips the Vercel bot-protection API entirely and returns
`{ isHuman: true, isBot: false, bypassed: true }`, logging
`[Dev Only] Without setting the developmentOptions.bypass value, the bot
protection will return HUMAN.` This is automatic in `bun run dev` and in any
non-production build; no code change is needed to test locally.

## Dry-run for local testing

`SANITY_WRITE_DRY_RUN=1` (via `src/env/ask.ts`) switches every Ask read and
write to an in-memory fixture store, so the pages and API routes can be
exercised locally without reading from or writing to the dataset. Every other
check (BotID, Zod, honeypot, timing, circuit breaker, per-identity limits,
duplicate guard, heuristics) still runs. The store resets when the server
restarts. Never set this in production.
