import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { askConfig } from '~/lib/ask/config';
import { computeHeuristicsScore, isSpam } from '~/lib/ask/heuristics';
import {
  assertSameOrigin,
  HttpError,
  readJson,
  requireSignedInUser,
  withErrors,
} from '~/lib/ask/http';
import { canDelete, canEdit } from '~/lib/ask/limits';
import { ASK_MESSAGE_QUERY } from '~/lib/ask/queries';
import { editSchema } from '~/lib/ask/schema';
import { storeRead, storeWrite } from '~/lib/ask/store';

type Context = { params: Promise<{ id: string }> };

async function loadOwnMessage(context: Context) {
  const user = await requireSignedInUser();
  const { id } = await context.params;
  const message = await storeRead(ASK_MESSAGE_QUERY, {
    id,
    providerId: user.providerId,
  });
  if (
    !message?.submittedAt ||
    !message.visible ||
    message.providerId !== user.providerId
  ) {
    throw new HttpError(404, 'Message not found.');
  }
  if (message.banned) throw new HttpError(403, 'You can no longer post here.');
  return {
    user,
    message: {
      id: message._id,
      providerId: message.providerId,
      submittedAt: message.submittedAt,
      deletedAt: message.deletedAt,
    },
  };
}

export const PATCH = withErrors(
  async (request: NextRequest, context: Context) => {
    const { body } = await readJson(request, editSchema);
    const { user, message } = await loadOwnMessage(context);
    if (!canEdit(message, user.providerId, Date.now())) {
      throw new HttpError(403, 'Messages can only be edited for 15 minutes.');
    }

    await storeWrite({
      op: 'patch',
      id: message.id,
      set: {
        body,
        editedAt: new Date().toISOString(),
        ...(isSpam(computeHeuristicsScore(body)) ? { status: 'spam' } : {}),
      },
    });
    revalidateTag(askConfig.cacheTag, { expire: 0 });
    return NextResponse.json({ ok: true });
  },
);

export const DELETE = withErrors(
  async (request: NextRequest, context: Context) => {
    assertSameOrigin(request);
    const { user, message } = await loadOwnMessage(context);
    if (!canDelete(message, user.providerId)) {
      throw new HttpError(403, 'This message was already deleted.');
    }

    await storeWrite({
      op: 'patch',
      id: message.id,
      set: { deletedAt: new Date().toISOString(), reactions: [] },
      unset: ['body'],
    });
    revalidateTag(askConfig.cacheTag, { expire: 0 });
    return NextResponse.json({ ok: true });
  },
);
