import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AskPagination } from "@/flavors/minimal/components/ask/ask-pagination";
import { ChatFeed } from "@/flavors/minimal/components/ask/chat-feed";
import { Container } from "@/flavors/minimal/components/site/container";
import { PageHeader } from "@/flavors/minimal/components/site/page-header";
import { Section } from "@/flavors/minimal/components/site/section";

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
}: PageProps<"/f/minimal/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/minimal/ask/page/[page]">) {
  const resolved = await resolveAskPage((await params).page);
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
