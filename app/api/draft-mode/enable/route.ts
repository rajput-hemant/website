import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { isSanityConfigured } from "@/lib/env";
import { client } from "@/sanity/lib/client";
import { readToken } from "@/sanity/lib/token";

const draftModeHandler = defineEnableDraftMode({
  client: client.withConfig({ token: readToken }),
});

export function GET(request: Request) {
  if (!isSanityConfigured || !readToken) {
    return new Response(
      "Draft mode needs a Sanity project and SANITY_API_READ_TOKEN. See docs/sanity.md.",
      { status: 503 }
    );
  }
  return draftModeHandler.GET(request);
}
