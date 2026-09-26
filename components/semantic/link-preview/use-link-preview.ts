"use client";

import * as React from "react";

import { loadLinkPreviews } from "@/lib/link-previews/client/load-previews";
import {
  previewTarget,
  type PreviewTarget,
} from "@/lib/link-previews/client/preview-target";
import type { LinkPreview, LinkPreviewMap } from "@/lib/link-previews/types";
import { withGithubFallback } from "@/lib/link-previews/url";
import { usePublicPathname } from "@/lib/public-pathname";

/** Hover or focus this long before a card appears, so passing over a link never flashes one. */
const OPEN_DELAY_MS = 350;
/** While a card is showing, moving to the next link swaps it almost at once. */
const SWITCH_DELAY_MS = 120;

export type ShownPreview = {
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

const always = () => true;

/**
 * The link-preview controller without markup: one set of delegated listeners
 * for links inside `#rootId`, the hover and focus delays, the preview fetch,
 * and dismissal on Esc, click, blur or leaving the link. `isOn` is read on
 * every event, so a preference can switch it off without unmounting. The
 * caller renders `card` in its own popup while `open` is true.
 */
export function useLinkPreview({
  rootId,
  enabled = true,
  isOn = always,
}: {
  rootId: string;
  enabled?: boolean;
  isOn?: () => boolean;
}) {
  const pathname = usePublicPathname();
  const [shown, setShown] = React.useState<ShownPreview | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let pending: PreviewTarget | null = null;
    let current: HTMLAnchorElement | null = null;

    const main = () => document.getElementById(rootId);

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
          if (!isOn()) return;
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
      if (event.pointerType !== "mouse" || !isOn()) return;
      const element = event.target instanceof Element ? event.target : null;
      const target = previewTarget(element, main());
      if (target) schedule(target);
      else close();
    };
    const onPointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) close();
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!isOn()) return;
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
  }, [enabled, rootId, isOn]);

  // A card opened on the previous page must not survive the navigation.
  const card = shown?.pathname === pathname ? shown : null;
  return { card, open: open && card !== null, setOpen };
}
