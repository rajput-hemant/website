import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getQuestions } from "@/lib/data";
import { AskPagination } from "@/components/ask/ask-pagination";
import { QuestionList } from "@/components/ask/question-list";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";

import { askFeedAlternates } from "../../_lib/metadata";
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
  return {
    title: `Ask · Page ${resolved.page}`,
    description: `Answered messages, page ${resolved.page} of ${resolved.pageCount}.`,
    alternates: {
      canonical: `/ask/page/${resolved.page}`,
      types: askFeedAlternates,
    },
  };
}

export default async function AskListPage({ params }: AskListPageProps) {
  const resolved = await resolvePage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items } = await getQuestions({ page, pageSize: ASK_PAGE_SIZE });

  return (
    <Container>
      <PageHeader
        title="From the inbox"
        description={
          <>
            Earlier answered messages. Have one of your own?{" "}
            <Link href="/ask" className="link text-foreground">
              Ask me anything
            </Link>
            .
          </>
        }
        meta={`Page ${page} of ${pageCount}`}
      />
      <Section className="pt-0">
        <QuestionList questions={items} />
        <AskPagination page={page} pageCount={pageCount} className="mt-10" />
      </Section>
    </Container>
  );
}
