import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AskPagination } from "@/flavors/surface/components/ask/ask-pagination";
import { ChatFeed } from "@/flavors/surface/components/ask/chat-feed";
import { threadKnob } from "@/flavors/surface/components/ask/thread-knob";
import { Panel } from "@/flavors/surface/components/site/panel";

import {
  askListMetadata,
  askListStaticParams,
  loadAskList,
  resolveAskPage,
} from "@/lib/ask/pages/load";
import { ASK_PAGE_SIZE } from "@/lib/ask/pages/pagination";
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
}: PageProps<"/f/surface/ask/page/[page]">): Promise<Metadata> {
  return askListMetadata((await params).page);
}

export default async function AskListPage({
  params,
}: PageProps<"/f/surface/ask/page/[page]">) {
  const resolved = await resolveAskPage((await params).page);
  if (!resolved) notFound();
  const { page, pageCount } = resolved;
  const { items, total } = await loadAskList(page);

  return (
    <OwnerProvider>
      <Panel
        ch="06"
        name="Ask"
        aside={`Page ${page} of ${pageCount}`}
        title="Earlier conversations"
        lede={
          <>
            Older threads, latest activity first. Have something to say?{" "}
            <Link href="/ask" className="underline underline-offset-2">
              Ask a question
            </Link>
            .
          </>
        }
        knob={threadKnob(items)}
      >
        <ChatFeed
          threads={items}
          startNumber={total - (page - 1) * ASK_PAGE_SIZE}
        />
        <AskPagination page={page} pageCount={pageCount} className="mt-10" />
      </Panel>
    </OwnerProvider>
  );
}
