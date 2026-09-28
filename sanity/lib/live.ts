import { defineLive } from "next-sanity/live";

import { client } from "./client";
import { readToken } from "./token";

/**
 * Only `<SanityLive>` is used, and only in draft mode, to refresh the owner's
 * preview as drafts change. Public pages never subscribe; they are static and
 * revalidated by the webhook.
 */
export const { SanityLive } = defineLive({
  client,
  serverToken: readToken ?? false,
  browserToken: readToken ?? false,
});
