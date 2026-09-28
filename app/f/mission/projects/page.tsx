import type { Metadata } from "next";
import { Manifest } from "@/flavors/mission/components/projects/manifest";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import {
  byLaunch,
  flightPlan,
  missionState,
} from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { sitePage } from "@/content/site";
import { getExperience, getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The mission manifest: every project flown, newest launch first, each with its patch. */
export default async function ProjectsPage() {
  const [projects, experience] = await Promise.all([
    getProjects(),
    getExperience(),
  ]);
  const flight = flightPlan(experience, projects, new Date());
  const count = (state: string) =>
    projects.filter((p) => missionState[p.status] === state).length;
  const years = projects.flatMap((p) => (p.year === null ? [] : [p.year]));

  return (
    <Page>
      <PageHeader
        section={2}
        kicker="Missions"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Missions flown", value: String(projects.length) },
          ...(years.length
            ? [
                {
                  label: "First launch",
                  value: String(Math.min(...years)),
                },
              ]
            : []),
          {
            label: "Nominal",
            value: `${count("nominal") + count("operational")} maintained`,
            nominal: true,
          },
          { label: "In flight", value: `${count("inflight")} in progress` },
          { label: "Deorbited", value: `${count("deorbited")} archived` },
        ]}
        scene={{
          route: "projects",
          board: boardFor(flight),
          caption: "The phases these missions were flown alongside.",
        }}
      />
      <Container className="mt-section">
        <p className="mb-10 max-w-[62ch] text-[1.0625rem] text-ink-soft">
          Every project flies as a mission with its own patch. Each orbit on the
          patch is one technology aboard, up to five. A nominal mission keeps
          its craft on the outer orbit; one in flight is still drawing it, in
          red; a deorbited one decays in a spiral to the planet.
        </p>
        <Manifest projects={byLaunch(projects)} headingLevel="h2" />
      </Container>
    </Page>
  );
}
