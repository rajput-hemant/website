import { z } from 'zod';
import { askConfig } from './config';

export const askSubmissionSchema = z.object({
  body: z.string().trim().min(askConfig.body.min).max(askConfig.body.max),
  name: z.string().trim().max(askConfig.name.max).optional(),
  email: z.email().trim().optional(),
  [askConfig.honeypotField]: z.string().max(200).optional().default(''),
  t: z.number().int().positive(),
});

export type AskSubmission = z.infer<typeof askSubmissionSchema>;
