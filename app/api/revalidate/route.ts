import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { isSanityTag } from "@/sanity/lib/fetch";

type WebhookPayload = { _type?: string; _id?: string };

/**
 * Sanity webhook target (see docs/sanity.md). Expires the cache tag for the
 * changed document's type so the next request re-renders with fresh content.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 }
    );
  }

  const { isValidSignature, body } = await parseBody<WebhookPayload>(
    request,
    secret,
    true
  );
  if (!isValidSignature) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  const type = body?._type;
  if (!isSanityTag(type)) {
    // 200 so Sanity does not retry deliveries for types the site never renders.
    return NextResponse.json({ revalidated: [], type: type ?? null });
  }

  revalidateTag(type, { expire: 0 });
  return NextResponse.json({ revalidated: [type], id: body?._id ?? null });
}
