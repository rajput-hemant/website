import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getQuestions } from "@/lib/data";
import { AskPagination } from "@/components/ask/ask-pagination";
import { ChatFeed } from "@/components/ask/chat-feed";
import { OwnerProvider } from "@/components/ask/owner-provider";
import { Page } from "@/components/site";
import { Container, PageHeader, Section } from "@/components/ui";

import { askMetadata } from "../../_lib/metadata";
import {
  ASK_PAGE_SIZE,
  askPageCount,
  parseAskPage,
} from "../../_lib/pagination";

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
}: PageProps<"/ask/page/[page]">): Promise<Metadata> {
  const resolved = await resolvePage((await params).page);
  if (!resolved) return {};
  return askMetadata({
    title: `Ask · Page ${resolved.page}`,
    description: `Earlier conversations, page ${resolved.page} of ${resolved.pageCount}.`,
    path: `/ask/page/${resolved.page}`,
  });
}

export default async function AskListPage({
  params,
}: PageProps<"/ask/page/[page]">) {
  const resolved = await resolvePage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items, total } = await getQuestions({
    page,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <Page>
      <OwnerProvider>
        <Container>
          <PageHeader
            sheet="06"
            eyebrow="RFI log"
            title="Earlier conversations"
            lede={
              <>
                Older threads, latest activity first. Have something to say?{" "}
                <Link
                  href="/ask"
                  className="text-ink underline underline-offset-2"
                >
                  Submit an RFI
                </Link>
                .
              </>
            }
            meta={[{ label: "Drawer", value: `${page} of ${pageCount}` }]}
          />
          <Section className="pt-0">
            <ChatFeed
              threads={items}
              startNumber={total - (page - 1) * ASK_PAGE_SIZE}
            />
            <AskPagination
              page={page}
              pageCount={pageCount}
              className="mt-10"
            />
          </Section>
        </Container>
      </OwnerProvider>
    </Page>
  );
}
