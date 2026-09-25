import type { NextRequest } from 'next/server';
import { withErrors } from '~/lib/ask/http';
import { submitMessage } from '~/lib/ask/submit';

export const POST = withErrors((request: NextRequest) =>
  submitMessage(request, 'question', null),
);
