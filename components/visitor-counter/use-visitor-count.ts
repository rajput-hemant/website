"use client";

import { useEffect, useState } from "react";

import { parseVisitsResponse } from "@/lib/visits/response";

export type VisitorCount =
  | { status: "loading" }
  | { status: "ready"; visitors: number }
  /** Not configured, rate limited or failed: the counter renders nothing. */
  | { status: "off" };

const ENDPOINT = "/api/visits";
/** Set once this tab has posted, so later loads in the session only read. */
const POSTED_KEY = "hr.visit-posted";

function hasPostedThisSession(): boolean {
  try {
    return window.sessionStorage.getItem(POSTED_KEY) === "1";
  } catch {
    return false;
  }
}

function markPostedThisSession() {
  try {
    window.sessionStorage.setItem(POSTED_KEY, "1");
  } catch {
    // Without storage the next load posts again; the daily cookie still dedupes it.
  }
}

async function fetchCount(signal: AbortSignal): Promise<number | null> {
  const posted = hasPostedThisSession();
  const response = posted
    ? await fetch(ENDPOINT, { signal })
    : await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal,
      });
  if (!response.ok) return null;
  if (!posted) markPostedThisSession();
  return parseVisitsResponse(await response.json())?.visitors ?? null;
}

/** Runs `task` once the main thread is idle, so counting never competes with the page. */
function whenIdle(task: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(task, { timeout: 4_000 });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(task, 1_500);
  return () => window.clearTimeout(handle);
}

/** Records this visit (once per session) after the page settles, then reports the total. */
export function useVisitorCount(): VisitorCount {
  const [count, setCount] = useState<VisitorCount>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    const cancelIdle = whenIdle(() => {
      fetchCount(controller.signal)
        .then((visitors) =>
          setCount(
            visitors === null
              ? { status: "off" }
              : { status: "ready", visitors }
          )
        )
        .catch(() => {
          if (!controller.signal.aborted) setCount({ status: "off" });
        });
    });
    return () => {
      cancelIdle();
      controller.abort();
    };
  }, []);

  return count;
}
