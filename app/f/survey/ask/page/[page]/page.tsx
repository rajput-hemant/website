import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AskPagination } from "@/flavors/survey/components/ask/ask-pagination";
import { ChatFeed } from "@/flavors/survey/components/ask/chat-feed";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";

import {
  askListMetadata,
  askListStaticParams,
  resolveAskPage,
} from "@/lib/ask/pages/load";
import { ASK_PAGE_SIZE } from "@/lib/ask/pages/pagination";
import { getQuestions } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

/** Pages 2..N are prerendered; later pages render on first request, then cache. */
export const dynamicParams = true;

export function generateStaticParams() {
  return askListStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/f/survey/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/survey/ask/page/[page]">) {
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
          kicker="Field notebook"
          title="Earlier entries"
          lede={
            <>
              Older conversations, latest activity first. Something to say?{" "}
              <Link
                href="/ask"
                className="underline decoration-contour underline-offset-[0.35em]"
              >
                Write in the notebook
              </Link>
              .
            </>
          }
          meta={[{ label: "Leaf", value: `${page} of ${pageCount}` }]}
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
