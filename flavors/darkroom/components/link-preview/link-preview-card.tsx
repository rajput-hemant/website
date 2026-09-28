"use client";

import * as React from "react";
import { cn } from "@/flavors/darkroom/lib/utils";

import type { LinkPreview } from "@/lib/link-previews/types";
import { displayDomain } from "@/lib/link-previews/url";

/**
 * A work print of the destination, pulled before you go: its image in a
 * reserved 16:9 frame on a strip of film, the title, two lines of
 * description and the domain in edge print.
 */
export function LinkPreviewCard({
  href,
  preview,
}: {
  href: string;
  preview: LinkPreview;
}) {
  const [status, setStatus] = React.useState<"loading" | "loaded" | "failed">(
    "loading"
  );
  const domain = displayDomain(href);
  return (
    <div className="w-80 max-w-[calc(100vw-2rem)] rounded-[3px] bg-raise p-3 shadow-sheet ring-1 ring-line">
      {preview.image && (
        <div className="relative mb-3 aspect-video overflow-hidden bg-strip">
          {status === "failed" ? (
            <span className="absolute inset-0 grid place-items-center edge">
              {domain}
            </span>
          ) : (
            // Arbitrary external hosts: next/image would need every one allow-listed.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview.image}
              alt=""
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              onLoad={() => setStatus("loaded")}
              onError={() => setStatus("failed")}
              className={cn(
                "absolute inset-0 size-full object-cover transition-[opacity,filter] duration-700 ease-(--ease-chem)",
                status === "loaded"
                  ? "opacity-100"
                  : "opacity-30 brightness-200 contrast-[0.2]"
              )}
            />
          )}
        </div>
      )}
      <p className="line-clamp-2 leading-snug font-semibold">
        {preview.title ?? domain}
      </p>
      {preview.description && (
        <p className="mt-1 line-clamp-2 text-sm text-soft">
          {preview.description}
        </p>
      )}
      <p className="mt-2 truncate edge">▸ {domain}</p>
    </div>
  );
}
