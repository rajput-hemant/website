import { describe, expect, it, vi } from 'vitest';
import type {
  Changelog,
  Education,
  Experience,
  ExperienceRole,
  Now,
  Profile,
  Projects,
  Skills,
} from '~/lib/data';

const fixtures = vi.hoisted(() => {
  function paragraph(text: string, key: string) {
    return {
      _type: 'block' as const,
      _key: key,
      style: 'normal' as const,
      markDefs: [],
      children: [{ _type: 'span' as const, _key: `${key}-span`, text, marks: [] }],
    };
  }

  const profile: Profile = {
    _id: 'profile',
    name: 'Ada Lovelace',
    headline: 'Engineer',
    bio: [paragraph('Building things.', 'bio-1')],
    availability: 'Open to new roles',
    avatar: null,
    location: 'Remote',
    links: [{ _key: 'gh', label: 'GitHub', url: 'https://github.com/ada' }],
    resumeNote: null,
  };

  const successor: ExperienceRole = {
    _id: 'exp-2',
    company: 'Later Co',
    companyUrl: null,
    companyBlurb: null,
    title: 'Staff Engineer',
    location: 'Remote',
    remote: true,
    employmentType: 'Full-time',
    startDate: '2026-01-01',
    endDate: null,
    endNote: null,
    continuedInto: null,
    continuedFrom: {
      _id: 'exp-1',
      company: 'Earlier Co',
      title: 'Engineer',
      continuationNote: 'moved with the team',
    },
    continuationNote: null,
    body: [paragraph('Shipped things.', 'exp2-body')],
    highlights: null,
  };

  const predecessor: ExperienceRole = {
    _id: 'exp-1',
    company: 'Earlier Co',
    companyUrl: 'https://earlier.example',
    companyBlurb: 'A place',
    title: 'Engineer',
    location: 'Remote',
    remote: true,
    employmentType: 'Contract',
    startDate: '2024-06-01',
    endDate: '2025-12-01',
    endNote: null,
    continuedInto: { _id: 'exp-2', company: 'Later Co', title: 'Staff Engineer' },
    continuedFrom: null,
    continuationNote: 'moved with the team',
    body: [paragraph('Did things.', 'exp1-body')],
    highlights: ['Shipped X', 'Led Y'],
  };

  const experience: Experience = [successor, predecessor];

  const projects: Projects = [1, 2, 3, 4, 5].map((n) => ({
    _id: `project-${n}`,
    name: `Project ${n}`,
    slug: null,
    tagline: `Tagline ${n}`,
    description: [paragraph(`Description ${n}.`, `proj-${n}`)],
    stack: ['TypeScript'],
    github: `https://github.com/example/project-${n}`,
    live: null,
    featured: true,
    status: 'active',
    year: 2026,
    order: n,
  }));

  const now: Now = {
    _id: 'now',
    items: [{ _key: 'now-1', text: 'Building the site', link: null }],
    updatedAt: '2026-09-01',
  };

  const changelog: Changelog = [
    {
      _id: 'update-1',
      date: '2026-09-01',
      text: 'Shipped the rebuild.',
      category: 'site',
      link: null,
    },
    { _id: 'update-2', date: '2026-08-01', text: '', category: 'site', link: null },
  ];

  const skills: Skills = [
    { _id: 'skill-1', title: 'Languages', items: ['TypeScript', 'Go'], order: 1 },
  ];

  const education: Education = [
    {
      _id: 'edu-1',
      institution: 'State University',
      degree: 'B.Sc Computer Science',
      location: 'Remote',
      startYear: 2018,
      endYear: 2022,
      score: '3.9 GPA',
      order: 1,
    },
  ];

  return { profile, experience, projects, now, changelog, skills, education };
});

vi.mock('server-only', () => ({}));

vi.mock('~/lib/data', () => ({
  getProfile: async (): Promise<Profile> => fixtures.profile,
  getExperience: async (): Promise<Experience> => fixtures.experience,
  getProjects: async (): Promise<Projects> => fixtures.projects,
  getNow: async (): Promise<Now> => fixtures.now,
  getChangelog: async (): Promise<Changelog> => fixtures.changelog,
  getSkills: async (): Promise<Skills> => fixtures.skills,
  getEducation: async (): Promise<Education> => fixtures.education,
}));

