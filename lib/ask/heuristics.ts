import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";

import { askConfig } from "./config";

export type HeuristicsResult = { score: number; reasons: string[] };

type HeuristicsConfig = typeof askConfig.heuristics;

const LINK_PATTERN = /\bhttps?:\/\/\S+|\bwww\.\S+|\[url[=\]]/gi;
const LETTER_PATTERN = /\p{L}/gu;
const UPPERCASE_PATTERN = /\p{Lu}/gu;

const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export function countLinks(text: string): number {
  return text.match(LINK_PATTERN)?.length ?? 0;
}

/** Length of the longest run of one non-whitespace character. */
export function longestRepeatedRun(text: string): number {
  let longest = 0;
  let current = 0;
  let previous = "";
  for (const char of text) {
    current = char === previous && !/\s/.test(char) ? current + 1 : 1;
    previous = char;
    if (current > longest) longest = current;
  }
  return longest;
}

/** Share of letters that are uppercase, with the number of letters seen. */
export function capsRatio(text: string): { ratio: number; letters: number } {
  const letters = text.match(LETTER_PATTERN)?.length ?? 0;
  if (letters === 0) return { ratio: 0, letters };
  const upper = text.match(UPPERCASE_PATTERN)?.length ?? 0;
  return { ratio: upper / letters, letters };
}

export function hasProfanity(text: string): boolean {
  return profanityMatcher.hasMatch(text);
}

/**
 * Scores how likely a submission is junk. Pure and cheap: it runs after every
 * check that touches Sanity has passed, and only decides between `pending`
 * and `spam`. Nothing is ever published because of a low score.
 */
export function scoreSubmission(
  text: string,
  config: HeuristicsConfig = askConfig.heuristics
): HeuristicsResult {
  const reasons: string[] = [];
  let score = 0;

  const links = countLinks(text);
  if (links > config.freeLinks) {
    score += (links - config.freeLinks) * config.linkWeight;
    reasons.push(`links:${links}`);
  }

  if (longestRepeatedRun(text) >= config.repeatedRunLength) {
    score += config.repeatedWeight;
    reasons.push("repeated-characters");
  }

  const caps = capsRatio(text);
  if (caps.letters >= config.capsMinLetters && caps.ratio >= config.capsRatio) {
    score += config.capsWeight;
    reasons.push("all-caps");
  }

  if (hasProfanity(text)) {
    score += config.profanityWeight;
    reasons.push("profanity");
  }

  return { score, reasons };
}

export function isSpamScore(
  score: number,
  threshold: number = askConfig.heuristics.spamThreshold
): boolean {
  return score >= threshold;
}
