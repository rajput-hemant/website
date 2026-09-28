import { describe, expect, it } from "vitest";

import { isCrawlerUserAgent, isLikelyBot } from "../bots";

const chrome =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const safariIos =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1";
const firefox =
  "Mozilla/5.0 (X11; Linux x86_64; rv:142.0) Gecko/20100101 Firefox/142.0";
const cubot =
  "Mozilla/5.0 (Linux; Android 13; CUBOT KINGKONG 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36";

const browserFetch = (userAgent: string) =>
  new Headers({
    "user-agent": userAgent,
    "sec-fetch-site": "same-origin",
    "sec-fetch-mode": "cors",
  });

describe("isCrawlerUserAgent", () => {
  it.each([
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
    "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2)",
    "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse",
    "curl/8.9.1",
    "Wget/1.24.5",
    "python-requests/2.32.3",
    "Go-http-client/2.0",
    "node-fetch/1.0 (+https://github.com/bitinn/node-fetch)",
    "UptimeRobot/2.0",
    "",
    "   ",
  ])("flags %j", (userAgent) => {
    expect(isCrawlerUserAgent(userAgent)).toBe(true);
  });

  it.each([chrome, safariIos, firefox, cubot])("lets %j through", (ua) => {
    expect(isCrawlerUserAgent(ua)).toBe(false);
  });
});

describe("isLikelyBot", () => {
  it("accepts a browser fetch with fetch metadata", () => {
    expect(isLikelyBot(browserFetch(chrome))).toBe(false);
  });

  it("flags a request without any Sec-Fetch header, whatever it claims", () => {
    expect(isLikelyBot(new Headers({ "user-agent": chrome }))).toBe(true);
  });

  it("flags a crawler even when it sends fetch metadata", () => {
    expect(
      isLikelyBot(browserFetch("Mozilla/5.0 (compatible; Googlebot/2.1)"))
    ).toBe(true);
  });

  it("flags a missing user agent", () => {
    const headers = browserFetch(chrome);
    headers.delete("user-agent");
    expect(isLikelyBot(headers)).toBe(true);
  });
});
