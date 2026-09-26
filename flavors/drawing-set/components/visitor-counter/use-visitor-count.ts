"use client";

import * as React from "react";

import { parseVisitsResponse } from "@/lib/visits/response";

export type VisitorCount =
  | { status: "loading" }
  | {
      status: "ready";
      visitors: number;
      /** The count this browser last saw, to roll up from; null on a first visit. */
      previous: number | null;
    }
  /** Not configured, rate limited or failed: the counter renders nothing. */
  | { status: "off" };

const ENDPOINT = "/api/visits";
/** Set once this tab has posted, so later loads in the session only read. */
const POSTED_KEY = "hr.visit-posted";
/** The last count shown in this browser, so the next reveal rolls up from it. */
const LAST_COUNT_KEY = "hr.visitors";

/** Grouping matches the sr-only text and NumberFlow's `en-US` locale. */
export const visitorNumberFormat = new Intl.NumberFormat("en-US");

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

function readLastCount(visitors: number): number | null {
  try {
    const stored = Number(window.localStorage.getItem(LAST_COUNT_KEY) ?? "");
    // A stale value from another environment could be larger; roll from 0 then.
    return Number.isSafeInteger(stored) && stored > 0 && stored <= visitors
      ? stored
      : null;
  } catch {
    return null;
  }
}

function writeLastCount(visitors: number) {
  try {
    window.localStorage.setItem(LAST_COUNT_KEY, String(visitors));
  } catch {
    // Without storage the next reveal simply rolls up from 0.
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
  if (!response.ok) {
    // Release the unread body, or Chromium keeps the request open.
    await response.body?.cancel();
    return null;
  }
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

/**
 * Records this visit (once per session) after the page settles, then reports
 * the total. With `enabled` false (the server has no store) it stays off and
 * never requests, so an unconfigured site logs no failed request.
 */
export function useVisitorCount(enabled: boolean): VisitorCount {
  const [count, setCount] = React.useState<VisitorCount>(
    enabled ? { status: "loading" } : { status: "off" }
  );

  React.useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const cancelIdle = whenIdle(() => {
      fetchCount(controller.signal)
        .then((visitors) => {
          if (visitors === null) {
            setCount({ status: "off" });
            return;
          }
          setCount({
            status: "ready",
            visitors,
            previous: readLastCount(visitors),
          });
          writeLastCount(visitors);
        })
        .catch(() => {
          if (!controller.signal.aborted) setCount({ status: "off" });
        });
    });
    return () => {
      cancelIdle();
      controller.abort();
    };
  }, [enabled]);

  return count;
}
