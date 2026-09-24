import { checkBotId } from 'botid/server';
import { NextResponse, type NextRequest } from 'next/server';
import { askEnv } from '~/env/ask';
import { askConfig } from '~/lib/ask/config';
import { generateSlug, hashIp } from '~/lib/ask/crypto';
import { computeHeuristicsScore, isSpam } from '~/lib/ask/heuristics';
import { isElapsedWithinWindow, isHoneypotTriggered } from '~/lib/ask/honeypot';
import { resolveIdentity } from '~/lib/ask/identity';
import { getClientIp } from '~/lib/ask/request';
import { askSubmissionSchema } from '~/lib/ask/schema';
import {
  createQuestion,
  findDuplicatePendingSlug,
  findOpenThread,
  isCircuitBreakerOpen,
  isInCooldown,
} from '~/lib/ask/sanity';

function jsonWithCookie(
  body: Record<string, unknown>,
  status: number,
  newCookieValue: string | null,
) {
  const response = NextResponse.json(body, { status });

  if (newCookieValue) {
    response.cookies.set(askConfig.anonCookie.name, newCookieValue, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: askConfig.anonCookie.maxAgeSeconds,
      path: '/',
    });
  }

  return response;
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const ua = request.headers.get('user-agent') ?? 'unknown';

  const verification = await checkBotId();
  if (verification.isBot) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > askConfig.bodySizeLimitBytes) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = askSubmissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const submission = parsed.data;

  // A bot that fills the honeypot or submits faster/slower than a human
  // gets a convincing success response so it has no signal to recalibrate.
  if (isHoneypotTriggered(submission[askConfig.honeypotField])) {
    return NextResponse.json({ slug: generateSlug() }, { status: 200 });
  }

  if (
    !isElapsedWithinWindow(
      submission.t,
      Date.now(),
      askConfig.elapsedMs.min,
      askConfig.elapsedMs.max,
    )
  ) {
    return NextResponse.json({ slug: generateSlug() }, { status: 200 });
  }

  const existingCookie = request.cookies.get(askConfig.anonCookie.name)?.value;
  const identity = resolveIdentity(existingCookie, ip, askEnv.ASK_SUBMISSION_SECRET);
  const ipHash = hashIp(ip, askEnv.ASK_SUBMISSION_SECRET);

  if (await isCircuitBreakerOpen()) {
    return jsonWithCookie(
      { error: 'Not accepting new messages right now' },
      503,
      identity.newCookieValue,
    );
  }

  if (
    (await findOpenThread(identity.providerId)) ||
    (await isInCooldown(identity.providerId))
  ) {
    return jsonWithCookie(
      { error: 'You already have an open message; please wait for a reply' },
      429,
      identity.newCookieValue,
    );
  }

  const duplicateSlug = await findDuplicatePendingSlug(
    identity.providerId,
    submission.body,
  );
  if (duplicateSlug) {
    return jsonWithCookie({ slug: duplicateSlug }, 200, identity.newCookieValue);
  }

  const heuristicsScore = computeHeuristicsScore(submission.body);
  const submittedAt = new Date().toISOString();

  const created = await createQuestion({
    body: submission.body,
    name: submission.name,
    email: submission.email,
    providerId: identity.providerId,
    status: isSpam(heuristicsScore) ? 'spam' : 'pending',
    slug: generateSlug(),
    submittedAt,
    moderation: {
      heuristicsScore,
      botid: verification.isVerifiedBot ? 'verified-bot' : 'human',
      ipHash,
      ua,
      elapsedMs: Date.now() - submission.t,
    },
  });

  return jsonWithCookie({ slug: created.slug }, 200, identity.newCookieValue);
}
