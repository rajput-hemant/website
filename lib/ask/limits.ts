import { askConfig } from "./config";
import { type IdentityActivity } from "./store";

export type IdentityLimit = "open-thread" | "cooldown" | "daily-cap";

/** The daily cap for a network bucket: per IP, or global when the address is unknown. */
export function dailyCap(ipTrusted: boolean): number {
  return ipTrusted
    ? askConfig.limits.dailyPerIp
    : askConfig.limits.dailyWithoutTrustedProxy;
}

/** The first limit the activity hits, or null when the requester may submit. */
export function identityLimit(
  activity: IdentityActivity,
  cap: number
): IdentityLimit | null {
  if (activity.today >= cap) return "daily-cap";
  if (activity.open > 0) return "open-thread";
  if (activity.cooldown > 0) return "cooldown";
  return null;
}
