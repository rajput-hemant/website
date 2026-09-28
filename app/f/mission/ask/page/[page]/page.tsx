import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Feed } from "@/flavors/mission/components/ask/feed";
import { Pagination } from "@/flavors/mission/components/ask/pagination";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";

import {
  askListMetadata,
  askListStaticParams,
  loadAskList,
  resolveAskPage,
} from "@/lib/ask/pages/load";
import { ASK_PAGE_SIZE } from "@/lib/ask/pages/pagination";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

/** Pages 2..N are prerendered; a page that appears later renders on first request. */
export const dynamicParams = true;

export function generateStaticParams() {
  return askListStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/f/mission/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/mission/ask/page/[page]">) {
  const resolved = await resolveAskPage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items, total } = await loadAskList(page);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          section={7}
          kicker="Capcom"
          title="Earlier transcripts"
          lede={
            <>
              Older threads, latest activity first. Something to ask?{" "}
              <Link href="/ask" className="rule-link">
                Open a channel
              </Link>
              .
            </>
          }
          meta={[{ label: "Page", value: `${page} of ${pageCount}` }]}
          scene={null}
        />
        <Container className="mt-12">
          <Feed
            threads={items}
            startNumber={total - (page - 1) * ASK_PAGE_SIZE}
          />
          <Pagination page={page} pageCount={pageCount} className="mt-10" />
        </Container>
      </OwnerProvider>
    </Page>
  );
}
