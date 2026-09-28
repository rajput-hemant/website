import type { NavItem } from "@/content/site";

/** Primary navigation, in display order. */
export const nav = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/now", label: "Now" },
  { href: "/changelog", label: "Changelog" },
  { href: "/ask", label: "Ask" },
  { href: "/lab", label: "Lab" },
] as const satisfies readonly NavItem[];

export type InlineLink = { href: string; label: string };

/**
 * The line that closes the home intro, after the bio from Sanity: its links
 * double as the page's navigation, paco.me style. Plain strings are text.
 */
export const introLinks: readonly (string | InlineLink)[] = [
  "See my ",
  { href: "/work", label: "work" },
  ", ",
  { href: "/projects", label: "projects" },
  " and ",
  { href: "/lab", label: "lab" },
  ", or ",
  { href: "/ask", label: "ask me anything" },
  ".",
];
