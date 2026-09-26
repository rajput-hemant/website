"use client";

import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

import type { LinkPreview } from "@/lib/link-previews/types";
import { displayDomain } from "@/lib/link-previews/url";

/**
 * A proof of the destination, pulled before you go: its image in a reserved
 * 16:9 slot, the title, two lines of description and the domain slug.
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
    <div className="crop-marks w-80 max-w-[calc(100vw-2rem)] bg-sheet p-3 shadow-sheet">
      {preview.image && (
        <div className="relative mb-3 aspect-video overflow-hidden bg-shade">
          {status === "failed" ? (
            <span className="absolute inset-0 grid place-items-center slug">
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
                "absolute inset-0 size-full object-cover grayscale-[0.2] transition-opacity duration-(--duration-ui)",
                status === "loaded" ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </div>
      )}
      <p className="line-clamp-2 leading-snug font-bold">
        {preview.title ?? domain}
      </p>
      {preview.description && (
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
          {preview.description}
        </p>
      )}
      <p className="mt-2 truncate slug">Proof of &nbsp;/&nbsp; {domain}</p>
    </div>
  );
}
