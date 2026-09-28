import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AskPagination } from "@/flavors/timetable/components/ask/ask-pagination";
import { ChatFeed } from "@/flavors/timetable/components/ask/chat-feed";
import { Page } from "@/flavors/timetable/components/site";
import { Container, PageHeader } from "@/flavors/timetable/components/ui";

import {
  askListMetadata,
  askListStaticParams,
  resolveAskPage,
} from "@/lib/ask/pages/load";
import { ASK_PAGE_SIZE } from "@/lib/ask/pages/pagination";
import { getQuestions } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

/**
 * Pages 2..N are prerendered. A page that only exists after new entries are
 * published is rendered on its first request and then cached like the rest,
 * so pagination grows without a rebuild; out-of-range numbers 404.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return askListStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/f/timetable/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/timetable/ask/page/[page]">) {
  const resolved = await resolveAskPage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items, total } = await getQuestions({
    page,
    pageSize: ASK_PAGE_SIZE,
  });

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          platform="6"
          kicker="Information desk"
          title="Earlier notices"
          lede={
            <>
              Older conversations, latest activity first. Something to say?{" "}
              <Link
                href="/ask"
                className="underline decoration-2 underline-offset-[0.2em]"
              >
                Ask at the desk
              </Link>
              .
            </>
          }
          meta={[{ label: "Page", value: `${page} of ${pageCount}` }]}
          scene={null}
        />
        <Container className="mt-12">
          <ChatFeed
            threads={items}
            startNumber={total - (page - 1) * ASK_PAGE_SIZE}
          />
          <AskPagination page={page} pageCount={pageCount} className="mt-10" />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
