import type { NavItem } from "@/content/site";

export type Card = NavItem & {
  /** The card's number in the chain, printed as `Card 02`. */
  n: number;
  /** What the page is in the sample book. */
  job: string;
  /** `g` then this key jumps here. */
  key: string;
};

/**
 * The card chain: a Jacquard loom reads one punched card per pick, and this
 * site reads one card per page. The header shows cards 2 to 5; the rest are
 * in the footer and ⌘K.
 */
export const cards = [
  { href: "/", label: "Home", n: 1, job: "Sample book", key: "h" },
  { href: "/projects", label: "Projects", n: 2, job: "Swatch book", key: "p" },
  { href: "/work", label: "Experience", n: 3, job: "Threads", key: "e" },
  { href: "/lab", label: "Lab", n: 4, job: "Trial pieces", key: "l" },
  { href: "/about", label: "About", n: 5, job: "Object label", key: "a" },
  { href: "/now", label: "Now", n: 6, job: "Loom log", key: "n" },
  { href: "/ask", label: "Ask", n: 7, job: "Sampler board", key: "q" },
  { href: "/resume", label: "Resume", n: 8, job: "Pattern card", key: "r" },
] as const satisfies readonly Card[];

export const CARD_COUNT = cards.length;

/** Primary navigation, in display order. */
export const nav = cards.slice(1, 5);

/** The card a path belongs to (`/projects/x` is card 2), if any. */
export function cardFor(pathname: string): Card | undefined {
  return cards.find(
    (entry) =>
      pathname === entry.href ||
      (entry.href !== "/" && pathname.startsWith(`${entry.href}/`))
  );
}
