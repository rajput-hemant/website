export const askConfig = {
  body: { question: { min: 10 }, reply: { min: 1 }, max: 2000 },
  name: { max: 60 },
  honeypotField: 'website',
  bodySizeLimitBytes: 8192,
  elapsedMs: { min: 3_000, max: 6 * 60 * 60 * 1000 },
  anonCookie: { name: 'hr_anon', maxAgeSeconds: 60 * 60 * 24 * 365 },
  circuitBreaker: { cap: 200, cacheLifeSeconds: 30 },
  heuristics: { maxLinks: 1, spamThreshold: 3 },
  editWindowMs: 15 * 60 * 1000,
  limits: {
    signedIn: { questionsPerDay: 3, repliesPerHour: 30 },
    anonymous: { heldAtOnce: 1, postsPerDay: 5, postsPerDayPerIp: 10 },
  },
  threadsPerPage: 20,
  cacheTag: 'ask',
} as const;

export const REACTION_KEYS = [
  'thumbsup',
  'heart',
  'laugh',
  'party',
  'surprised',
  'pray',
] as const;

export type ReactionKey = (typeof REACTION_KEYS)[number];

export const REACTIONS: Record<ReactionKey, { emoji: string; label: string }> =
  {
    thumbsup: { emoji: '👍', label: 'Thumbs up' },
    heart: { emoji: '❤️', label: 'Heart' },
    laugh: { emoji: '😄', label: 'Laugh' },
    party: { emoji: '🎉', label: 'Party' },
    surprised: { emoji: '😮', label: 'Surprised' },
    pray: { emoji: '🙏', label: 'Pray' },
  };
