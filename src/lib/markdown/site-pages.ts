import { siteConfig } from '~/content/site';

export type MarkdownSlug =
  | 'index'
  | 'work'
  | 'projects'
  | 'now'
  | 'changelog'
  | 'resume';

export type SitePage = {
  slug: MarkdownSlug;
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
];

export function pageUrl(path: SitePage['path']): string {
  if (path === '/') {
    return siteConfig.url;
  }
  return `${siteConfig.url}${path}`;
}

export function markdownUrl(mdPath: SitePage['mdPath']): string {
  return `${siteConfig.url}${mdPath}`;
}

export function isMarkdownSlug(value: string): value is MarkdownSlug {
  return sitePages.some((page) => page.slug === value);
}
