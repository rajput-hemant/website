import { askConfig } from "./config";
import { type IdentityActivity } from "./store";

export type SubmitKind = "thread" | "reply";

type Limits = { [K in keyof typeof askConfig.limits]: number };

export type IdentityLimit =
  "daily-cap" | "pending-thread" | "pending-replies" | "reply-cap";

/** The daily cap for a network bucket: per IP, or global when the address is unknown. */
export function dailyCap(ipTrusted: boolean): number {
  return ipTrusted
    ? askConfig.limits.dailyPerIp
    : askConfig.limits.dailyWithoutTrustedProxy;
}

/** The first limit the activity hits for this kind of message, or null when it may be sent. */
export function identityLimit(
  kind: SubmitKind,
  activity: IdentityActivity,
  cap: number,
  limits: Limits = askConfig.limits
): IdentityLimit | null {
  if (activity.today >= cap) return "daily-cap";
  if (kind === "thread") {
    return activity.pendingThreads >= limits.pendingThreadsPerIdentity
      ? "pending-thread"
      : null;
  }
  if (activity.repliesToday >= limits.repliesPerDay) return "reply-cap";
  if (activity.pendingReplies >= limits.pendingRepliesPerIdentity) {
    return "pending-replies";
  }
  return null;
}
