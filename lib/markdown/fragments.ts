import type {
  Education,
  EmploymentType,
  Experience,
  Now,
  Project,
  ProjectStatus,
  SkillGroup,
} from "@/lib/data/types";

import {
  bulletList,
  displayHost,
  formatDay,
  formatRange,
  metaLine,
} from "./document";
import { escapeText, heading, link } from "./escape";
import { portableTextToMarkdown } from "./portable-text";

const EMPLOYMENT_LABELS: Record<EmploymentType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
};

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  active: "Active",
  maintained: "Maintained",
  archived: "Archived",
  wip: "Work in progress",
};

export function companyLink(role: Experience): string {
  return role.companyUrl
    ? link(role.company, role.companyUrl)
    : escapeText(role.company);
}

/** `Title, [Company](url) · Jan 2026 – present`, for compact lists. */
export function roleSummary(role: Experience): string {
  return metaLine([
    `${escapeText(role.title)}, ${companyLink(role)}`,
    escapeText(formatRange(role.startDate, role.endDate)),
  ]);
}

function roleMeta(role: Experience): string {
  const employment =
    role.employmentNote ?? EMPLOYMENT_LABELS[role.employmentType];
  return metaLine([
    escapeText(role.remote ? `${role.location} (remote)` : role.location),
    escapeText(employment),
    escapeText(formatRange(role.startDate, role.endDate)),
    role.endNote && escapeText(role.endNote),
  ]);
}

function continuation(
  label: string,
  ref: Experience["continuedInto"]
): string | undefined {
  if (!ref) return undefined;
  const note = ref.note ? ` (${ref.note})` : "";
  return `*${escapeText(`${label} ${ref.company}${note}`)}*`;
}

type RoleOptions = { level: number; body: boolean };

/** One role: heading, metadata line, and optionally its prose and highlights. */
export function roleSection(role: Experience, options: RoleOptions): string {
  const parts = [
    heading(options.level, `${escapeText(role.title)} · ${companyLink(role)}`),
    roleMeta(role),
    options.body && role.companyBlurb && `*${escapeText(role.companyBlurb)}*`,
    continuation("Continued from", role.continuedFrom),
    options.body && portableTextToMarkdown(role.body),
    role.highlights.length > 0 &&
      bulletList(role.highlights.map((item) => escapeText(item))),
    continuation("Continued at", role.continuedInto),
  ];
  return parts.filter(Boolean).join("\n\n");
}

export function projectLinks(project: Project): string | undefined {
  const links = [
    project.github && link("GitHub", project.github),
    project.live && link(displayHost(project.live), project.live),
  ];
  return links.some(Boolean) ? metaLine(links) : undefined;
}

type ProjectOptions = { level: number; description: boolean };

export function projectSection(
  project: Project,
  options: ProjectOptions
): string {
  const parts = [
    heading(options.level, escapeText(project.name)),
    escapeText(project.tagline),
    metaLine([
      String(project.year),
      escapeText(PROJECT_STATUS_LABELS[project.status]),
      project.featured && "Featured",
      project.stack.length > 0 && escapeText(project.stack.join(", ")),
    ]),
    projectLinks(project),
    options.description && portableTextToMarkdown(project.description),
  ];
  return parts.filter(Boolean).join("\n\n");
}

/** `**Name** · tagline · [GitHub](…)`, for compact lists. */
export function projectSummary(project: Project): string {
  return metaLine([
    `**${escapeText(project.name)}**`,
    escapeText(project.tagline),
    projectLinks(project),
  ]);
}

export function nowList(now: Now): string {
  return bulletList(
    now.items.map((item) =>
      item.link
        ? `${escapeText(item.text)} (${link(displayHost(item.link), item.link)})`
        : escapeText(item.text)
    )
  );
}

export function nowAsOf(now: Now): string {
  return `As of ${escapeText(formatDay(now.updatedAt))}.`;
}

export function skillsList(groups: readonly SkillGroup[]): string {
  return bulletList(
    groups.map(
      (group) =>
        `**${escapeText(group.title)}:** ${escapeText(group.items.join(", "))}`
    )
  );
}

function educationYears(entry: Education): string {
  return entry.startYear
    ? `${entry.startYear} – ${entry.endYear}`
    : String(entry.endYear);
}

export function educationList(entries: readonly Education[]): string {
  return bulletList(
    entries.map((entry) =>
      metaLine([
        `**${escapeText(entry.degree)}**, ${escapeText(entry.institution)}`,
        escapeText(entry.location),
        educationYears(entry),
        entry.score && escapeText(entry.score),
      ])
    )
  );
}
