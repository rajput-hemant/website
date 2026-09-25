import { describe, expect, it } from 'vitest';
import {
  formatExperienceRange,
  formatIsoDate,
  formatMonthYear,
  joinMarkdown,
} from './format';

describe('formatMonthYear', () => {
  it('formats a full ISO date to a short month and year', () => {
    expect(formatMonthYear('2026-01-01')).toBe('Jan 2026');
    expect(formatMonthYear('2026-12-15')).toBe('Dec 2026');
  });

  it('returns the original string when the month is out of range', () => {
    expect(formatMonthYear('2026-13-01')).toBe('2026-13-01');
  });
});

describe('formatExperienceRange', () => {
  it('joins a start and end date with an en dash', () => {
    expect(formatExperienceRange('2026-01-01', '2026-12-01', null)).toBe(
      'Jan 2026 – Dec 2026',
    );
  });

  it('uses "Present" when there is no end date or note', () => {
    expect(formatExperienceRange('2026-01-01', null, null)).toBe(
      'Jan 2026 – Present',
    );
  });

  it('prefers the end note over "Present" when there is no end date', () => {
    expect(formatExperienceRange('2026-01-01', null, 'company sunset')).toBe(
      'Jan 2026 – company sunset',
    );
  });

  it('returns only the end side when there is no start date', () => {
    expect(formatExperienceRange(null, '2026-12-01', null)).toBe('Dec 2026');
    expect(formatExperienceRange(null, null, null)).toBe('Present');
  });
});

describe('formatIsoDate', () => {
  it('formats a valid ISO date as a long date', () => {
    expect(formatIsoDate('2026-01-01')).toBe('January 1, 2026');
  });

  it('returns the original string for an invalid date', () => {
    expect(formatIsoDate('not-a-date')).toBe('not-a-date');
  });
});

describe('joinMarkdown', () => {
  it('joins non-empty parts with a blank line', () => {
    expect(joinMarkdown(['# Title', 'body'])).toBe('# Title\n\nbody');
  });

  it('drops empty parts', () => {
    expect(joinMarkdown(['# Title', '', 'body'])).toBe('# Title\n\nbody');
  });

  it('returns an empty string when every part is empty', () => {
    expect(joinMarkdown(['', ''])).toBe('');
  });
});
