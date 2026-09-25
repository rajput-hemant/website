import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import type { z } from 'zod';
import { auth } from '~/auth';
import { askEnv } from '~/env/ask';
import { authEnv } from '~/env/auth';
import { askConfig } from './config';
import { isOwnerId } from './limits';
import { isJsonRequest, isSameOrigin } from './request';
import type { ApiError, AuthorKind } from './types';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function requireSubmissionSecret(): string {
  const secret = askEnv.ASK_SUBMISSION_SECRET;
  if (!secret) throw new HttpError(503, 'Ask is not set up yet.');
  return secret;
}

export function jsonError(status: number, error: string) {
  return NextResponse.json<ApiError>({ error }, { status });
}

export function withErrors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>,
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof HttpError)
        return jsonError(error.status, error.message);
      console.error('[ask]', error);
      return jsonError(500, 'Something went wrong. Please try again.');
    }
  };
}

export function assertSameOrigin(request: NextRequest): void {
  if (!isSameOrigin(request.headers)) throw new HttpError(403, 'Forbidden');
}

export async function readJson<Schema extends z.ZodType>(
  request: NextRequest,
  schema: Schema,
): Promise<z.infer<Schema>> {
  assertSameOrigin(request);
  if (!isJsonRequest(request.headers)) {
    throw new HttpError(415, 'Unsupported content type');
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > askConfig.bodySizeLimitBytes) {
    throw new HttpError(413, 'Message is too long');
  }
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > askConfig.bodySizeLimitBytes) {
    throw new HttpError(413, 'Message is too long');
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    throw new HttpError(400, 'Invalid request');
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new HttpError(400, 'Invalid request');
  return parsed.data;
}

export type SignedInUser = {
  providerId: string;
  kind: Exclude<AuthorKind, 'anonymous'>;
  name: string | null;
  email: string | null;
  image: string | null;
  isOwner: boolean;
};

function providerKind(providerId: string): SignedInUser['kind'] | null {
  const kind = /^(github|google|dev):[\w-]+$/.exec(providerId)?.[1];
  return kind === 'github' || kind === 'google' || kind === 'dev' ? kind : null;
}

function httpsUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

export async function getSignedInUser(): Promise<SignedInUser | null> {
  if (!authEnv.AUTH_SECRET) return null;
  const session = await auth();
  const user = session?.user;
  const providerId = user?.id;
  const kind = providerId ? providerKind(providerId) : null;
  if (!user || !providerId || !kind) return null;

  return {
    providerId,
    kind,
    name: user.name?.slice(0, askConfig.name.max) ?? null,
    email: user.email ?? null,
    image: httpsUrl(user.image),
    isOwner: isOwnerId(providerId, authEnv.ASK_OWNER_IDS),
  };
}

export async function requireSignedInUser(): Promise<SignedInUser> {
  const user = await getSignedInUser();
  if (!user) throw new HttpError(401, 'Sign in to do that.');
  return user;
}
