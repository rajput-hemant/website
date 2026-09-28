"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { selector } from "@/flavors/surface/content";

const TYPING_TARGET =
  'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"]';

/** Press 0 to 4 anywhere to switch channel, as the selector's legend says. */
export function ChannelShortcuts() {
  const router = useRouter();

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.repeat)
        return;
      if (event.isComposing || !/^[0-4]$/.test(event.key)) return;
      if (
        event.target instanceof Element &&
        (event.target.closest(TYPING_TARGET) ||
          event.target.closest("[role=dialog]"))
      ) {
        return;
      }
      const channel = selector[Number(event.key)];
      if (!channel) return;
      event.preventDefault();
      router.push(channel.href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return null;
}
