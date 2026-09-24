import { getMarkdownForSlug } from '~/lib/markdown/pages';

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await context.params;
  const key = slug.length === 0 ? 'index' : slug.join('/');
  const markdown = await getMarkdownForSlug(key);

  if (markdown === null) {
    return new Response('Not Found', { status: 404 });
  }

  return new Response(markdown, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
    },
  });
}
