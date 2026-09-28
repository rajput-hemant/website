import { getSiteIdentity } from "@/lib/data";
import { Monogram, monogramLetter } from "@/components/og/monogram";
import { renderOgImage } from "@/components/og/render";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const letter = monogramLetter(await getSiteIdentity());
  return renderOgImage(<Monogram size={size.width} letter={letter} />, size);
}
