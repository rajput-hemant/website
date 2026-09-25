import 'server-only';
import {
  experiments,
  getExperiment,
  labIntro,
  type Experiment,
} from '~/content/lab';
import { siteConfig } from '~/content/site';
import {
  getChangelog,
  getEducation,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getSkills,
  type ExperienceRole,
  type Now,
  type Project,
} from '~/lib/data';
import { blocksToMarkdown } from '~/lib/markdown/portable-text';
import {
  formatExperienceRange,
  formatIsoDate,
  joinMarkdown,
} from '~/lib/markdown/format';
import {
  isExperimentPage,
  isMarkdownSlug,
  type MarkdownSlug,
  sitePages,
} from '~/lib/markdown/site-pages';

function companyHeading(role: ExperienceRole): string {
  const name = role.company ?? 'Company';
  if (role.companyUrl) {
    return `## [${name}](${role.companyUrl})`;
  }
  return `## ${name}`;
}

function roleMetaLine(role: ExperienceRole): string {
  const parts: string[] = [];
  if (role.title) {
    parts.push(`**${role.title}**`);
  }
  if (role.location) {
    const location = role.remote ? `${role.location} (remote)` : role.location;
    parts.push(location);
  }
  if (role.employmentType) {
    parts.push(role.employmentType);
  }
  const dates = formatExperienceRange(
    role.startDate,
    role.endDate,
    role.endNote,
  );
  if (dates) {
    parts.push(dates);
  }
  return parts.join(' · ');
}

function continuationLine(role: ExperienceRole): string {
  if (role.continuedInto?.company) {
    const note = role.continuationNote ? ` ${role.continuationNote}` : '';
    const successor = role.continuedInto.title
      ? `${role.continuedInto.company} (${role.continuedInto.title})`
      : role.continuedInto.company;
    return `*Continued into ${successor}.${note}*`;
  }
  if (role.continuedFrom?.company) {
    const predecessor = role.continuedFrom.title
      ? `${role.continuedFrom.company} (${role.continuedFrom.title})`
      : role.continuedFrom.company;
    return `*Continued from ${predecessor}.*`;
  }
  return '';
}

function experienceRoleMarkdown(role: ExperienceRole): string {
  const sections: string[] = [companyHeading(role)];
  if (role.companyBlurb) {
    sections.push(role.companyBlurb);
  }
  const meta = roleMetaLine(role);
  if (meta) {
    sections.push(meta);
  }
  const body = blocksToMarkdown(role.body);
  if (body) {
    sections.push(body);
  }
  if (role.highlights?.length) {
    sections.push(
      role.highlights.map((item) => `- ${item}`).join('\n'),
    );
  }
  const continuation = continuationLine(role);
  if (continuation) {
    sections.push(continuation);
  }
  return joinMarkdown(sections);
}

function nowMarkdownLines(now: Now | null | undefined): string[] {
  const lines: string[] = [];
  if (now?.updatedAt) {
    lines.push(`As of ${formatIsoDate(now.updatedAt)}.`);
  }
  if (now?.items?.length) {
    lines.push(
      now.items
        .filter((item) => item.text)
        .map((item) =>
          item.link ? `- [${item.text}](${item.link})` : `- ${item.text}`,
        )
        .join('\n'),
    );
  }
  return lines;
}

function projectMarkdown(project: Project): string {
  const sections: string[] = [];
  const name = project.name ?? 'Project';
  sections.push(`## ${name}`);
  if (project.tagline) {
    sections.push(project.tagline);
  }
  const meta: string[] = [];
  if (project.year) {
    meta.push(String(project.year));
  }
  if (project.status) {
    meta.push(project.status);
  }
  if (project.featured) {
    meta.push('featured');
  }
  if (meta.length) {
    sections.push(meta.join(' · '));
  }
  if (project.stack?.length) {
    sections.push(project.stack.join(', '));
  }
  const links: string[] = [];
  if (project.github) {
    links.push(`[GitHub](${project.github})`);
  }
  if (project.live) {
    links.push(`[Live](${project.live})`);
  }
  if (links.length) {
    sections.push(links.join(' · '));
  }
  const description = blocksToMarkdown(project.description);
  if (description) {
    sections.push(description);
  }
  return joinMarkdown(sections);
}

