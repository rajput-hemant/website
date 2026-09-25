import { describe, expect, it } from 'vitest';
import { askConfig } from './config';
import {
  allCapsRatio,
  computeHeuristicsScore,
  countLinks,
  hasExcessiveRepeats,
  hasObsceneMatch,
  isSpam,
} from './heuristics';

describe('countLinks', () => {
  it('counts http and https links', () => {
    expect(countLinks('see http://a.example and https://b.example')).toBe(2);
  });

  it('returns 0 when there are no links', () => {
    expect(countLinks('no links here')).toBe(0);
  });
});

describe('hasExcessiveRepeats', () => {
  it('is false for a run of 6 identical characters', () => {
    expect(hasExcessiveRepeats('aaaaaa good')).toBe(false);
  });

  it('is true for a run of 7 or more identical characters', () => {
    expect(hasExcessiveRepeats('aaaaaaa good')).toBe(true);
  });
});

describe('allCapsRatio', () => {
  it('is 0 when the body has no letters', () => {
    expect(allCapsRatio('12345 !!!')).toBe(0);
  });

  it('is close to 1 for an all-caps body', () => {
    expect(allCapsRatio('HELLO THERE')).toBeGreaterThan(0.9);
  });

  it('is close to 0 for a lowercase body', () => {
    expect(allCapsRatio('hello there')).toBeLessThan(0.1);
  });
});

describe('hasObsceneMatch', () => {
  it('is false for a normal question', () => {
    expect(hasObsceneMatch('a perfectly normal question')).toBe(false);
  });

  it('is true for a body containing profanity', () => {
    expect(hasObsceneMatch('this is complete shit')).toBe(true);
  });
});

describe('computeHeuristicsScore and isSpam', () => {
  it('scores a clean body as 0 and not spam', () => {
    const score = computeHeuristicsScore('a perfectly normal question');
    expect(score).toBe(0);
    expect(isSpam(score)).toBe(false);
  });

  it('adds 3 for exceeding the max link count', () => {
    const score = computeHeuristicsScore(
      'see http://a.example and http://b.example',
    );
    expect(score).toBe(3);
  });

  it('does not penalise exactly the max link count', () => {
    expect(computeHeuristicsScore('see http://a.example only')).toBe(0);
  });

  it('adds 1 for an all-caps body long enough to trigger the check', () => {
    expect(computeHeuristicsScore('THIS IS ALL CAPS AND LONG ENOUGH')).toBe(1);
  });

  it('does not penalise a short all-caps body', () => {
    expect(computeHeuristicsScore('HELLO WORLD')).toBe(0);
  });

  it('crosses the spam threshold when repeats and profanity stack up', () => {
    const spamBody = 'this is shit and it goes onnnnnnnn forever';
    expect(computeHeuristicsScore(spamBody)).toBe(3);
    expect(isSpam(computeHeuristicsScore(spamBody))).toBe(true);
  });

  it('is not spam one point below the threshold', () => {
    expect(isSpam(askConfig.heuristics.spamThreshold - 1)).toBe(false);
  });

  it('is spam exactly at the threshold', () => {
    expect(isSpam(askConfig.heuristics.spamThreshold)).toBe(true);
  });
});
