"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

import { getOwnerSession, refreshSiteContent } from "@/lib/ask/client";

export type RefreshState =
  | { state: "idle" }
  | { state: "busy" }
  | { state: "done" }
  | { state: "error"; message: string };

/**
 * The owner's "Refresh site content": expires the Sanity cache tags on the
 * server, then re-renders the open page. Checks the owner session itself, so
 * it works anywhere (the Customize panels are lazy, which keeps this out of
 * visitors' initial JS) and `owner` stays false for everyone else.
 */
export function useRefreshSite() {
  const router = useRouter();
  const [owner, setOwner] = React.useState(false);
  const [status, setStatus] = React.useState<RefreshState>({ state: "idle" });

  React.useEffect(() => {
    let active = true;
    void getOwnerSession().then((result) => {
      if (active) setOwner(result.ok && result.owner);
    });
    return () => {
      active = false;
    };
  }, []);

  async function refresh() {
    setStatus({ state: "busy" });
    const result = await refreshSiteContent();
    if (!result.ok) {
      setStatus({ state: "error", message: result.message });
      return;
    }
    router.refresh();
    setStatus({ state: "done" });
  }

  return { owner, status, refresh };
}

/**
 * Headless: edition styling arrives through `className` (and `data-state`).
 * Renders nothing for visitors. The result is announced in a polite live region.
 */
export function RefreshSiteButton({
  className,
  statusClassName,
  containerClassName,
  label = "Refresh site content",
  busyLabel = "Refreshing",
  doneLabel = "Refreshed",
}: {
  className?: string;
  statusClassName?: string;
  containerClassName?: string;
  label?: string;
  busyLabel?: string;
  doneLabel?: string;
}) {
  const { owner, status, refresh } = useRefreshSite();
  if (!owner) return null;

  const message =
    status.state === "done"
      ? doneLabel
      : status.state === "error"
        ? status.message
        : "";

  return (
    <div className={containerClassName}>
      <button
        type="button"
        className={className}
        data-state={status.state}
        aria-disabled={status.state === "busy"}
        onClick={() => {
          if (status.state !== "busy") void refresh();
        }}
      >
        {status.state === "busy" ? busyLabel : label}
      </button>
      <span role="status" aria-live="polite" className={statusClassName}>
        {message}
      </span>
    </div>
  );
}
