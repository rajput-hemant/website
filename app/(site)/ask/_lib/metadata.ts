import { type Metadata } from "next";

import { pageMetadata, type PageMetadataInput } from "@/lib/metadata";

/** Advertises the RSS feed on every /ask page. */
const askFeedAlternates: NonNullable<Metadata["alternates"]>["types"] = {
  "application/rss+xml": [
    { url: "/ask/feed.xml", title: "Ask · answered messages" },
  ],
};

/** `pageMetadata` plus the feed link every /ask page carries. */
export function askMetadata(
  input: PageMetadataInput & { title: string }
): Metadata {
  const metadata = pageMetadata(input);
  return {
    ...metadata,
    alternates: { ...metadata.alternates, types: askFeedAlternates },
  };
}
