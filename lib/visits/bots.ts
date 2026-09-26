/**
 * Crawlers, link unfurlers, uptime monitors and scripted clients. Matched
 * loosely on purpose: a missed human costs one uncounted visit, a missed bot
 * inflates the count on every crawl.
 */
const crawlerPattern = new RegExp(
  [
    // "Cubot" is a phone brand, not a crawler.
    "(?<!cu)bot\\b",
    "crawl",
    "spider",
    "slurp",
    "scrape",
    "headless",
    "lighthouse",
    "pagespeed",
    "pingdom",
    "uptime",
    "monitor",
    "preview",
    "facebookexternalhit",
    "embedly",
    "whatsapp",
    "telegram",
    "discord",
    "slack",
    "curl/",
    "wget/",
    "httpie",
    "python",
    "go-http-client",
    "java/",
    "okhttp",
    "axios",
    "node-fetch",
    "undici",
    "phantomjs",
    "puppeteer",
    "playwright",
    "selenium",
  ].join("|"),
  "i"
);

export function isCrawlerUserAgent(userAgent: string): boolean {
  return userAgent.trim() === "" || crawlerPattern.test(userAgent);
}

/**
 * Every current browser sends `Sec-Fetch-*` on `fetch()`; scripted clients
 * rarely bother, so their absence marks the request as automated.
 */
export function isLikelyBot(headers: Headers): boolean {
  const hasFetchMetadata =
    headers.has("sec-fetch-site") || headers.has("sec-fetch-mode");
  return (
    !hasFetchMetadata || isCrawlerUserAgent(headers.get("user-agent") ?? "")
  );
}
