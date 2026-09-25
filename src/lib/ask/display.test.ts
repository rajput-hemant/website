import { describe, expect, it } from 'vitest';
import { displayName, excerpt, isReservedName } from './display';

describe('displayName', () => {
  it('always names the owner Hemant', () => {
    expect(displayName({ name: 'someone', isOwner: true })).toBe('Hemant');
  });

  it('names a blank visitor Anonymous', () => {
    expect(displayName({ name: '  ', isOwner: false })).toBe('Anonymous');
    expect(displayName({ name: null, isOwner: false })).toBe('Anonymous');
  });
});

describe('isReservedName', () => {
  it('reserves the owner name regardless of case and spacing', () => {
    expect(isReservedName(' hemant ')).toBe(true);
    expect(isReservedName('Ada')).toBe(false);
    expect(isReservedName(null)).toBe(false);
  });
});

describe('excerpt', () => {
  it('keeps the first line only', () => {
    expect(excerpt('first line\nsecond')).toBe('first line');
  });

  it('caps the length', () => {
    expect(excerpt('x'.repeat(200))).toHaveLength(140);
  });

  it('strips markdown emphasis and link targets', () => {
    expect(excerpt('Is **this** a [link](https://a.example)?')).toBe(
      'Is this a link?',
    );
  });
});
