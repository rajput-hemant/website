/**
 * Domain types for all site content. These are the contract between the data
 * layer (`lib/data/*`, backed by Sanity or the bundled fallback in
 * `content/fallback/*`) and every page, markdown mirror and metadata route.
 * They are deliberately decoupled from generated Sanity types.
 */
import type { PortableTextBlock } from "@portabletext/react";

export type RichText = PortableTextBlock[];

/** ISO date string, `YYYY-MM-DD` (day may be `01` when only the month is known). */
export type IsoDate = string;

export type Link = { label: string; url: string };

export type Image = {
  url: string;
  alt: string;
  width: number;
  height: number;
  /** Tiny base64 placeholder, when available. */
  blurDataUrl?: string;
};

export type Profile = {
  name: string;
  headline: string;
  bio: RichText;
  availability?: string;
  /** Stylised or illustrated only. `null` when absent; layouts adapt. */
  avatar: Image | null;
  location: string;
  email: string;
  links: Link[];
  resumeNote?: string;
};

export type EmploymentType =
  "full-time" | "part-time" | "contract" | "freelance";

export type Experience = {
  id: string;
  company: string;
  companyUrl?: string;
  companyBlurb?: string;
  title: string;
  location: string;
  remote: boolean;
  employmentType: EmploymentType;
  /** Free-form qualifier shown next to the type, e.g. "Part-time, then Full-time from Dec 2024". */
  employmentNote?: string;
  startDate: IsoDate;
  /** `undefined` means present. */
  endDate?: IsoDate;
  /** e.g. "company sunset". */
  endNote?: string;
  /** The successor role this one continued into (team or manager move). */
  continuedInto?: { id: string; company: string; note?: string };
  /** Set on the successor: the role it continued from. Derived, not stored. */
  continuedFrom?: { id: string; company: string; note?: string };
  body: RichText;
  highlights: string[];
};

export type ProjectStatus = "active" | "maintained" | "archived" | "wip";

export type Project = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: RichText;
  stack: string[];
  github?: string;
  live?: string;
  featured: boolean;
  status: ProjectStatus;
  year: number;
};

export type Now = {
  items: { text: string; link?: string }[];
  updatedAt: IsoDate;
};

export type UpdateCategory = "project" | "work" | "site" | "learning" | "life";

export type Update = {
  id: string;
  date: IsoDate;
  text: string;
  category: UpdateCategory;
  link?: string;
};

export type SkillGroup = { id: string; title: string; items: string[] };

export type Education = {
  id: string;
  institution: string;
  degree: string;
  location: string;
  startYear?: number;
  endYear: number;
  score?: string;
};

/** Public view of an /ask entry. Private fields (email, moderation) never leave the server. */
export type QuestionStatus =
  "pending" | "unreviewed" | "published" | "rejected" | "spam";

export type Question = {
  id: string;
  slug: string;
  body: string;
  authorName?: string;
  status: QuestionStatus;
  answer?: RichText;
  replies: { by: "owner" | "visitor"; body: string; createdAt: string }[];
  submittedAt: string;
  publishedAt?: string;
};
