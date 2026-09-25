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

/**
 * Every public page that has a markdown mirror (`/<page>.md`) and belongs in
 * the sitemap and llms.txt. `/` mirrors to `/index.md`. Each description is
 * the page's one source: its header lede, meta description, social card and
 * markdown summary.
 */
export const pages = [
  { path: "/", title: "Home", description: "About Hemant Rajput" },
  {
    path: "/work",
    title: "Work",
    description:
      "Where I've worked and what I built there, newest first, with skills and education.",
  },
  {
    path: "/projects",
    title: "Projects",
    description:
      "Things I've built, mostly open source: apps, APIs and tools, some still growing and some retired with care.",
  },
  {
    path: "/now",
    title: "Now",
    description: "What I'm focused on at this point in my life.",
  },
  {
    path: "/changelog",
    title: "Changelog",
    description:
      "A running log of what changed: work, projects, this site, and the odd bit of life.",
  },
  {
    path: "/resume",
    title: "Resume",
    description:
      "A printable resume: experience, selected projects, skills and education.",
  },
  {
    path: "/ask",
    title: "Ask",
    description: "Ask me anything, or just say hi",
  },
  {
    path: "/lab",
    title: "Lab",
    description:
      "Small interactive experiments in WebGL, type and motion. Each one runs on its own page and pauses when you look away.",
  },
] as const;

export type SitePage = (typeof pages)[number];
export type SitePath = SitePage["path"];

/** The `pages` entry for a path. */
export function sitePage(path: SitePath): SitePage {
  const page = pages.find((entry) => entry.path === path);
  if (!page) throw new Error(`${path} is not in content/site.ts pages`);
  return page;
}
