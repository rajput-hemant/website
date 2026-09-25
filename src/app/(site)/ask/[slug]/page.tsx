import { cache } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Composer } from '~/components/ask/composer';
import { HeldReplies } from '~/components/ask/held';
import { Message } from '~/components/ask/message';
import { ViewerProvider } from '~/components/ask/viewer';
import { Footer } from '~/components/site/footer';
import { getSignInOptions } from '~/lib/ask/auth-options';
import { excerpt } from '~/lib/ask/display';
import { getThread } from '~/lib/data/ask';

const loadThread = cache(getThread);

type ThreadPageProps = { params: Promise<{ slug: string }> };

function threadTitle(body: string | null | undefined) {
  return body ? excerpt(body, 70) : 'Question';
}

export async function generateMetadata({
  params,
}: ThreadPageProps): Promise<Metadata> {
  const thread = await loadThread((await params).slug);
  if (!thread) return {};
  const body = thread.messages[0]?.body;

  return {
    title: threadTitle(body),
    description: body ? excerpt(body, 160) : null,
  };
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { slug } = await params;
  const thread = await loadThread(slug);
  if (!thread) notFound();

  return (
    <>
      <main className="flex flex-col gap-8">
        <Link href="/ask" className="quiet-link self-start text-sm">
          <span aria-hidden="true">←</span> All questions
        </Link>
        <h1 className="sr-only">{threadTitle(thread.messages[0]?.body)}</h1>

        <ViewerProvider thread={thread.slug}>
          <ol className="flex flex-col gap-8">
            {thread.messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            <HeldReplies slug={thread.slug} />
          </ol>
          <div className="border-rule border-t pt-7">
            <Composer slug={thread.slug} providers={getSignInOptions()} />
          </div>
        </ViewerProvider>
      </main>
      <Footer path={`/ask/${thread.slug}`} />
    </>
  );
}
