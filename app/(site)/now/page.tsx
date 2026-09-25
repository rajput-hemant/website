import type { Metadata } from "next";
import Link from "next/link";

import { getNow } from "@/lib/data";
import { NowList } from "@/components/now/now-list";
import { UpdatedAgo } from "@/components/now/updated-ago";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { ExternalLink } from "@/components/ui/external-link";

const description = "What I'm focused on at this point in my life.";

export const metadata: Metadata = {
  title: "Now",
  description,
  alternates: { canonical: "/now" },
};

const fullDate = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function NowPage() {
  const now = await getNow();
  const updatedAt = fullDate.format(new Date(`${now.updatedAt}T00:00:00Z`));

  return (
    <Container>
      <PageHeader
        title="Now"
        description={description}
        meta={
          <p className="flex flex-wrap gap-x-2.5 gap-y-1">
            <span>
              As of <time dateTime={now.updatedAt}>{updatedAt}</time>
            </span>
            <UpdatedAgo date={now.updatedAt} />
          </p>
        }
      />

      <Section aria-label="Current focus" className="pt-0">
        <NowList items={now.items} />
      </Section>

      <Section aria-labelledby="about-now">
        <h2 id="about-now" className="meta text-subtle">
          About this page
        </h2>
        <p className="mt-4 max-w-[56ch] text-muted">
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
