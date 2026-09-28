import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Feed } from "@/flavors/maquette/components/ask/feed";
import { Pagination } from "@/flavors/maquette/components/ask/pagination";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";

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
}: PageProps<"/f/maquette/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/maquette/ask/page/[page]">) {
  const resolved = await resolveAskPage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items, total } = await loadAskList(page);

  return (
    <Page>
      <OwnerProvider>
        <PageHeader
          frame="06"
          kicker="Comment cards"
          title="Earlier questions"
          lede={
            <>
              Older threads, latest activity first. Something to say?{" "}
              <Link
                href="/ask"
                className="underline decoration-cut underline-offset-[0.2em]"
              >
                Ask a question
              </Link>
              .
            </>
          }
          meta={[{ label: "Board", value: `${page} of ${pageCount}` }]}
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
