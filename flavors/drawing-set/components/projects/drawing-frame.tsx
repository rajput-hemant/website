import Image from "next/image";

import type { Image as ImageData } from "@/lib/data/types";

export type DrawingFrameProps = {
  view: string;
  caption: string;
  image?: ImageData;
  sizes?: string;
  className?: string;
};

/**
 * One view on a sheet: the image when there is one, otherwise an empty frame
 * with centre lines and the view letter, waiting for the real drawing.
 */
export function DrawingFrame({
  view,
  caption,
  image,
  sizes = "(min-width: 64rem) 50vw, 100vw",
  className,
}: DrawingFrameProps) {
  return (
    <figure className={className}>
      <div className="relative aspect-[16/10] overflow-hidden border border-line-strong bg-sheet-deep">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            placeholder={image.blurDataUrl ? "blur" : "empty"}
            blurDataURL={image.blurDataUrl}
            className="size-full object-cover"
          />
        ) : (
          <div aria-hidden className="absolute inset-0">
            <span className="absolute inset-x-6 top-1/2 border-t border-dashed border-line" />
            <span className="absolute inset-y-6 left-1/2 border-l border-dashed border-line" />
            <span className="absolute top-1/2 left-1/2 grid size-14 -translate-1/2 place-items-center rounded-full border border-line-strong bg-sheet-deep font-mono text-mono-sm text-ink-soft">
              {view.replace(/^view\s*/i, "")}
            </span>
          </div>
        )}
      </div>
      <figcaption className="mt-2.5 flex gap-3 font-mono text-mono-xs tracking-[0.08em] text-ink-faint uppercase">
        <span className="text-ink-soft">{view}</span>
        <span>{caption}</span>
      </figcaption>
    </figure>
  );
}
