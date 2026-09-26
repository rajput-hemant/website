/** Result groups, in their canonical order (used to break ranking ties). */
export const searchGroups = [
  "Pages",
  "Projects",
  "Work",
  "Log",
  "Lab",
  "Ask",
  "Actions",
] as const;

export type SearchGroup = (typeof searchGroups)[number];

/** One navigable row in `/search.json`. Serializable; built on the server. */
export type SearchEntry = {
  /** Unique across the index, e.g. `project:lipi`. */
  id: string;
  title: string;
  subtitle?: string;
  group: Exclude<SearchGroup, "Actions">;
  href: string;
  /** Extra terms that match but are never shown (stack, company, year…). */
  keywords: string[];
};

/** The body of `/search.json`. */
export type SearchIndex = {
  entries: SearchEntry[];
  /** For the "Copy email" action. */
  email: string;
};
