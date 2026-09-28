import type { NavItem } from "@/content/site";

export type Channel = NavItem & { ch: string };

/** The instrument's model plate: his initials and the revision year. */
export const MODEL = "HR-26";

/**
 * Every page is a channel. 00 to 04 sit on the selector knob's five detents;
 * 05 to 07 are auxiliary channels reached from the footer and ⌘K.
 */
export const channels = [
  { href: "/", label: "Home", ch: "00" },
  { href: "/projects", label: "Projects", ch: "01" },
  { href: "/work", label: "Experience", ch: "02" },
  { href: "/lab", label: "Lab", ch: "03" },
  { href: "/about", label: "About", ch: "04" },
  { href: "/now", label: "Now", ch: "05" },
  { href: "/ask", label: "Ask", ch: "06" },
  { href: "/resume", label: "Resume", ch: "07" },
] as const satisfies readonly Channel[];

/** The selector's detents, in order: Home then the four primary channels. */
export const selector = channels.slice(0, 5);

/** Primary navigation keys in the header (01 to 04). */
export const nav = channels.slice(1, 5);

/** The channel a path belongs to (`/projects/x` is on 01), if any. */
export function channelFor(pathname: string): Channel | undefined {
  return channels.find(
    (entry) =>
      pathname === entry.href ||
      (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  );
}

/** The rating plate's stack line: the tools the headline is built on. */
export const STACK = "TypeScript, React, Next.js, Node, React Native";
