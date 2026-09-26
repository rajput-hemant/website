import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getChangelog } from "@/lib/data";
import { groupByYear } from "@/lib/data/group-by-year";
import { pageMetadata } from "@/lib/metadata";
import {
  ChangelogYear,
  entriesLabel,
} from "@/components/changelog/changelog-year";
import { YearIndex } from "@/components/changelog/year-index";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

const page = sitePage("/changelog");

export const metadata: Metadata = pageMetadata(page);

export default async function ChangelogPage() {
  const entries = await getChangelog();
  const years = groupByYear(entries);
  const oldest = years.at(-1)?.year;

  return (
    <Container>
      <PageHeader
        title={page.title}
        description={page.description}
        meta={[entriesLabel(entries.length), oldest && `since ${oldest}`]
          .filter(Boolean)
          .join(" · ")}
      />
      <div className="relative">
        {years.length > 1 && (
          <div className="absolute inset-y-0 right-full mr-8 hidden lg:block">
            <YearIndex
              years={years}
              className="sticky top-[calc(var(--header-h)+1rem)]"
            />
          </div>
        )}
        <div className="stagger border-t border-hairline">
          {years.map((group, index) => (
            <ChangelogYear
              key={group.year}
              {...group}
              defaultOpen={index === 0}
            />
          ))}
        </div>
      </div>
    </Container>
  );
}
