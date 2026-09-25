import { env } from "@/lib/env";

export const site = {
  name: "Hemant Rajput",
  shortName: "hemant",
  handle: "rajput-hemant",
  description:
    "Fullstack engineer crafting fast, accessible, pixel-perfect web experiences with TypeScript, React and Next.js.",
  url: env.siteUrl,
  locale: "en_US",
} as const;

export type NavItem = { href: string; label: string };

/** Primary navigation, in display order. */
export const nav = [
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/now", label: "Now" },
  { href: "/changelog", label: "Changelog" },
  { href: "/ask", label: "Ask" },
  { href: "/lab", label: "Lab" },
] as const satisfies readonly NavItem[];

/**
 * Every public page that has a markdown mirror (`/<page>.md`) and belongs in
 * the sitemap and llms.txt. `/` mirrors to `/index.md`.
 */
export const pages = [
  { path: "/", title: "Home", description: "About Hemant Rajput" },
  {
    path: "/work",
    title: "Work",
    description: "Experience, skills and education",
  },
  { path: "/projects", title: "Projects", description: "Things I have built" },
  { path: "/now", title: "Now", description: "What I am focused on right now" },
  {
    path: "/changelog",
    title: "Changelog",
    description: "A running log of what changed",
  },
  { path: "/resume", title: "Resume", description: "Printable resume" },
  {
    path: "/ask",
    title: "Ask",
    description: "Ask me anything, or just say hi",
  },
  { path: "/lab", title: "Lab", description: "Interactive experiments" },
] as const;
