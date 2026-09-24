import type { Metadata } from 'next';
import { Footer } from '~/components/site/footer';
import { getNow } from '~/lib/data';
import { formatDate } from '~/lib/format';

export const metadata: Metadata = {
  title: 'Now',
  description: 'What I am building and focused on at the moment.',
};

export default async function NowPage() {
  const now = await getNow();
  const items = now?.items ?? [];

  return (
    <>
      <main className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1>Now</h1>
          {now?.updatedAt ? (
            <p className="text-fg-muted font-mono text-xs">
              As of{' '}
              <time dateTime={now.updatedAt}>
                {formatDate(now.updatedAt, { dateStyle: 'long' })}
              </time>
            </p>
          ) : null}
        </div>
        {items.length > 0 ? (
          <div className="prose">
            <ul>
              {items.map((item) => (
                <li key={item._key}>
                  {item.link ? <a href={item.link}>{item.text}</a> : item.text}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-fg-muted">Nothing to report yet.</p>
        )}
      </main>
      <Footer path="/now" />
    </>
  );
}
