import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Feed } from "@/flavors/jacquard/components/ask/feed";
import { Pagination } from "@/flavors/jacquard/components/ask/pagination";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";

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
}: PageProps<"/f/jacquard/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/jacquard/ask/page/[page]">) {
  const resolved = await resolveAskPage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items, total } = await loadAskList(page);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          card={7}
          kicker="Sampler board"
          title="Earlier questions"
          lede={
            <>
              Older threads, latest activity first. Something to ask?{" "}
              <Link href="/ask" className="thread-link">
                Pin a question
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
