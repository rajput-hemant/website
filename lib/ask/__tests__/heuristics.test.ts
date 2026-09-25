import { describe, expect, it } from "vitest";

import {
  capsRatio,
  countLinks,
  hasProfanity,
  isSpamScore,
  longestRepeatedRun,
  scoreSubmission,
} from "../heuristics";

describe("countLinks", () => {
  it("counts http, www and BBCode links", () => {
    expect(countLinks("see https://a.dev and http://b.dev or www.c.dev")).toBe(
      3
    );
    expect(countLinks("[url=https://x.dev]x[/url]")).toBe(2);
    expect(countLinks("I use Node.js and Next.js")).toBe(0);
  });
});

describe("longestRepeatedRun", () => {
  it("finds the longest run of one character, ignoring whitespace", () => {
    expect(longestRepeatedRun("heyyyyyy!")).toBe(6);
    expect(longestRepeatedRun("a          b")).toBe(1);
    expect(longestRepeatedRun("")).toBe(0);
  });
});

describe("capsRatio", () => {
  it("measures uppercase letters against all letters", () => {
    expect(capsRatio("ABcd 12")).toEqual({ ratio: 0.5, letters: 4 });
    expect(capsRatio("1234")).toEqual({ ratio: 0, letters: 0 });
  });
});

describe("hasProfanity", () => {
  it("matches obfuscated profanity but not innocent words", () => {
    expect(hasProfanity("you are a fuuuucking idiot")).toBe(true);
    expect(hasProfanity("what a pile of sh1t")).toBe(true);
    expect(hasProfanity("I worked in Scunthorpe on class analysis")).toBe(
      false
    );
  });
});

describe("scoreSubmission", () => {
  it("scores a normal message as zero", () => {
    expect(
      scoreSubmission(
        "Hi Hemant, how did you approach the migration? https://x.dev"
      )
    ).toEqual({ score: 0, reasons: [] });
  });

  it("marks three links as spam", () => {
    const result = scoreSubmission(
      "buy https://a.io https://b.io https://c.io now"
    );
    expect(result.reasons).toEqual(["links:3"]);
    expect(isSpamScore(result.score)).toBe(true);
  });

  it("keeps two links below the threshold", () => {
    expect(
      isSpamScore(scoreSubmission("https://a.io and https://b.io").score)
    ).toBe(false);
  });

  it("combines shouting and repeated characters into spam", () => {
    const result = scoreSubmission(
      "THIS IS AMAZING PLEASE REPLY NOW!!!!!!!!!!"
    );
    expect(result.reasons).toEqual(["repeated-characters", "all-caps"]);
    expect(isSpamScore(result.score)).toBe(true);
  });

  it("does not treat short uppercase text as shouting", () => {
    expect(scoreSubmission("OK THANKS").reasons).toEqual([]);
  });
});
