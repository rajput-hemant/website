import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { z } from 'zod';
import { webhookEnv } from '~/env/webhook';
import { sanityTags } from '~/sanity/lib/tags';

const payloadSchema = z.object({
  _id: z.string().min(1),
  _type: z.enum([
    'profile',
    'experience',
    'project',
    'now',
    'update',
    'skillGroup',
    'education',
  ]),
});

export async function POST(request: NextRequest) {
  const signature = request.headers.get('sanity-webhook-signature');
  const timestamp = Number(signature?.match(/^t=(\d+)[, ]+v1=/)?.[1]);
  if (
    !Number.isSafeInteger(timestamp) ||
    Math.abs(Date.now() - timestamp) > 300_000
  ) {
    return NextResponse.json({ message: 'Expired signature' }, { status: 401 });
  }

  const { body, isValidSignature } = await parseBody(
    request,
    webhookEnv.SANITY_REVALIDATE_SECRET,
    true,
  );

  if (!isValidSignature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
  }

  const payload = payloadSchema.safeParse(body);
  if (!payload.success) {
    return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });
  }

  const typeTag = sanityTags[payload.data._type];
  const tags = [typeTag, `${typeTag}:${payload.data._id}`];
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ revalidated: tags });
}
