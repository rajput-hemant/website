import { employmentLabels, projectStatusLabels } from "@/lib/data/labels";
import type {
  Education,
  Experience,
  Now,
  Project,
  SkillGroup,
} from "@/lib/data/types";
import { formatDate, formatDateRange, formatYearRange } from "@/lib/format";
import { displayUrl } from "@/lib/url";

import { bulletList, metaLine } from "./document";
import { escapeText, heading, link } from "./escape";
import { portableTextToMarkdown } from "./portable-text";

function companyLink(role: Experience): string {
  return role.companyUrl
    ? link(role.company, role.companyUrl)
    : escapeText(role.company);
}

/** `Title, [Company](url) · Jan 2026 – Present`, for compact lists. */
export function roleSummary(role: Experience): string {
  return metaLine([
    `${escapeText(role.title)}, ${companyLink(role)}`,
    escapeText(formatDateRange(role.startDate, role.endDate)),
  ]);
}

function roleMeta(role: Experience): string {
  const employment =
    role.employmentNote ?? employmentLabels[role.employmentType];
  return metaLine([
    escapeText(role.remote ? `${role.location} (remote)` : role.location),
    escapeText(employment),
    escapeText(formatDateRange(role.startDate, role.endDate)),
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

function projectLinks(project: Project): string | undefined {
  const links = [
    project.github && link("GitHub", project.github),
    project.live && link(displayUrl(project.live), project.live),
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
      escapeText(projectStatusLabels[project.status]),
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
        ? `${escapeText(item.text)} (${link(displayUrl(item.link), item.link)})`
        : escapeText(item.text)
    )
  );
}

export function nowAsOf(now: Now): string {
  return `As of ${escapeText(formatDate(now.updatedAt))}.`;
}

export function skillsList(groups: readonly SkillGroup[]): string {
  return bulletList(
    groups.map(
      (group) =>
        `**${escapeText(group.title)}:** ${escapeText(group.items.join(", "))}`
    )
  );
}

export function educationList(entries: readonly Education[]): string {
  return bulletList(
    entries.map((entry) =>
      metaLine([
        `**${escapeText(entry.degree)}**, ${escapeText(entry.institution)}`,
        escapeText(entry.location),
        formatYearRange(entry.startYear, entry.endYear),
        entry.score && escapeText(entry.score),
      ])
    )
  );
}
