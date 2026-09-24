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

## Signed-in autopublish kill switch

`ASK_SIGNED_IN_AUTOPUBLISH` does not exist yet — it lands with the signed-in
tier (T3.6/T3.7). Until then every submission (anonymous only) always waits
for a manual Publish in Studio; there is nothing to switch off.

## BotID dev bypass

`checkBotId()` (from `botid/server`) checks `process.env.NODE_ENV`: outside
`production` it skips the Vercel bot-protection API entirely and returns
`{ isHuman: true, isBot: false, bypassed: true }`, logging
`[Dev Only] Without setting the developmentOptions.bypass value, the bot
protection will return HUMAN.` This is automatic in `bun run dev` and in any
non-production build; no code change is needed to test locally.

## Dry-run writes for local testing

`SANITY_WRITE_DRY_RUN=1` (via `src/env/ask.ts`) makes
`src/lib/ask/sanity.ts#createQuestion` skip the Sanity write and return a
synthetic id, so the full route can be curled locally without creating
documents in the live dataset. Every other check (BotID, Zod, honeypot,
timing, circuit breaker, per-identity limits, duplicate guard, heuristics)
still runs against the real project. Never set this in production.
