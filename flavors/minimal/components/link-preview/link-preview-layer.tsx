"use client";

import { PreviewCard } from "@base-ui/react/preview-card";

import { useLinkPreview } from "@/components/semantic/link-preview/use-link-preview";

import { LinkPreviewCard } from "./link-preview-card";

/**
 * Hover cards for links in the page body: after a short hover or keyboard
 * focus, a small card shows the destination's image, title, description and
 * domain. One set of delegated listeners serves every link, so pages need no
 * wrappers; `data-no-preview` opts a link (or a whole region) out.
 *
 * The card is decoration for sighted pointer and keyboard users: it is
 * `aria-hidden`, never takes focus and can't be hovered into, and the link
 * keeps its own accessible name. Esc, a click, or leaving the link dismisses it.
 * Mounted only for fine pointers (see InteractionLayer).
 */
export function LinkPreviewLayer() {
  const { card, open, setOpen } = useLinkPreview({ rootId: "content" });

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
            className="origin-(--transform-origin) transition-[opacity,translate] duration-(--duration-enter) ease-enter data-ending-style:opacity-0 data-ending-style:duration-(--duration-exit) data-ending-style:ease-exit data-starting-style:-translate-y-1 data-starting-style:opacity-0"
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