const {
  buildLlmsTxt,
  getMarkdownForSlug,
  toChangelogMarkdown,
  toHomeMarkdown,
  toProjectsMarkdown,
  toResumeMarkdown,
  toWorkMarkdown,
} = await import('./pages');

describe('toWorkMarkdown', () => {
  it('describes continuation in both directions', async () => {
    const markdown = await toWorkMarkdown();
    expect(markdown.startsWith('# Work')).toBe(true);
    expect(markdown).toContain('*Continued from Earlier Co (Engineer).*');
    expect(markdown).toContain(
      '*Continued into Later Co (Staff Engineer). moved with the team*',
    );
  });

  it('renders skills and education from Sanity', async () => {
    const markdown = await toWorkMarkdown();
    expect(markdown).toContain('### Languages');
    expect(markdown).toContain('TypeScript, Go');
    expect(markdown).toContain('### B.Sc Computer Science, State University');
    expect(markdown).toContain('2018 – 2022 · Remote · 3.9 GPA');
  });

  it('renders highlights as a list', async () => {
    const markdown = await toWorkMarkdown();
    expect(markdown).toContain('- Shipped X\n- Led Y');
  });
});

describe('toHomeMarkdown', () => {
  it('caps selected projects to the 4 most recently featured', async () => {
    const markdown = await toHomeMarkdown();
    expect(markdown).toContain('Tagline 1');
    expect(markdown).toContain('Tagline 4');
    expect(markdown).not.toContain('Tagline 5');
  });

  it('includes the Now teaser and a link to the full page', async () => {
    const markdown = await toHomeMarkdown();
    expect(markdown).toContain('Building the site');
    expect(markdown).toContain('[Full now page](https://rajputhemant.me/now)');
  });
});

describe('toProjectsMarkdown', () => {
  it('lists every project, unlike the home page teaser', async () => {
    const markdown = await toProjectsMarkdown();
    for (let n = 1; n <= 5; n += 1) {
      expect(markdown).toContain(`## Project ${n}`);
    }
  });
});

describe('toChangelogMarkdown', () => {
  it('filters out entries with no text', async () => {
    const markdown = await toChangelogMarkdown();
    expect(markdown).toBe(
      '# Changelog\n\n- **September 1, 2026** (site): Shipped the rebuild.',
    );
  });
});

describe('toResumeMarkdown', () => {
  it('includes profile, experience, skills and education', async () => {
    const markdown = await toResumeMarkdown();
    expect(markdown).toContain('**Ada Lovelace**');
    expect(markdown).toContain('## Experience');
    expect(markdown).toContain('**Languages:** TypeScript, Go');
    expect(markdown).toContain('- B.Sc Computer Science, State University 2018 – 2022 (3.9 GPA)');
  });
});

describe('getMarkdownForSlug', () => {
  it('dispatches a known slug to its page renderer', async () => {
    const markdown = await getMarkdownForSlug('work');
    expect(markdown?.startsWith('# Work')).toBe(true);
  });

  it('returns null for an unknown slug', async () => {
    expect(await getMarkdownForSlug('does-not-exist')).toBeNull();
  });
});

describe('buildLlmsTxt', () => {
  it('lists every page with its markdown mirror', () => {
    expect(buildLlmsTxt('Building things.')).toBe(
      [
        '# Hemant Rajput',
        '> Building things.',
        '',
        '## Pages',
        '- [Home](https://rajputhemant.me) (markdown: [/index.md](https://rajputhemant.me/index.md))',
        '- [Work](https://rajputhemant.me/work) (markdown: [/work.md](https://rajputhemant.me/work.md))',
        '- [Projects](https://rajputhemant.me/projects) (markdown: [/projects.md](https://rajputhemant.me/projects.md))',
        '- [Now](https://rajputhemant.me/now) (markdown: [/now.md](https://rajputhemant.me/now.md))',
        '- [Changelog](https://rajputhemant.me/changelog) (markdown: [/changelog.md](https://rajputhemant.me/changelog.md))',
        '- [Resume](https://rajputhemant.me/resume) (markdown: [/resume.md](https://rajputhemant.me/resume.md))',
        '',
      ].join('\n'),
    );
  });

  it('falls back to a default headline when none is given', () => {
    expect(buildLlmsTxt(null)).toContain(
      '> Software engineer. Work, projects and notes.',
    );
  });
});
