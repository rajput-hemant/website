import type { Metadata } from "next";
import { Hero } from "@/flavors/survey/components/home/hero";
import { Revisions } from "@/flavors/survey/components/home/revisions";
import { Summits } from "@/flavors/survey/components/home/summits";
import { Gazetteer } from "@/flavors/survey/components/projects/gazetteer";
import { Page } from "@/flavors/survey/components/site/page";
import { ArrowLink } from "@/flavors/survey/components/ui/arrow-link";
import { Section } from "@/flavors/survey/components/ui/section";
import { isoMonth } from "@/flavors/survey/lib/relief";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { site } from "@/content/site";
import {
  getChangelog,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
} from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const SELECTED = 4;

export default async function HomePage() {
  const [profile, experience, projects, now, changelog, questions, relief] =
    await Promise.all([
      getProfile(),
      getExperience(),
      getProjects(),
      getNow(),
      getChangelog(),
      getQuestions({ page: 1, pageSize: 1 }),
      getRelief(),
    ]);
  const selected = projects.filter((p) => p.featured).slice(0, SELECTED);
  const { peak } = relief;

  return (
    <Page>
      <Hero profile={profile} relief={relief} projectCount={projects.length} />

      <Section
        id="summits"
        kicker="Employment · rows 05 to 09"
        title="Summits"
        aside={`${peak.count} roles ran at once from ${formatMonthYear(isoMonth(peak.month))}`}
      >
        <Summits relief={relief} experience={experience} />
        <ArrowLink href="/work" className="mt-4">
          Walk every transect
        </ArrowLink>
      </Section>

      <Section
        id="gazetteer"
        kicker="Own work · rows 00 to 04"
        title="Gazetteer"
        aside={`Selected sites, ${selected.length} of ${projects.length} surveyed, in grid order`}
      >
        <Gazetteer relief={relief} projects={selected} />
        <ArrowLink href="/projects" className="mt-4">
          All {projects.length} sites
        </ArrowLink>
      </Section>

      <Section id="revisions" kicker="This edition" title="Revision notes">
        <Revisions
          now={now}
          log={changelog.slice(0, 4)}
          question={questions.items[0] ?? null}
          total={questions.total}
        />
      </Section>
    </Page>
  );
}
