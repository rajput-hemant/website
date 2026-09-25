import type { MetadataRoute } from 'next';
import { siteConfig } from '~/content/site';
import { getThreadIndex } from '~/lib/data/ask';
import { sitePages } from '~/lib/markdown/site-pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const threads = await getThreadIndex();
  return [
    ...sitePages.map((page) => ({
      url: page.path === '/' ? siteConfig.url : `${siteConfig.url}${page.path}`,
      changeFrequency:
        page.slug === 'changelog' || page.slug === 'ask'
          ? ('weekly' as const)
          : ('monthly' as const),
      priority: page.slug === 'index' ? 1 : 0.8,
    })),
    ...threads.map((thread) => ({
      url: `${siteConfig.url}/ask/${thread.slug}`,
      lastModified: thread.lastActivityAt,
    })),
  ];
}
