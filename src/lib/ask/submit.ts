import 'server-only';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { checkBotId } from 'botid/server';
import { exceedsCircuitBreakerCap } from './circuit-breaker';
import { askConfig } from './config';
import { avatarSeed, generateId, generateSlug, hashIp } from './crypto';
import { isReservedName } from './display';
import { computeHeuristicsScore, isSpam } from './heuristics';
import { isElapsedWithinWindow, isHoneypotTriggered } from './honeypot';
import {
  getSignedInUser,
  HttpError,
  jsonError,
  readJson,
  requireSubmissionSecret,
} from './http';
import { resolveAnonIdentity } from './identity';
import {
  checkPostLimits,
  initialStatus,
  privateDocId,
  type Actor,
  type PostKind,
} from './limits';
import { ASK_ACTIVITY_QUERY, ASK_REPLY_TARGET_QUERY } from './queries';
import { getClientIp } from './request';
import { questionSchema, replySchema } from './schema';
import { getPendingCount, storeRead, storeWrite } from './store';
import type { HeldMessage, PostResult } from './types';

const HOUR_MS = 60 * 60 * 1000;

function respond(result: PostResult, cookie: string | null) {
  const response = NextResponse.json<PostResult>(result);
  if (cookie) {
    response.cookies.set(askConfig.anonCookie.name, cookie, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: askConfig.anonCookie.maxAgeSeconds,
      path: '/',
    });
  }
  return response;
}

function held(
  id: string,
  body: string,
  name: string | null,
  seed: string | null,
  createdAt: string,
  threadSlug: string | null,
): PostResult {
  const message: HeldMessage = {
    id,
    body,
    name,
    avatarSeed: seed,
    createdAt,
    threadSlug,
  };
  return { status: 'held', message };
}

export async function submitMessage(
  request: NextRequest,
  kind: PostKind,
  threadSlug: string | null,
): Promise<NextResponse> {
  const verification = await checkBotId();
  if (verification.isBot) return jsonError(403, 'Access denied');

  const submission = await readJson(
    request,
    kind === 'question' ? questionSchema : replySchema,
  );
  const now = Date.now();

  // Bots that trip the honeypot or timing window get a convincing success and
  // nothing is written, so they have no signal to recalibrate against.
  if (
    isHoneypotTriggered(submission[askConfig.honeypotField]) ||
    !isElapsedWithinWindow(
      submission.t,
      now,
      askConfig.elapsedMs.min,
      askConfig.elapsedMs.max,
    )
  ) {
    return respond(
      held(
        generateId(),
        submission.body,
        submission.name ?? null,
        null,
        new Date(now).toISOString(),
        threadSlug,
      ),
      null,
    );
  }

  const secret = requireSubmissionSecret();
  const ipHash = hashIp(getClientIp(request.headers), secret);
  const user = await getSignedInUser();
  let actor: Actor;
  let cookie: string | null = null;
  if (user) {
    actor = {
      kind: 'signed-in',
      providerId: user.providerId,
      isOwner: user.isOwner,
    };
  } else {
    const anon = resolveAnonIdentity(
      request.cookies.get(askConfig.anonCookie.name)?.value,
      secret,
    );
    actor = { kind: 'anonymous', providerId: anon.providerId, ipHash };
    cookie = anon.newCookieValue;
  }

  if (
    actor.kind === 'anonymous' &&
    exceedsCircuitBreakerCap(await getPendingCount())
  ) {
    throw new HttpError(503, 'Not accepting new messages right now.');
  }

  let threadId = '';
  if (threadSlug) {
    const target = await storeRead(ASK_REPLY_TARGET_QUERY, {
      slug: threadSlug,
    });
    if (!target)
      throw new HttpError(404, 'This conversation no longer exists.');
    threadId = target._id;
  }

  const activity = await storeRead(ASK_ACTIVITY_QUERY, {
    providerId: actor.providerId,
    ipHash: actor.kind === 'anonymous' ? ipHash : '',
    threadId,
    body: submission.body,
    dayAgo: new Date(now - 24 * HOUR_MS).toISOString(),
    hourAgo: new Date(now - HOUR_MS).toISOString(),
  });

  const duplicate = activity.duplicate;
  if (duplicate?.submittedAt && duplicate.body) {
    if (duplicate.status === 'published') {
      return respond(
        {
          status: 'published',
          id: duplicate._id,
          slug: threadSlug ?? duplicate.slug ?? '',
        },
        cookie,
      );
    }
    return respond(
      held(
        duplicate._id,
        duplicate.body,
        duplicate.name,
        duplicate.avatarSeed,
        duplicate.submittedAt,
        threadSlug,
      ),
      cookie,
    );
  }

  // ponytail: read-then-write, so parallel requests can overshoot a limit by a few; the WAF rate limit bounds it. Add a per-person counter doc with ifRevisionID if that matters.
  const refusal = checkPostLimits(actor, kind, activity);
  if (refusal) throw new HttpError(refusal.status, refusal.error);

  const name = user ? user.name : (submission.name ?? null);
  if (!user?.isOwner && isReservedName(name)) {
    throw new HttpError(400, 'Please choose a different name.');
  }
  const heuristicsScore = computeHeuristicsScore(
    [submission.body, name].filter(Boolean).join('\n'),
  );
  const status = initialStatus(actor, isSpam(heuristicsScore));
  const id = generateId();
  const slug = kind === 'question' ? generateSlug() : null;
  const submittedAt = new Date(now).toISOString();
  const seed = user ? null : avatarSeed(actor.providerId, secret);

  await storeWrite({
    op: 'create',
    doc: {
      _id: id,
      _type: 'question',
      body: submission.body,
      ...(slug ? { slug: { _type: 'slug', current: slug } } : {}),
      ...(threadId
        ? { thread: { _type: 'reference', _ref: threadId, _weak: true } }
        : {}),
      author: {
        _type: 'object',
        kind: user ? user.kind : 'anonymous',
        name,
        providerId: actor.providerId,
        ...(user?.image ? { avatarUrl: user.image } : {}),
        ...(seed ? { avatarSeed: seed } : {}),
      },
      status,
      submittedAt,
      ...(status === 'published' ? { publishedAt: submittedAt } : {}),
      moderation: {
        _type: 'object',
        heuristicsScore,
        botid: verification.isVerifiedBot ? 'verified-bot' : 'human',
        ipHash,
        elapsedMs: now - submission.t,
      },
    },
  });

  if (user?.email) {
    await storeWrite({
      op: 'upsert',
      doc: {
        _id: privateDocId('askAuthor', user.providerId),
        _type: 'askAuthor',
        providerId: user.providerId,
        kind: user.kind,
        name: user.name,
        email: user.email,
        lastSeenAt: submittedAt,
      },
    });
  }

  if (status !== 'published') {
    return respond(
      held(id, submission.body, name, seed, submittedAt, threadSlug),
      cookie,
    );
  }

  revalidateTag(askConfig.cacheTag, { expire: 0 });
  return respond(
    { status: 'published', id, slug: threadSlug ?? slug ?? '' },
    cookie,
  );
}
