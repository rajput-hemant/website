"use client";

import * as React from "react";

import type { LinkPreview } from "@/lib/link-previews/types";
import { displayDomain } from "@/lib/link-previews/url";
import { cn } from "@/lib/utils";

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

/** The mono line: the domain (and path, for the site's own pages), after the site name when it adds something. */
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
 * An index card for the destination: a 16:9 image slot (reserved before the
 * image loads, so nothing jumps), a thin accent rule along the top, the
 * title, a two-line description and a mono domain line. With no image at all
 * it is text only; a failed image leaves a quiet placeholder.
 */
export function LinkPreviewCard({ href, preview }: LinkPreviewCardProps) {
  const [status, setStatus] = React.useState<ImageStatus>("loading");
  const title = preview.title ?? displayDomain(href);
  const source = sourceLine(href, preview);

  return (
    <div className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-md border border-t-2 border-hairline border-t-accent bg-ink-raised shadow-lift">
      {preview.image && (
        <div className="relative aspect-video overflow-hidden border-b border-hairline bg-ink-sunken">
          {status === "failed" ? (
            <span className="absolute inset-0 grid place-items-center font-mono text-mono-xs text-pencil">
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
        <p className="line-clamp-2 text-sm leading-snug font-medium text-paper">
          {title}
        </p>
        {preview.description && (
          <p className="line-clamp-2 text-xs text-graphite">
            {preview.description}
          </p>
        )}
        {source && (
          <p className="mt-0.5 truncate font-mono text-mono-xs text-pencil">
            {source}
          </p>
        )}
      </div>
    </div>
  );
}
