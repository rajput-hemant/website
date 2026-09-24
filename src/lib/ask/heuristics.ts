import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from 'obscenity';
import { askConfig } from './config';

const obscenityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const URL_PATTERN = /https?:\/\/\S+/gi;
const REPEATED_CHAR_PATTERN = /(.)\1{6,}/;

export function countLinks(body: string): number {
  return body.match(URL_PATTERN)?.length ?? 0;
}

export function hasExcessiveRepeats(body: string): boolean {
  return REPEATED_CHAR_PATTERN.test(body);
}

export function allCapsRatio(body: string): number {
  const letters = body.match(/[a-zA-Z]/g) ?? [];
  if (letters.length === 0) return 0;
  const upper = letters.filter((char) => char === char.toUpperCase()).length;
  return upper / letters.length;
}

export function hasObsceneMatch(body: string): boolean {
  return obscenityMatcher.hasMatch(body);
}

export function computeHeuristicsScore(body: string): number {
  let score = 0;

  if (countLinks(body) > askConfig.heuristics.maxLinks) score += 3;
  if (hasExcessiveRepeats(body)) score += 1;
  if (allCapsRatio(body) > 0.7 && body.length > 20) score += 1;
  if (hasObsceneMatch(body)) score += 2;

  return score;
}

export function isSpam(score: number): boolean {
  return score >= askConfig.heuristics.spamThreshold;
}
