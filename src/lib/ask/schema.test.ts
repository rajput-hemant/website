import { describe, expect, it } from 'vitest';
import { askConfig, REACTION_KEYS } from './config';
import {
  editSchema,
  questionSchema,
  reactionSchema,
  replySchema,
} from './schema';

const validQuestion = 'a'.repeat(askConfig.body.question.min);

describe('questionSchema', () => {
  it('accepts a minimal valid submission', () => {
    const result = questionSchema.parse({ body: validQuestion, t: 1 });
    expect(result.body).toBe(validQuestion);
    expect(result[askConfig.honeypotField]).toBe('');
  });

  it('trims body and name and strips control characters', () => {
    const result = questionSchema.parse({
      body: `  ${validQuestion}\u0007  `,
      name: '  Ada\u0000  ',
      t: 1,
    });
    expect(result.body).toBe(validQuestion);
    expect(result.name).toBe('Ada');
  });

  it('keeps newlines and tabs', () => {
    const body = `${validQuestion}\n\tmore`;
    expect(questionSchema.parse({ body, t: 1 }).body).toBe(body);
  });

  it('rejects a body shorter than the minimum', () => {
    const body = 'a'.repeat(askConfig.body.question.min - 1);
    expect(questionSchema.safeParse({ body, t: 1 }).success).toBe(false);
  });

  it('rejects a body longer than the maximum', () => {
    const body = 'a'.repeat(askConfig.body.max + 1);
    expect(questionSchema.safeParse({ body, t: 1 }).success).toBe(false);
  });

  it('rejects a name longer than the maximum', () => {
    const result = questionSchema.safeParse({
      body: validQuestion,
      name: 'a'.repeat(askConfig.name.max + 1),
      t: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing, non-positive or non-integer t', () => {
    expect(questionSchema.safeParse({ body: validQuestion }).success).toBe(
      false,
    );
    expect(
      questionSchema.safeParse({ body: validQuestion, t: 0 }).success,
    ).toBe(false);
    expect(
      questionSchema.safeParse({ body: validQuestion, t: 1.5 }).success,
    ).toBe(false);
  });
});

describe('replySchema', () => {
  it('accepts a reply shorter than the question minimum', () => {
    const body = 'a'.repeat(askConfig.body.reply.min);
    expect(replySchema.safeParse({ body, t: 1 }).success).toBe(true);
  });

  it('rejects a blank reply', () => {
    expect(replySchema.safeParse({ body: '   ', t: 1 }).success).toBe(false);
  });
});

describe('editSchema', () => {
  it('rejects a body longer than the maximum', () => {
    const body = 'a'.repeat(askConfig.body.max + 1);
    expect(editSchema.safeParse({ body }).success).toBe(false);
  });
});

describe('reactionSchema', () => {
  it('accepts a known key and rejects anything else', () => {
    expect(
      reactionSchema.safeParse({ key: REACTION_KEYS[0], on: true }).success,
    ).toBe(true);
    expect(reactionSchema.safeParse({ key: 'bogus', on: true }).success).toBe(
      false,
    );
  });
});
