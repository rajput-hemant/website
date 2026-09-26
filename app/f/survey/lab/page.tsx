import type { Metadata } from "next";
import Link from "next/link";
import { ExperimentPoster } from "@/flavors/survey/components/lab/poster";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

/** Field trials: each experiment runs on its own page; the index shows static posters. */
export default async function LabPage() {
  const relief = await getRelief();
  return (
    <Page>
      <PageHeader
        kicker="Field trials"
        title={page.title}
        lede={page.description}
        meta={[{ label: "Trials", value: String(labExperiments.length) }]}
        scene={{ relief, route: "lab" }}
      />
      <Container className="mt-section">
        <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => (
            <li key={experiment.slug}>
              <Link
                href={`/lab/${experiment.slug}`}
                data-tilt
                className="group block border border-rule-strong bg-sheet p-3 transition-colors duration-(--duration-ui) fine:hover:border-water"
              >
                <div className="tilt">
                  <div className="aspect-video overflow-hidden border border-rule">
                    <ExperimentPoster slug={experiment.slug} />
                  </div>
                  <div className="caps flex items-center justify-between gap-3 px-1 pt-4 text-ink-faint">
                    <span>
                      Trial {String(i + 1).padStart(2, "0")} · {experiment.year}
                    </span>
                    <span className="text-wood">
                      {labStatusLabels[experiment.status]}
                    </span>
                  </div>
                  <h2 className="spaced px-1 pt-2 text-lg tracking-[0.2em] transition-colors fine:group-hover:text-water">
                    {experiment.title}
                  </h2>
                  <p className="px-1 pt-1.5 pb-2 text-sm text-ink-soft">
                    {experiment.description}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Page>
  );
}
