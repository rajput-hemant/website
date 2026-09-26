import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Feed } from "@/flavors/press/components/ask/feed";
import { Pagination } from "@/flavors/press/components/ask/pagination";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";

import {
  askListMetadata,
  askListStaticParams,
  resolveAskPage,
} from "@/lib/ask/pages/load";
import { ASK_PAGE_SIZE } from "@/lib/ask/pages/pagination";
import { getQuestions } from "@/lib/data";
import { OwnerProvider } from "@/components/semantic/ask/owner-provider";

/** Pages 2..N are prerendered; a page that appears later renders on first request. */
export const dynamicParams = true;

export function generateStaticParams() {
  return askListStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps<"/f/press/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/press/ask/page/[page]">) {
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
          sheet={7}
          kicker="Corrections sheet"
          title="Earlier queries"
          lede={
            <>
              Older threads, latest activity first. Something to say?{" "}
              <Link
                href="/ask"
                className="underline decoration-pink decoration-2 underline-offset-[0.2em]"
              >
                Send a query
              </Link>
              .
            </>
          }
          meta={[{ label: "Sheet", value: `${page} of ${pageCount}` }]}
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