export async function toHomeMarkdown(): Promise<string> {
  const [profile, experience, projects, now] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getNow(),
  ]);

  const sections: string[] = ['# Home'];

  if (profile?.name) {
    sections.push(`**${profile.name}**`);
  }
  if (profile?.headline) {
    sections.push(profile.headline);
  }
  const bio = blocksToMarkdown(profile?.bio ?? null);
  if (bio) {
    sections.push(bio);
  }
  if (profile?.availability) {
    sections.push(profile.availability);
  }
  if (profile?.location) {
    sections.push(profile.location);
  }
  if (profile?.links?.length) {
    sections.push(
      profile.links
        .filter((link) => link.label && link.url)
        .map((link) => `[${link.label}](${link.url})`)
        .join(' · '),
    );
  }

  if (now?.items?.length) {
    const nowParts = [
      '## Now',
      ...nowMarkdownLines(now),
      `[Full now page](${siteConfig.url}/now)`,
    ];
    sections.push(joinMarkdown(nowParts));
  }

  const featured = projects.filter((project) => project.featured).slice(0, 4);
  if (featured.length) {
    const projectParts = ['## Selected projects'];
    projectParts.push(featured.map((project) => projectMarkdown(project)).join('\n\n'));
    projectParts.push(`[All projects](${siteConfig.url}/projects)`);
    sections.push(joinMarkdown(projectParts));
  }

  if (experience.length) {
    const workParts = ['## Experience'];
    workParts.push(
      experience
        .map((role) => {
          const company = role.company ?? 'Role';
          const title = role.title ? ` - ${role.title}` : '';
          const dates = formatExperienceRange(
            role.startDate,
            role.endDate,
            role.endNote,
          );
          const dateSuffix = dates ? ` (${dates})` : '';
          return `- ${company}${title}${dateSuffix}`;
        })
        .join('\n'),
    );
    workParts.push(`[Full work history](${siteConfig.url}/work)`);
    sections.push(joinMarkdown(workParts));
  }

  return joinMarkdown(sections);
}

export async function toWorkMarkdown(): Promise<string> {
  const [experience, skills, education] = await Promise.all([
    getExperience(),
    getSkills(),
    getEducation(),
  ]);

  const sections: string[] = [
    '# Work',
    experience.map((role) => experienceRoleMarkdown(role)).join('\n\n'),
  ];

  if (skills.length) {
    const skillParts = ['## Skills'];
    skillParts.push(
      skills
        .map((group) => {
          const title = group.title ?? 'Skills';
          const items = group.items?.join(', ') ?? '';
          return `### ${title}\n\n${items}`;
        })
        .join('\n\n'),
    );
    sections.push(joinMarkdown(skillParts));
  }

  if (education.length) {
    const educationParts = ['## Education'];
    educationParts.push(
      education
        .map((entry) => {
          const lines: string[] = [];
          if (entry.degree && entry.institution) {
            lines.push(`### ${entry.degree}, ${entry.institution}`);
          } else if (entry.institution) {
            lines.push(`### ${entry.institution}`);
          }
          const years =
            entry.startYear && entry.endYear
              ? `${entry.startYear} – ${entry.endYear}`
              : entry.endYear
                ? String(entry.endYear)
                : '';
          const location = entry.location ?? '';
          const meta = [years, location, entry.score].filter(Boolean).join(' · ');
          if (meta) {
            lines.push(meta);
          }
          return lines.join('\n');
        })
        .join('\n\n'),
    );
    sections.push(joinMarkdown(educationParts));
  }

  return joinMarkdown(sections);
}

export async function toProjectsMarkdown(): Promise<string> {
  const projects = await getProjects();
  return joinMarkdown([
    '# Projects',
    projects.map((project) => projectMarkdown(project)).join('\n\n'),
  ]);
}

export async function toNowMarkdown(): Promise<string> {
  const now = await getNow();
  return joinMarkdown(['# Now', ...nowMarkdownLines(now)]);
}

export async function toChangelogMarkdown(): Promise<string> {
  const changelog = await getChangelog();
  const lines = changelog
    .filter((entry) => entry.text)
    .map((entry) => {
      const date = entry.date ? formatIsoDate(entry.date) : 'Unknown date';
      const category = entry.category ? ` (${entry.category})` : '';
      const text = entry.link
        ? `[${entry.text}](${entry.link})`
        : entry.text;
      return `- **${date}**${category}: ${text}`;
    });
  return joinMarkdown(['# Changelog', lines.join('\n')]);
}

