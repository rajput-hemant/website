import { experiments, type ExperimentSlug } from '~/content/lab';

export type StaticMarkdownSlug =
  | 'index'
  | 'work'
  | 'projects'
  | 'now'
  | 'changelog'
  | 'resume'
  | 'lab'
  | `lab/${ExperimentSlug}`
  | 'ask';

export type AskThreadMarkdownSlug = `ask/${string}`;

export type MarkdownSlug = StaticMarkdownSlug | AskThreadMarkdownSlug;

export type SitePage = {
  slug: StaticMarkdownSlug;
  path: `/${string}` | '/';
  title: string;
  mdPath: `/${string}`;
};

export const sitePages: SitePage[] = [
  { slug: 'index', path: '/', title: 'Home', mdPath: '/index.md' },
  { slug: 'work', path: '/work', title: 'Work', mdPath: '/work.md' },
  {
    slug: 'projects',
    path: '/projects',
    title: 'Projects',
    mdPath: '/projects.md',
  },
  { slug: 'now', path: '/now', title: 'Now', mdPath: '/now.md' },
  {
    slug: 'changelog',
    path: '/changelog',
    title: 'Changelog',
    mdPath: '/changelog.md',
  },
  { slug: 'resume', path: '/resume', title: 'Resume', mdPath: '/resume.md' },
  { slug: 'lab', path: '/lab', title: 'Lab', mdPath: '/lab.md' },
  ...experiments.map(({ slug, title }): SitePage => ({
    slug: `lab/${slug}`,
    path: `/lab/${slug}`,
    title,
    mdPath: `/lab/${slug}.md`,
  })),
  { slug: 'ask', path: '/ask', title: 'Ask', mdPath: '/ask.md' },
];

export function isStaticMarkdownSlug(
  value: string,
): value is StaticMarkdownSlug {
  return sitePages.some((page) => page.slug === value);
}

export function isExperimentPage(
  slug: StaticMarkdownSlug,
): slug is `lab/${ExperimentSlug}` {
  return slug.startsWith('lab/');
}

export function isAskThreadMarkdownSlug(
  value: string,
): value is AskThreadMarkdownSlug {
  return /^ask\/[0-9a-f]{8}$/.test(value);
}

export function isMarkdownSlug(value: string): value is MarkdownSlug {
  return isStaticMarkdownSlug(value) || isAskThreadMarkdownSlug(value);
}
