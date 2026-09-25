import { type Metadata } from "next";

/** Advertises the RSS feed on every /ask page. */
export const askFeedAlternates: NonNullable<Metadata["alternates"]>["types"] = {
  "application/rss+xml": [
    { url: "/ask/feed.xml", title: "Ask · answered messages" },
  ],
};
