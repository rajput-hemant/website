import { site } from "@/content/site";
import { renderPageOgImage } from "@/components/og/render";
import { ogSize } from "@/components/og/theme";

export const alt = `Ask ${site.name} anything`;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderPageOgImage("/ask");
}
