import { describe, expect, it } from 'vitest';
import { isMarkdownSlug, sitePages } from './site-pages';

describe('isMarkdownSlug', () => {
  it('is true for every configured site page slug', () => {
    for (const page of sitePages) {
      expect(isMarkdownSlug(page.slug)).toBe(true);
    }
  });

  it('is false for a slug that is not a site page', () => {
    expect(isMarkdownSlug('does-not-exist')).toBe(false);
  });
});
