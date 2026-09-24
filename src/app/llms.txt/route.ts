import { getProfile } from '~/lib/data';
import { buildLlmsTxt } from '~/lib/markdown/pages';

export async function GET() {
  const profile = await getProfile();
  const body = buildLlmsTxt(profile?.headline ?? null);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