export async function toResumeMarkdown(): Promise<string> {
  const [profile, experience, projects, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
    getEducation(),
  ]);

  const sections: string[] = ['# Resume'];

  if (profile?.name) {
    sections.push(`**${profile.name}**`);
  }
  if (profile?.headline) {
    sections.push(profile.headline);
  }
  const contact: string[] = [];
  if (profile?.location) {
    contact.push(profile.location);
  }
  if (profile?.links?.length) {
    for (const link of profile.links) {
      if (link.label && link.url) {
        contact.push(`[${link.label}](${link.url})`);
      }
    }
  }
  if (contact.length) {
    sections.push(contact.join(' · '));
  }
  const bio = blocksToMarkdown(profile?.bio ?? null);
  if (bio) {
    sections.push(bio);
  }
  if (profile?.resumeNote) {
    sections.push(profile.resumeNote);
  }

  if (experience.length) {
    sections.push(
      joinMarkdown([
        '## Experience',
        experience.map((role) => experienceRoleMarkdown(role)).join('\n\n'),
      ]),
    );
  }

  if (projects.length) {
    sections.push(
      joinMarkdown([
        '## Projects',
        projects.map((project) => projectMarkdown(project)).join('\n\n'),
      ]),
    );
  }

  if (skills.length) {
    sections.push(
      joinMarkdown([
        '## Skills',
        skills
          .map((group) => {
            const title = group.title ?? 'Skills';
            return `**${title}:** ${group.items?.join(', ') ?? ''}`;
          })
          .join('\n'),
      ]),
    );
  }

  if (education.length) {
    sections.push(
      joinMarkdown([
        '## Education',
        education
          .map((entry) => {
            const degree = entry.degree ?? '';
            const school = entry.institution ?? '';
            const years =
              entry.startYear && entry.endYear
                ? `${entry.startYear} – ${entry.endYear}`
                : '';
            const score = entry.score ? ` (${entry.score})` : '';
            return `- ${degree}, ${school} ${years}${score}`.trim();
          })
          .join('\n'),
      ]),
    );
  }

  return joinMarkdown(sections);
}

async function toLabMarkdown(): Promise<string> {
  const list = experiments
    .map(
      (experiment) =>
        `- [${experiment.title}](${siteConfig.url}/lab/${experiment.slug}) - ${experiment.summary}`,
    )
    .join('\n');
  return joinMarkdown(['# Lab', labIntro, list]);
}

function toExperimentMarkdown(experiment: Experiment): string {
  return joinMarkdown([
    `# ${experiment.title}`,
    experiment.summary,
    experiment.notes,
    `The piece itself is interactive WebGL: [open it in a browser](${siteConfig.url}/lab/${experiment.slug}).`,
  ]);
}

const markdownBySlug: Record<
  Exclude<MarkdownSlug, `lab/${string}`>,
  () => Promise<string>
> = {
  index: toHomeMarkdown,
  work: toWorkMarkdown,
  projects: toProjectsMarkdown,
  now: toNowMarkdown,
  changelog: toChangelogMarkdown,
  resume: toResumeMarkdown,
  lab: toLabMarkdown,
};

export async function getMarkdownForSlug(
  slug: string,
): Promise<string | null> {
  if (!isMarkdownSlug(slug)) {
    return null;
  }
  if (isExperimentPage(slug)) {
    const experiment = getExperiment(slug.slice('lab/'.length));
    return experiment ? toExperimentMarkdown(experiment) : null;
  }
  return markdownBySlug[slug]();
}

export function buildLlmsTxt(profileHeadline: string | null): string {
  const lines = [
    `# ${siteConfig.name}`,
    `> ${profileHeadline ?? 'Software engineer. Work, projects and notes.'}`,
    '',
    '## Pages',
  ];

  for (const page of sitePages) {
    lines.push(
      `- [${page.title}](${siteConfig.url}${page.path === '/' ? '' : page.path}) (markdown: [${page.mdPath}](${siteConfig.url}${page.mdPath}))`,
    );
  }

  return `${lines.join('\n')}\n`;
}
