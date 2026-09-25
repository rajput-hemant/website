import { describe, expect, it } from 'vitest';
import { blocksToMarkdown, type RestrictedPortableTextBlocks } from './portable-text';

function paragraph(
  text: string,
  key: string,
): NonNullable<RestrictedPortableTextBlocks>[number] {
  return {
    _type: 'block',
    _key: key,
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `${key}-span`, text, marks: [] }],
  };
}

describe('blocksToMarkdown', () => {
  it('returns an empty string for null or undefined blocks', () => {
    expect(blocksToMarkdown(null)).toBe('');
    expect(blocksToMarkdown(undefined)).toBe('');
  });

  it('returns an empty string for an empty array', () => {
    expect(blocksToMarkdown([])).toBe('');
  });

  it('renders a plain paragraph as-is', () => {
    expect(blocksToMarkdown([paragraph('Hello world.', 'a')])).toBe(
      'Hello world.',
    );
  });

  it('joins multiple paragraphs with a blank line', () => {
    const blocks = [paragraph('First.', 'a'), paragraph('Second.', 'b')];
    expect(blocksToMarkdown(blocks)).toBe('First.\n\nSecond.');
  });

  it('renders strong marks and links', () => {
    const blocks: RestrictedPortableTextBlocks = [
      {
        _type: 'block',
        _key: 'b',
        style: 'normal',
        markDefs: [{ _type: 'link', _key: 'link1', href: 'https://example.com' }],
        children: [
          { _type: 'span', _key: 'b-s1', text: 'This is ', marks: [] },
          { _type: 'span', _key: 'b-s2', text: 'bold', marks: ['strong'] },
          { _type: 'span', _key: 'b-s3', text: ' and a ', marks: [] },
          { _type: 'span', _key: 'b-s4', text: 'link', marks: ['link1'] },
          { _type: 'span', _key: 'b-s5', text: '.', marks: [] },
        ],
      },
    ];
    expect(blocksToMarkdown(blocks)).toBe(
      'This is **bold** and a [link](https://example.com).',
    );
  });
});
