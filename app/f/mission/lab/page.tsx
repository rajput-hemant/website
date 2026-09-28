import type { Metadata } from "next";
import Link from "next/link";
import { posters } from "@/flavors/mission/components/lab/experiments";
import { Page } from "@/flavors/mission/components/site/page";
import { Container } from "@/flavors/mission/components/ui/container";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { flightPlan, pad2 } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { getExperience, getProjects } from "@/lib/data";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata(page);

/** Ground tests: each experiment runs on its own stand; the index shows static posters only. */
export default async function LabPage() {
  const [projects, experience] = await Promise.all([
    getProjects(),
    getExperience(),
  ]);
  return (
    <Page>
      <PageHeader
        section={4}
        kicker="Ground tests"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "On the stand", value: `${labExperiments.length} tests` },
        ]}
        scene={{
          route: "lab",
          board: boardFor(flightPlan(experience, projects, new Date())),
          caption: "Turned away from the launch site: these never flew.",
        }}
      />
      <Container className="mt-section">
        <ul className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => {
            const Poster = posters[experiment.slug];
            return (
              <li key={experiment.slug}>
                <Link href={`/lab/${experiment.slug}`} className="group block">
                  <div className="aspect-video overflow-hidden border border-rule-strong bg-panel transition-transform duration-300 ease-out motion:fine:group-hover:-translate-y-1">
                    <Poster />
                  </div>
                  <p className="mt-6 flex items-center justify-between gap-3 label">
                    <span>
                      GT-{pad2(i + 1)} · {experiment.year}
                    </span>
                    <span>{labStatusLabels[experiment.status]}</span>
                  </p>
                  <h2 className="mt-2 text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-signal">
                    {experiment.title}
                  </h2>
                  <p className="mt-2 text-[0.9375rem] leading-snug text-ink-soft">
                    {experiment.description}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Page>
  );
}
