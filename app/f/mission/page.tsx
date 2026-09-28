import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/flavors/mission/components/home/hero";
import { StatusReport } from "@/flavors/mission/components/home/status-report";
import { Manifest } from "@/flavors/mission/components/projects/manifest";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { SectionHead } from "@/flavors/mission/components/ui/section-head";
import { flightPlan } from "@/flavors/mission/lib/flight";

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

/** The crew profile with both figures, four missions, then the latest status report. */
export default async function HomePage() {
  const [profile, experience, projects, now, questions] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getNow(),
    getQuestions({ page: 1, pageSize: 1 }),
  ]);
  const flight = flightPlan(experience, projects, new Date());
  const selected = projects.filter((p) => p.featured).slice(0, SELECTED);

  return (
    <Page>
      <Hero profile={profile} flight={flight} />

      <Container
        as="section"
        aria-labelledby="missions-heading"
        className="mt-section"
      >
        <SectionHead
          id="missions-heading"
          number="2.0"
          title="Missions"
          aside={
            <>
              {projects.length} flown · {selected.length} shown
              <br />
              Patch orbits = technologies aboard
            </>
          }
        />
        <Manifest projects={selected} all={projects} className="mt-12" />
        <p className="mt-10 border-t border-rule pt-4">
          <Link
            href="/projects"
            className="rule-link inline-flex min-h-11 items-center font-display font-bold"
          >
            The full manifest, all {projects.length} missions
          </Link>
        </p>
      </Container>

      <Container className="mt-section">
        <StatusReport now={now} question={questions.items[0] ?? null} />
      </Container>
    </Page>
  );
}
