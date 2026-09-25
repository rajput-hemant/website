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
import { Section } from "@/components/site/section";
import { ExternalLink } from "@/components/ui/external-link";
import { SectionHeading } from "@/components/ui/section-heading";

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

      <Section aria-label="Current focus" className="pt-0">
        <NowList items={now.items} />
      </Section>

      <Section aria-labelledby="about-now">
        <SectionHeading id="about-now" title="About this page" />
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
      </Section>
    </Container>
  );
}
