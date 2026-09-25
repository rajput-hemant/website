import { NextResponse, type NextRequest } from 'next/server';
import { askEnv } from '~/env/ask';
import { askConfig } from '~/lib/ask/config';
import { avatarSeed, verifyAnonCookieValue } from '~/lib/ask/crypto';
import { getSignedInUser, withErrors } from '~/lib/ask/http';
import { isReactionKey } from '~/lib/ask/limits';
import { ASK_VIEWER_QUERY } from '~/lib/ask/queries';
import { storeRead } from '~/lib/ask/store';
import type { HeldMessage, Viewer, ViewerState } from '~/lib/ask/types';

const HELD_STATUSES = new Set(['pending', 'spam']);

export const GET = withErrors(async (request: NextRequest) => {
  const user = await getSignedInUser();
  const secret = askEnv.ASK_SUBMISSION_SECRET;
  const cookie = request.cookies.get(askConfig.anonCookie.name)?.value;
  const anonId =
    !user && cookie && secret ? verifyAnonCookieValue(cookie, secret) : null;
  const providerId = user?.providerId ?? (anonId ? `anon:${anonId}` : null);

  const viewer: Viewer = user
    ? {
        kind: 'signed-in',
        provider: user.kind,
        name: user.name,
        image: user.image,
        isOwner: user.isOwner,
      }
    : {
        kind: 'anonymous',
        avatarSeed:
          anonId && secret ? avatarSeed(`anon:${anonId}`, secret) : null,
      };
  const state: ViewerState = { viewer, mine: [], held: [], reacted: [] };

  const slug = request.nextUrl.searchParams.get('thread');
  if (providerId) {
    const { thread, heldQuestions } = await storeRead(ASK_VIEWER_QUERY, {
      slug: slug && /^[0-9a-f]{8}$/.test(slug) ? slug : '',
      providerId,
    });

    const toHeld = (
      message: {
        _id: string;
        body: string | null;
        submittedAt: string | null;
        name: string | null;
        avatarSeed: string | null;
      },
      threadSlug: string | null,
    ): HeldMessage[] =>
      message.body && message.submittedAt
        ? [
            {
              id: message._id,
              body: message.body,
              name: message.name,
              avatarSeed: message.avatarSeed,
              createdAt: message.submittedAt,
              threadSlug,
            },
          ]
        : [];

    state.held = heldQuestions.flatMap((message) => toHeld(message, null));

    for (const message of thread?.messages ?? []) {
      const reacted = (message.reacted ?? []).filter(
        (key): key is NonNullable<typeof key> =>
          key !== null && isReactionKey(key),
      );
      if (reacted.length > 0)
        state.reacted.push({ id: message._id, keys: reacted });
      if (message.providerId !== providerId || !message.submittedAt) continue;

      if (HELD_STATUSES.has(message.status ?? '')) {
        state.held.push(...toHeld(message, thread?.slug ?? null));
      } else if (
        user &&
        message.status === 'published' &&
        message.body &&
        !message.deletedAt
      ) {
        state.mine.push({
          id: message._id,
          body: message.body,
          createdAt: message.submittedAt,
        });
      }
    }
  }

  return NextResponse.json(state, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
});
