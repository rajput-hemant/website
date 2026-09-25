import Image from "next/image";

import type { Image as ImageData } from "@/lib/data/types";
import { cn } from "@/lib/utils";

export type AvatarProps = {
  /** From `Profile.avatar`; renders nothing when `null`, so layouts must not reserve space for it. */
  image: ImageData | null;
  /** Rendered width and height in CSS pixels. */
  size: number;
  preload?: boolean;
  className?: string;
};

/** The owner's stylised avatar as a circle, or nothing when there is none. */
export function Avatar({ image, size, preload, className }: AvatarProps) {
  if (!image) return null;

  return (
    <Image
      src={image.url}
      alt={image.alt}
      width={size}
      height={size}
      sizes={`${size}px`}
      preload={preload}
      placeholder={image.blurDataUrl ? "blur" : "empty"}
      blurDataURL={image.blurDataUrl}
      className={cn(
        "shrink-0 rounded-full bg-surface object-cover ring-1 ring-border",
        className
      )}
      style={{ width: size, height: size }}
    />
  );
}
