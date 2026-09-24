import type { MetadataRoute } from 'next';
import { siteConfig } from '~/content/site';
import { sitePages } from '~/lib/markdown/site-pages';

export default function sitemap(): MetadataRoute.Sitemap {
  return sitePages.map((page) => ({
    url: page.path === '/' ? siteConfig.url : `${siteConfig.url}${page.path}`,
    changeFrequency: page.slug === 'changelog' ? 'weekly' : 'monthly',
    priority: page.slug === 'index' ? 1 : 0.8,
  }));
}
