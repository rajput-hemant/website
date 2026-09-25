import { z } from 'zod';
import { askConfig, REACTION_KEYS } from './config';

// Strips control characters (keeping tab and newline) so stored text renders predictably.
const clean = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').trim();

const body = (min: number) =>
  z
    .string()
    .max(askConfig.body.max * 2)
    .transform(clean)
    .pipe(z.string().min(min).max(askConfig.body.max));

const submission = (min: number) =>
  z.object({
    body: body(min),
    name: z
      .string()
      .max(askConfig.name.max * 2)
      .transform(clean)
      .pipe(z.string().max(askConfig.name.max))
      .optional(),
    [askConfig.honeypotField]: z.string().max(200).default(''),
    t: z.number().int().positive(),
  });

export const questionSchema = submission(askConfig.body.question.min);
export const replySchema = submission(askConfig.body.reply.min);
export const editSchema = z.object({ body: body(askConfig.body.reply.min) });
export const reactionSchema = z.object({
  key: z.enum(REACTION_KEYS),
  on: z.boolean(),
});

export type Submission = z.infer<typeof questionSchema>;
