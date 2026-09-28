"use client";

import * as React from "react";

import { type PostStatus } from "@/lib/ask/client";

/**
 * The inline reply at the end of a thread: open and close with focus back on
 * the Reply control, and the announcement after a send. `pendingNotice` is
 * the edition's wording for a reply that waits for approval.
 */
export function useThreadReply(defaultOpen: boolean, pendingNotice: string) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [announcement, setAnnouncement] = React.useState("");
  const replyButtonRef = React.useRef<HTMLButtonElement>(null);
  const collapsible = !defaultOpen;

  function close() {
    setOpen(false);
    requestAnimationFrame(() => replyButtonRef.current?.focus());
  }

  function openComposer() {
    setAnnouncement("");
    setOpen(true);
  }

  function handleSent(status: PostStatus) {
    if (!collapsible) return;
    setAnnouncement(
      status === "published" ? "Reply published." : pendingNotice
    );
    close();
  }

  return {
    open,
    collapsible,
    announcement,
    replyButtonRef,
    close,
    openComposer,
    handleSent,
  };
}
