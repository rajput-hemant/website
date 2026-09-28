import type { MetadataRoute } from "next";

import { site } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /md/* only duplicates the public /<page>.md mirrors the proxy rewrites to it.
      disallow: ["/studio", "/api/", "/md/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
