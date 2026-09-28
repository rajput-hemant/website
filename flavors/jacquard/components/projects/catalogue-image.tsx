import { cn } from "@/flavors/jacquard/lib/utils";

import type { Image } from "@/lib/data/types";

const WIDTHS = [640, 960, 1280, 1920];

/** The Sanity CDN resizes on its own: `w` and `auto=format` per candidate. */
function sized(url: string, width: number) {
  const out = new URL(url);
  out.searchParams.set("w", String(width));
  out.searchParams.set("auto", "format");
  return out.toString();
}

/**
 * A project's image as a plain `<img>` with a CDN srcset, so a project page
 * ships no image component script. The blur sits behind it as the frame's
 * background until the image paints over it.
 */
export function CatalogueImage({
  image,
  sizes,
  className,
}: {
  image: Image;
  sizes: string;
  className?: string;
}) {
  const widths = WIDTHS.filter((w) => w < image.width).concat(image.width);
  return (
    <div
      className={cn("overflow-hidden bg-sunk bg-cover", className)}
      style={
        image.blurDataUrl
          ? { backgroundImage: `url(${JSON.stringify(image.blurDataUrl)})` }
          : undefined
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- next/image would add its client component to every project page, over the text-page budget */}
      <img
        src={sized(image.url, Math.min(image.width, 1280))}
        srcSet={widths.map((w) => `${sized(image.url, w)} ${w}w`).join(", ")}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={image.alt}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </div>
  );
}
