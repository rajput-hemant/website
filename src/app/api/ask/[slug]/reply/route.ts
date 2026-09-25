import type { NextRequest } from 'next/server';
import { HttpError, withErrors } from '~/lib/ask/http';
import { submitMessage } from '~/lib/ask/submit';

export const POST = withErrors(
  async (
    request: NextRequest,
    context: { params: Promise<{ slug: string }> },
  ) => {
    const { slug } = await context.params;
    if (!/^[0-9a-f]{8}$/.test(slug)) throw new HttpError(404, 'Not found');
    return submitMessage(request, 'reply', slug);
  },
);
