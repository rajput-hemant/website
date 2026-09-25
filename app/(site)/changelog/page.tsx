import type { Metadata } from "next";

import { getChangelog } from "@/lib/data";
import { ChangelogYear } from "@/components/changelog/changelog-year";
import { groupByYear } from "@/components/changelog/group-by-year";
import { YearIndex } from "@/components/changelog/year-index";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

const description =
  "A running log of what changed: work, projects, this site, and the odd bit of life.";

export const metadata: Metadata = {
  title: "Changelog",
  description,
  alternates: { canonical: "/changelog" },
};

export default async function ChangelogPage() {
  const entries = await getChangelog();
  const years = groupByYear(entries);
  const oldest = years.at(-1)?.year;

  return (
    <Container>
      <PageHeader
        title="Changelog"
        description={description}
        meta={[
          `${entries.length} ${entries.length === 1 ? "entry" : "entries"}`,
          oldest && `since ${oldest}`,
        ]
          .filter(Boolean)
          .join(" · ")}
        className="pb-8 sm:pb-10"
      />
      <YearIndex years={years} />
      <div className="mt-10 grid gap-6">
        {years.map((group) => (
          <ChangelogYear key={group.year} {...group} />
        ))}
      </div>
    </Container>
  );
}
