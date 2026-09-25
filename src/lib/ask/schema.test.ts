import { describe, expect, it } from 'vitest';
import { askConfig } from './config';
import { askSubmissionSchema } from './schema';

const validBody = 'a'.repeat(askConfig.body.min);

describe('askSubmissionSchema', () => {
  it('accepts a minimal valid submission', () => {
    const result = askSubmissionSchema.parse({ body: validBody, t: 1 });
    expect(result.body).toBe(validBody);
    expect(result[askConfig.honeypotField]).toBe('');
  });

  it('trims body and name', () => {
    const result = askSubmissionSchema.parse({
      body: `  ${validBody}  `,
      name: '  Ada  ',
      t: 1,
    });
    expect(result.body).toBe(validBody);
    expect(result.name).toBe('Ada');
  });

  it('rejects a body shorter than the minimum', () => {
    const result = askSubmissionSchema.safeParse({
      body: 'a'.repeat(askConfig.body.min - 1),
      t: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a body longer than the maximum', () => {
    const result = askSubmissionSchema.safeParse({
      body: 'a'.repeat(askConfig.body.max + 1),
      t: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a name longer than the maximum', () => {
    const result = askSubmissionSchema.safeParse({
      body: validBody,
      name: 'a'.repeat(askConfig.name.max + 1),
      t: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a malformed email', () => {
    const result = askSubmissionSchema.safeParse({
      body: validBody,
      email: 'not-an-email',
      t: 1,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a non-positive or non-integer t', () => {
    expect(
      askSubmissionSchema.safeParse({ body: validBody, t: 0 }).success,
    ).toBe(false);
    expect(
      askSubmissionSchema.safeParse({ body: validBody, t: 1.5 }).success,
    ).toBe(false);
  });

  it('rejects a submission missing t entirely', () => {
    const result = askSubmissionSchema.safeParse({ body: validBody });
    expect(result.success).toBe(false);
  });
});
