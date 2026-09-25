import { askConfig } from "./config";

export type TimingVerdict =
  | { ok: true; elapsedMs: number }
  | { ok: false; reason: "too-fast" | "too-slow"; elapsedMs: number };

/**
 * Checks the time between the form mounting (`mountedAt`, client clock) and the
 * submission (`now`, server clock). A negative elapsed time counts as too fast.
 */
export function checkTimeToSubmit(
  mountedAt: number,
  now: number,
  window: { minMs: number; maxMs: number } = askConfig.timeToSubmit
): TimingVerdict {
  const elapsedMs = now - mountedAt;
  if (elapsedMs < window.minMs) {
    return { ok: false, reason: "too-fast", elapsedMs };
  }
  if (elapsedMs > window.maxMs) {
    return { ok: false, reason: "too-slow", elapsedMs };
  }
  return { ok: true, elapsedMs };
}
