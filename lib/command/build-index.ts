import { DEFAULT_FLAVOR } from "@/flavors/registry";

import { labExperiments } from "@/content/lab";
import { pages } from "@/content/site";
import {
  getChangelog,
  getEducation,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
  getSkills,
} from "@/lib/data";
import type { Experience, Question, Update } from "@/lib/data/types";
import {
  formatDate,
  formatDateRange,
  formatMonthYear,
  isMonthPrecision,
} from "@/lib/format";

import { changelogUpdateHref } from "./changelog-href";
import type { SearchEntry, SearchIndex } from "./types";

const TITLE_MAX = 80;
const QUESTIONS_PAGE_SIZE = 100;

function truncate(text: string, max = TITLE_MAX): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}

function yearOf(date: string): string {
  return date.slice(0, 4);
}

function roleEntry(role: Experience): SearchEntry {
  return {
    id: `role:${role.id}`,
    title: `${role.title}, ${role.company}`,
    subtitle: formatDateRange(role.startDate, role.endDate),
    group: "Work",
    href: `/work#${role.id}`,
    keywords: [
      role.company,
      role.location,
      role.employmentType,
      yearOf(role.startDate),
      ...(role.endDate ? [yearOf(role.endDate)] : []),
      ...role.highlights,
    ],
  };
}

function updateEntry(update: Update): SearchEntry {
  const year = yearOf(update.date);
  return {
    id: `update:${update.id}`,
    title: truncate(update.text),
    subtitle: isMonthPrecision(update.date)
      ? formatMonthYear(update.date)
      : formatDate(update.date),
    group: "Changelog",
    href: changelogUpdateHref(DEFAULT_FLAVOR, year),
    keywords: [update.category, year],
  };
}

function questionEntry(question: Question): SearchEntry {
  const replies = question.replies.length;
  return {
    id: `ask:${question.slug}`,
    title: truncate(question.body),
    subtitle: [
      question.authorName ?? "Anonymous",
      replies === 1 ? "1 reply" : `${replies} replies`,
    ].join(" · "),
    group: "Ask",
    href: `/ask/${question.slug}`,
    keywords: question.replies.map((reply) => truncate(reply.body, 200)),
  };
}

async function getAllQuestions(): Promise<Question[]> {
  const first = await getQuestions({ pageSize: QUESTIONS_PAGE_SIZE });
  const pageCount = Math.ceil(first.total / QUESTIONS_PAGE_SIZE);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) =>
      getQuestions({ page: i + 2, pageSize: QUESTIONS_PAGE_SIZE })
    )
  );
  return [first, ...rest].flatMap((page) => page.items);
}

/**
 * Everything the ⌘K menu can find, from the same accessors the pages use, so
 * the index is revalidated by the same Sanity tags. Page entries also carry
 * the words of content that lives only on that page (skills, education, now).
 */
export async function buildSearchIndex(): Promise<SearchIndex> {
  const [
    profile,
    experience,
    projects,
    changelog,
    now,
    skills,
    education,
    questions,
  ] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getChangelog(),
    getNow(),
    getSkills(),
    getEducation(),
    getAllQuestions(),
  ]);

  const pageKeywords: Partial<Record<string, string[]>> = {
    "/about": [
      ...skills.flatMap((group) => [group.title, ...group.items]),
      ...education.flatMap((item) => [item.institution, item.degree]),
    ],
    "/now": now.items.map((item) => item.text),
  };

  const entries: SearchEntry[] = [
    ...pages.map((page) => ({
      id: `page:${page.path}`,
      title: page.title,
      subtitle: page.description,
      group: "Pages" as const,
      href: page.path,
      keywords: pageKeywords[page.path] ?? [],
    })),
    ...projects.map((project) => ({
      id: `project:${project.slug}`,
      title: project.name,
      subtitle: project.tagline,
      group: "Projects" as const,
      href: `/projects#${project.slug}`,
      keywords: [
        ...project.stack,
        project.status,
        ...(project.year != null ? [String(project.year)] : []),
      ],
    })),
    ...experience.map(roleEntry),
    ...changelog.map(updateEntry),
    ...labExperiments.map((experiment) => ({
      id: `lab:${experiment.slug}`,
      title: experiment.title,
      subtitle: experiment.description,
      group: "Lab" as const,
      href: `/lab/${experiment.slug}`,
      keywords: [...experiment.tags, String(experiment.year)],
    })),
    ...questions.map(questionEntry),
  ];

  return { entries, email: profile.email };
}
