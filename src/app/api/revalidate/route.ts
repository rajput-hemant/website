import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { parseBody } from 'next-sanity/webhook';
import { z } from 'zod';
import { serverEnv } from '~/env/server';
import { sanityTags } from '~/sanity/lib/tags';

const payloadSchema = z.object({
  _id: z.string().min(1),
  _type: z.enum(['profile', 'experience', 'project', 'now', 'update']),
});

export async function POST(request: NextRequest) {
  const { body, isValidSignature } = await parseBody(
    request,
    serverEnv.SANITY_REVALIDATE_SECRET,
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
    revalidateTag(tag, 'max');
  }

  return NextResponse.json({ revalidated: tags });
}
