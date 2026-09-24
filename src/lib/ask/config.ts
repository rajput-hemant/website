export const askConfig = {
  body: { min: 10, max: 1000 },
  name: { max: 60 },
  honeypotField: 'website',
  bodySizeLimitBytes: 4096,
  elapsedMs: { min: 3_000, max: 6 * 60 * 60 * 1000 },
  anonCookie: { name: 'hr_anon', maxAgeSeconds: 60 * 60 * 24 * 365 },
  openThreadWindowDays: 7,
  cooldownAfterCloseHours: 24,
  circuitBreaker: { cap: 200, cacheLifeSeconds: 30 },
  heuristics: { maxLinks: 1, spamThreshold: 3 },
} as const;
