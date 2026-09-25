import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getQuestions } from "@/lib/data";
import { AskPagination } from "@/components/ask/ask-pagination";
import { ChatFeed } from "@/components/ask/chat-feed";
import { OwnerProvider } from "@/components/ask/owner-provider";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";

import { askMetadata } from "../../_lib/metadata";
import {
  ASK_PAGE_SIZE,
  askPageCount,
  parseAskPage,
} from "../../_lib/pagination";

type AskListPageProps = { params: Promise<{ page: string }> };

/**
 * Pages 2..N are prerendered. A page that only exists after new entries are
 * published is rendered on its first request and then cached like the rest,
 * so pagination grows without a rebuild; out-of-range numbers 404.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  const { total } = await getQuestions({ page: 1, pageSize: ASK_PAGE_SIZE });
  return Array.from({ length: askPageCount(total) - 1 }, (_, index) => ({
    page: String(index + 2),
  }));
}

/** The page number if it exists, checked against the (cached) first-page total before any other fetch. */
async function resolvePage(segment: string) {
  const page = parseAskPage(segment);
  if (page === null) return null;
  const { total } = await getQuestions({ page: 1, pageSize: ASK_PAGE_SIZE });
  const pageCount = askPageCount(total);
  return page <= pageCount ? { page, pageCount } : null;
}

export async function generateMetadata({
  params,
}: AskListPageProps): Promise<Metadata> {
  const resolved = await resolvePage((await params).page);
  if (!resolved) return {};
  return askMetadata({
    title: `Ask · Page ${resolved.page}`,
    description: `Earlier conversations, page ${resolved.page} of ${resolved.pageCount}.`,
    path: `/ask/page/${resolved.page}`,
  });
}

export default async function AskListPage({ params }: AskListPageProps) {
  const resolved = await resolvePage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items } = await getQuestions({ page, pageSize: ASK_PAGE_SIZE });

  return (
    <OwnerProvider>
      <Container>
        <PageHeader
          title="Earlier conversations"
          description={
            <>
              Older threads, latest activity first. Have something to say?{" "}
              <Link href="/ask" className="link text-foreground">
                Start a conversation
              </Link>
              .
            </>
          }
          meta={`Page ${page} of ${pageCount}`}
        />
        <Section className="pt-0">
          <ChatFeed threads={items} />
          <AskPagination page={page} pageCount={pageCount} className="mt-10" />
        </Section>
      </Container>
    </OwnerProvider>
  );
}
