import type { Metadata } from "next";

import { pageMetadata, type PageMetadataInput } from "@/lib/metadata";

/** Advertises the RSS feed on every /ask page. */
const askFeedAlternates: NonNullable<Metadata["alternates"]>["types"] = {
  "application/rss+xml": [
    { url: "/ask/feed.xml", title: "Ask · answered messages" },
  ],
};

/** `pageMetadata` plus the feed link every /ask page carries. */
export async function askMetadata(
  input: PageMetadataInput & { title: string }
): Promise<Metadata> {
  const metadata = await pageMetadata(input);
  return {
    ...metadata,
    alternates: { ...metadata.alternates, types: askFeedAlternates },
  };
}
