"use client";

import * as React from "react";
import { cn } from "@/flavors/survey/lib/utils";

import type { LinkPreview } from "@/lib/link-previews/types";
import { displayDomain } from "@/lib/link-previews/url";

export type LinkPreviewCardProps = {
  href: string;
  preview: LinkPreview;
};

type ImageStatus = "loading" | "loaded" | "failed";

function withPath(href: string): string {
  const { pathname } = new URL(href);
  const path = pathname === "/" ? "" : pathname.replace(/\/$/, "");
  return `${displayDomain(href)}${path}`;
}

/** The source line: the domain (and path, for the site's own pages), after the site name when it adds something. */
function sourceLine(href: string, preview: LinkPreview): string | null {
  const internal = new URL(href).origin === window.location.origin;
  const location = internal ? withPath(href) : displayDomain(href);
  if (!preview.title) {
    // The title slot already shows the domain; only a path would add anything.
    const full = withPath(href);
    return full === location ? null : full;
  }
  return preview.siteName && preview.siteName !== preview.title
    ? `${preview.siteName} · ${location}`
    : location;
}

/**
 * An inset sheet for the destination: a reference strip along the top, a
 * 16:9 image slot (reserved before it loads, so nothing jumps), the title, a
 * two-line description and the source. A failed image leaves a quiet
 * placeholder; no image at all makes it text only.
 */
export function LinkPreviewCard({ href, preview }: LinkPreviewCardProps) {
  const [status, setStatus] = React.useState<ImageStatus>("loading");
  const title = preview.title ?? displayDomain(href);
  const source = sourceLine(href, preview);

  return (
    <div className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden border border-rule-strong bg-sheet shadow-lift">
      <div className="flex items-center gap-2 bg-ink px-3 py-2 text-sheet">
        <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-water" />
        <span className="caps truncate">
          Ref &middot; {displayDomain(href)}
        </span>
      </div>
      {preview.image && (
        <div className="relative aspect-video overflow-hidden border-b border-rule bg-sea">
          {status === "failed" ? (
            <span className="caps absolute inset-0 grid place-items-center text-ink-faint">
              {displayDomain(href)}
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
                "absolute inset-0 size-full object-cover transition-opacity duration-(--duration-ui)",
                status === "loaded" ? "opacity-100" : "opacity-0"
              )}
            />
          )}
        </div>
      )}
      <div className="grid gap-1.5 px-3.5 py-3">
        <p className="line-clamp-2 font-display text-lead leading-snug text-ink">
          {title}
        </p>
        {preview.description && (
          <p className="line-clamp-2 text-sm text-ink-soft">
            {preview.description}
          </p>
        )}
        {source && (
          <p className="mt-0.5 truncate text-sm text-ink-faint">{source}</p>
        )}
      </div>
    </div>
  );
}
