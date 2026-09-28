import { getSiteIdentity } from "@/lib/data";
import { Monogram, monogramLetter } from "@/components/og/monogram";
import { renderOgImage } from "@/components/og/render";

const SIZES = [32, 192, 512] as const;

export function generateImageMetadata() {
  return SIZES.map((px) => ({
    id: String(px),
    size: { width: px, height: px },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const px = Number(await id);
  const letter = monogramLetter(await getSiteIdentity());
  return renderOgImage(<Monogram size={px} rounded letter={letter} />, {
    width: px,
    height: px,
  });
}
