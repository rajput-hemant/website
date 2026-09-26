"use client";

import { PreviewCard } from "@base-ui/react/preview-card";

import { useLinkPreview } from "@/components/semantic/link-preview/use-link-preview";
import { useFinePointer } from "@/components/semantic/use-media-query";

import { LinkPreviewCard } from "./link-preview-card";

function linkPreviewsOn(): boolean {
  return document.documentElement.dataset.linkPreviews !== "off";
}

/**
 * Hover cards for links in the page body, from one set of delegated
 * listeners. `data-no-preview` opts a link or region out, and the "Link
 * previews" preference (`data-link-previews` on `<html>`) turns the layer
 * off without unmounting it. The card is decoration: `aria-hidden`, never
 * focusable, never hoverable, and only on fine pointers.
 */
export function LinkPreviewLayer() {
  const fine = useFinePointer();
  const { card, open, setOpen } = useLinkPreview({
    rootId: "main",
    enabled: fine,
    isOn: linkPreviewsOn,
  });

  if (!fine) return null;

  return (
    <PreviewCard.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) setOpen(false);
      }}
    >
      <PreviewCard.Portal>
        <PreviewCard.Positioner
          anchor={card?.target.anchor}
          side="bottom"
          align="start"
          sideOffset={10}
          collisionPadding={16}
          className="pointer-events-none z-50"
        >
          <PreviewCard.Popup
            aria-hidden
            data-link-preview
            className="origin-(--transform-origin) transition-opacity duration-(--duration-ui) ease-enter data-[ending-style]:opacity-0 data-[ending-style]:duration-(--duration-press) data-[starting-style]:opacity-0 motion:transition-[opacity,translate] motion:data-[starting-style]:-translate-y-1"
          >
            {card && (
              <LinkPreviewCard
                key={card.target.key}
                href={card.target.anchor.href}
                preview={card.preview}
              />
            )}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
