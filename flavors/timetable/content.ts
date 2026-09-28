import type { NavItem } from "@/content/site";

export type Platform = NavItem & {
  /** The platform number painted on the sign. */
  platform: string;
  /** What the split-flap indicator reads when you point at this platform. */
  board: readonly [string, string];
};

/**
 * The station's platforms: every page is a numbered platform. The header
 * nav is 1 to 4; the rest are reached from the footer and ⌘K.
 */
export const platforms = [
  {
    href: "/",
    label: "Home",
    platform: "0",
    board: ["CONCOURSE", "ALL SERVICES"],
  },
  {
    href: "/projects",
    label: "Projects",
    platform: "1",
    board: ["PROJECTS", "DEPARTURES"],
  },
  {
    href: "/work",
    label: "Experience",
    platform: "2",
    board: ["EXPERIENCE", "NETWORK MAP"],
  },
  { href: "/lab", label: "Lab", platform: "3", board: ["LAB", "EXPERIMENTS"] },
  {
    href: "/about",
    label: "About",
    platform: "4",
    board: ["ABOUT", "STATION GUIDE"],
  },
  {
    href: "/now",
    label: "Now",
    platform: "5",
    board: ["NOW", "SERVICE UPDATES"],
  },
  { href: "/ask", label: "Ask", platform: "6", board: ["ASK", "INFORMATION"] },
  {
    href: "/resume",
    label: "Resume",
    platform: "7",
    board: ["RESUME", "PRINTED GUIDE"],
  },
] as const satisfies readonly Platform[];

/** Primary navigation (platforms 1 to 4), in display order. */
export const nav = platforms.slice(1, 5);

/** The platform a path belongs to (`/projects/x` is on platform 1), if any. */
export function platformFor(pathname: string): Platform | undefined {
  return platforms.find(
    (entry) =>
      pathname === entry.href ||
      (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  );
}
