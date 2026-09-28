import type { Metadata } from "next";
import Link from "next/link";
import { posters } from "@/flavors/jacquard/components/lab/experiments";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import { buildDraft, pad2 } from "@/flavors/jacquard/lib/weave";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata(page);

/** Trial pieces: each experiment runs on its own page; the index shows static posters only. */
export default async function LabPage() {
  const projects = await getProjects();
  return (
    <Page>
      <PageHeader
        card={4}
        kicker="Trial pieces"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "On the loom", value: `${labExperiments.length} trials` },
        ]}
        scene={{
          route: "lab",
          weave: draftWeave(buildDraft(projects)),
          caption: "The cloth hangs loose here: a trial, not a finished piece.",
        }}
      />
      <Container className="mt-section">
        <ul className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => {
            const Poster = posters[experiment.slug];
            return (
              <li key={experiment.slug}>
                <Link href={`/lab/${experiment.slug}`} className="group block">
                  <div className="aspect-video overflow-hidden rounded-[3px] bg-panel shadow-card transition-transform duration-300 ease-out motion:fine:group-hover:-translate-y-1">
                    <Poster />
                  </div>
                  <p className="mt-6 flex items-center justify-between gap-3 label">
                    <span>
                      Trial {pad2(i + 1)} · {experiment.year}
                    </span>
                    <span>{labStatusLabels[experiment.status]}</span>
                  </p>
                  <h2 className="mt-2 text-h3 transition-colors duration-(--duration-ui) ease-out fine:group-hover:text-madder">
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
