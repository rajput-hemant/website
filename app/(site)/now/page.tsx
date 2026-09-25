import type { Metadata } from "next";
import Link from "next/link";

import { sitePage } from "@/content/site";
import { getNow } from "@/lib/data";
import { formatDate, toDateTime } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { NowList } from "@/components/now/now-list";
import { UpdatedAgo } from "@/components/now/updated-ago";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Disclosure } from "@/components/ui/disclosure";
import { ExternalLink } from "@/components/ui/external-link";

const page = sitePage("/now");

export const metadata: Metadata = pageMetadata(page);

export default async function NowPage() {
  const now = await getNow();

  return (
    <Container>
      <PageHeader
        title={page.title}
        description={page.description}
        meta={
          <p className="flex flex-wrap gap-x-2.5 gap-y-1">
            <span>
              As of{" "}
              <time dateTime={toDateTime(now.updatedAt)}>
                {formatDate(now.updatedAt)}
              </time>
            </span>
            <UpdatedAgo date={now.updatedAt} />
          </p>
        }
      />

      <section aria-label="Current focus">
        <NowList items={now.items} />
      </section>

      <Disclosure
        id="about"
        summary="About this page"
        className="mt-8"
        summaryClassName="min-h-10 w-fit items-center text-sm text-muted transition-colors hover:text-foreground"
        contentClassName="pt-2 pl-5.5"
      >
        <p className="max-w-[56ch] text-muted">
          This is a now page: a snapshot of what has my attention, rather than
          everything I have ever done. The idea comes from Derek Sivers, and you
          can find hundreds more at{" "}
          <ExternalLink href="https://nownownow.com/about">
            nownownow.com
          </ExternalLink>
          . For what came before, see the{" "}
          <Link href="/changelog" className="link">
            changelog
          </Link>
          .
        </p>
      </Disclosure>
    </Container>
  );
}
