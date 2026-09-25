import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { askConfig } from '~/lib/ask/config';
import {
  HttpError,
  readJson,
  requireSignedInUser,
  withErrors,
} from '~/lib/ask/http';
import { reactionItemKey } from '~/lib/ask/limits';
import { ASK_MESSAGE_QUERY } from '~/lib/ask/queries';
import { reactionSchema } from '~/lib/ask/schema';
import { storeRead, storeWrite } from '~/lib/ask/store';

export const PUT = withErrors(
  async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> },
  ) => {
    const { key, on } = await readJson(request, reactionSchema);
    const user = await requireSignedInUser();
    const { id } = await context.params;
    const message = await storeRead(ASK_MESSAGE_QUERY, {
      id,
      providerId: user.providerId,
    });
    if (!message?.visible || message.deletedAt) {
      throw new HttpError(404, 'Message not found.');
    }
    if (message.banned) {
      throw new HttpError(403, 'You can no longer post here.');
    }

    await storeWrite({
      op: 'reaction',
      id: message._id,
      on,
      item: {
        _key: reactionItemKey(key, user.providerId),
        emoji: key,
        providerId: user.providerId,
      },
    });
    revalidateTag(askConfig.cacheTag, { expire: 0 });
    return NextResponse.json({ ok: true });
  },
);
