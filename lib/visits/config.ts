/** Limits and names for the visitor counter. Server-only: nothing here reaches the client. */
export const visitsConfig = {
  /** Signed `<utc-day>.<hmac>` marker; expires at the next UTC midnight. */
  cookieName: "hr_seen",

  /** The singleton document holding the count. */
  documentId: "siteStats",

  /** The POST body is empty or `{}`; anything larger is refused. */
  maxRequestBytes: 256,

  /**
   * Per-address fixed window. Without a trusted proxy every visitor shares one
   * bucket, so it gets a larger allowance.
   */
  rateLimit: {
    windowMs: 60_000,
    perAddress: 10,
    sharedBucket: 120,
    /** Oldest windows are dropped past this many tracked addresses. */
    maxTrackedKeys: 5_000,
  },
} as const;
