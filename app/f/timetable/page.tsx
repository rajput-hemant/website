import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/flavors/timetable/components/home/hero";
import { ServiceUpdates } from "@/flavors/timetable/components/home/service-updates";
import { NetworkSection } from "@/flavors/timetable/components/network/network-section";
import {
  DepartureBoard,
  DepartureLegend,
} from "@/flavors/timetable/components/projects/departure-board";
import { Page } from "@/flavors/timetable/components/site/page";
import { Container, SectionHead } from "@/flavors/timetable/components/ui";
import { buildNetwork } from "@/flavors/timetable/lib/network";

import { site } from "@/content/site";
import {
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const SELECTED = 4;

export default async function HomePage() {
  const [profile, experience, projects, now, questions] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getNow(),
    getQuestions({ page: 1, pageSize: 1 }),
  ]);
  const network = buildNetwork(experience);
  const selected = projects.filter((p) => p.featured).slice(0, SELECTED);
  const current = experience.find((role) => !role.endDate);

  return (
    <Page>
      <Hero profile={profile} current={current} />
      <Container className="grid gap-section pt-[clamp(3.5rem,2rem+4vw,6rem)]">
        <NetworkSection network={network} />

        <section aria-labelledby="departures-heading">
          <SectionHead
            id="departures-heading"
            platform="1"
            kicker="Departures"
            title="Selected projects"
            aside={
              <Link
                href="/projects"
                className="inline-flex min-h-11 items-center gap-2 border-b-2 border-current text-base leading-none font-bold text-ink"
              >
                All {projects.length} departures <span aria-hidden>→</span>
              </Link>
            }
          />
          <DepartureBoard
            className="mt-9"
            title="Departures by year started"
            projects={selected}
            total={projects.length}
            more={{
              href: "/projects",
              label: `${projects.length - selected.length} more departures on the full board`,
            }}
          />
          <DepartureLegend className="mt-5" />
        </section>

        <ServiceUpdates now={now} question={questions.items[0] ?? null} />
      </Container>
    </Page>
  );
}
