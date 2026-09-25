import { getProfile } from '~/lib/data';
import { getThreadIndex } from '~/lib/data/ask';
import { buildLlmsTxt } from '~/lib/markdown/pages';

export async function GET() {
  const [profile, threads] = await Promise.all([
    getProfile(),
    getThreadIndex(),
  ]);
  const body = buildLlmsTxt(profile?.headline ?? null, threads);

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
