import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isMarkdownSlug } from '~/lib/markdown/site-pages';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.endsWith('.md')) {
    return NextResponse.next();
  }

  const slug =
    pathname === '/index.md' ? 'index' : pathname.slice(1, -'.md'.length);

  if (!isMarkdownSlug(slug)) {
    return NextResponse.next();
  }

  return NextResponse.rewrite(new URL(`/md/${slug}`, request.url));
}

export const config = {
  matcher: ['/index.md', '/:slug.md', '/lab/:slug.md', '/ask/:slug.md'],
};
