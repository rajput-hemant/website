import Link from 'next/link';
import type { Metadata } from 'next';
import { Composer } from '~/components/ask/composer';
import { HeldQuestions } from '~/components/ask/held';
import { When } from '~/components/ask/parts';
import { ViewerProvider } from '~/components/ask/viewer';
import { Footer } from '~/components/site/footer';
import { getSignInOptions } from '~/lib/ask/auth-options';
import { displayName } from '~/lib/ask/display';
import { getThreadPage } from '~/lib/data/ask';

export const metadata: Metadata = {
  title: 'Ask',
  description:
    'Ask me anything, or just say hi. Questions and replies are public.',
};

export default async function AskPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { page: pageParam } = await searchParams;
  const requested = Number(typeof pageParam === 'string' ? pageParam : 1);
  const { threads, page, pageCount } = await getThreadPage(
    Number.isInteger(requested) && requested > 0 ? requested : 1,
  );

  return (
    <>
      <main className="flex flex-col gap-12">
        <div className="flex flex-col gap-3">
          <h1>Ask me anything, or just say hi.</h1>
          <p className="text-fg-muted">
            Questions are public. Signed-in posts appear right away; anonymous
            ones show up once I have reviewed them.
          </p>
        </div>

        <ViewerProvider>
          <Composer providers={getSignInOptions()} />

          <section
            aria-labelledby="questions-title"
            className="border-rule flex flex-col gap-6 border-t pt-7"
          >
            <h2 id="questions-title">Questions</h2>
            <HeldQuestions />
            {threads.length ? (
              <ol className="flex flex-col gap-6">
                {threads.map((thread) => (
                  <li key={thread.id}>
                    <Link
                      href={`/ask/${thread.slug}`}
                      className="hover:text-accent line-clamp-2"
                    >
                      {thread.excerpt ?? 'Message deleted'}
                    </Link>
                    <p className="text-fg-muted mt-1 font-mono text-xs">
                      {displayName(thread.author)} ·{' '}
                      <When iso={thread.createdAt} /> ·{' '}
                      {thread.replyCount === 1
                        ? '1 reply'
                        : `${thread.replyCount} replies`}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-fg-muted">No questions yet. Be the first.</p>
            )}
            {pageCount > 1 ? (
              <nav aria-label="Pagination" className="flex text-sm">
                {page > 1 ? (
                  <Link
                    href={page === 2 ? '/ask' : `/ask?page=${page - 1}`}
                    className="quiet-link"
                  >
                    <span aria-hidden="true">←</span> Newer
                  </Link>
                ) : null}
                {page < pageCount ? (
                  <Link
                    href={`/ask?page=${page + 1}`}
                    className="quiet-link ml-auto"
                  >
                    Older <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </section>
        </ViewerProvider>
      </main>
      <Footer path="/ask" />
    </>
  );
}
