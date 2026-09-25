import { Monogram } from "@/components/og/monogram";
import { renderOgImage } from "@/components/og/render";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderOgImage(<Monogram size={size.width} />, size);
}
