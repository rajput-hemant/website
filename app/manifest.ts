import type { MetadataRoute } from "next";

import { getSiteIdentity } from "@/lib/data";
import { ogColors } from "@/components/og/theme";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const site = await getSiteIdentity();
  return {
    name: site.name,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "browser",
    background_color: ogColors.paper,
    theme_color: ogColors.paper,
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
