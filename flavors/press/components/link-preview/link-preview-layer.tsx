"use client";

import { PreviewCard } from "@base-ui/react/preview-card";

import { useLinkPreview } from "@/components/semantic/link-preview/use-link-preview";
import { useFinePointer } from "@/components/semantic/use-media-query";

import { LinkPreviewCard } from "./link-preview-card";

const linkPreviewsOn = () =>
  document.documentElement.dataset.linkPreviews !== "off";

/**
 * Hover and focus cards for links in the page body. Decoration only: the
 * card is aria-hidden and never takes focus. Fine pointers only.
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
          sideOffset={16}
          collisionPadding={24}
          className="pointer-events-none z-50"
        >
          <PreviewCard.Popup
            aria-hidden
            data-link-preview
            className="origin-(--transform-origin) transition-[opacity,translate,rotate] duration-(--duration-ui) ease-enter data-ending-style:opacity-0 data-starting-style:-translate-y-1 data-starting-style:-rotate-1 data-starting-style:opacity-0"
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
