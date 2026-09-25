import { site } from "@/content/site";
import { renderPageOgImage } from "@/components/og/render";

export const alt = `Ask ${site.name} anything`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderPageOgImage("/ask");
}
