"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PreviewCard } from "@base-ui/react/preview-card";

import type { LinkPreview, LinkPreviewMap } from "@/lib/link-previews/types";
import { withGithubFallback } from "@/lib/link-previews/url";

import { LinkPreviewCard } from "./link-preview-card";
import { loadLinkPreviews } from "./load-previews";
import { previewTarget, type PreviewTarget } from "./preview-target";

/** Hover or focus this long before a card appears, so passing over a link never flashes one. */
const OPEN_DELAY_MS = 350;
/** While a card is showing, moving to the next link swaps it almost at once. */
const SWITCH_DELAY_MS = 120;

type Shown = {
  target: PreviewTarget;
  preview: LinkPreview;
  pathname: string;
};

function previewFor(
  map: LinkPreviewMap,
  target: PreviewTarget
): LinkPreview | null {
  const entry = map[target.key];
  if (target.external) return withGithubFallback(target.key, entry ?? {});
  return entry ?? null;
}

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
  const pathname = usePathname();
  const [shown, setShown] = useState<Shown | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: PreviewTarget | null = null;
    let current: HTMLAnchorElement | null = null;

    const main = () => document.getElementById("content");

    const cancel = () => {
      clearTimeout(timer);
      pending = null;
    };
    const close = () => {
      cancel();
      if (!current) return;
      current = null;
      setOpen(false);
    };
    // A click usually navigates and detaches the anchor; an exit animation
    // would then play wherever the positioner falls back to.
    const closeNow = () => {
      close();
      setShown(null);
    };

    const schedule = (target: PreviewTarget) => {
      if (target.anchor === current || target.anchor === pending?.anchor) {
        return;
      }
      cancel();
      pending = target;
      const warm = current !== null;
      void loadLinkPreviews();
      timer = setTimeout(
        async () => {
          const map = await loadLinkPreviews();
          if (pending !== target) return;
          pending = null;
          const preview = previewFor(map, target);
          if (!preview || !target.anchor.isConnected) return;
          current = target.anchor;
          setShown({ target, preview, pathname: window.location.pathname });
          setOpen(true);
        },
        warm ? SWITCH_DELAY_MS : OPEN_DELAY_MS
      );
    };

    const onPointerOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const element = event.target instanceof Element ? event.target : null;
      const target = previewTarget(element, main());
      if (target) schedule(target);
      else close();
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) close();
    };
    const onFocusIn = (event: FocusEvent) => {
      const element = event.target instanceof Element ? event.target : null;
      if (!element?.matches(":focus-visible")) return;
      const target = previewTarget(element, main());
      if (target) schedule(target);
    };
    const onFocusOut = (event: FocusEvent) => {
      const anchor = event.target;
      if (anchor === current || anchor === pending?.anchor) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    const passive = { passive: true } as const;
    document.addEventListener("pointerover", onPointerOver, passive);
    document.addEventListener("pointerout", onPointerOut, passive);
    document.addEventListener("pointerdown", closeNow, passive);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", closeNow);

    return () => {
      cancel();
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      document.removeEventListener("pointerdown", closeNow);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", closeNow);
    };
  }, []);

  // A card opened on the previous page must not survive the navigation.
  const card = shown?.pathname === pathname ? shown : null;

  return (
    <PreviewCard.Root
      open={open && card !== null}
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
            className="origin-(--transform-origin) transition-[opacity,scale] duration-150 ease-snappy data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0"
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
