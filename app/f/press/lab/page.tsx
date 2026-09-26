import type { Metadata } from "next";
import Link from "next/link";
import { posters } from "@/flavors/press/components/lab/experiments";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { pad2 } from "@/flavors/press/lib/proof";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata(page);

/** Test sheets: each experiment runs on its own page; the index shows static posters only. */
export default function LabPage() {
  return (
    <Page>
      <PageHeader
        sheet={4}
        kicker="Test sheets"
        title={page.title}
        lede={page.description}
        meta={[{ label: "On the stone", value: String(labExperiments.length) }]}
        scene="lab"
      />
      <Container className="mt-section">
        <ul className="grid gap-12 px-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => {
            const Poster = posters[experiment.slug];
            return (
              <li key={experiment.slug}>
                <Link
                  href={`/lab/${experiment.slug}`}
                  data-tilt
                  data-cursor="Run the test"
                  className="registers crop-marks group block"
                >
                  <div className="tilt bg-sheet p-3 shadow-sheet">
                    <div className="aspect-video overflow-hidden">
                      <Poster />
                    </div>
                    <div className="flex items-center justify-between gap-3 px-1 pt-4">
                      <span className="slug">
                        Test {pad2(i + 1)} &nbsp;/&nbsp; {experiment.year}
                      </span>
                      <span className="slug">
                        {labStatusLabels[experiment.status]}
                      </span>
                    </div>
                    <h2 className="px-1 pt-2 text-h3 tracking-[-0.02em] underline decoration-transparent decoration-3 underline-offset-[0.2em] fine:group-hover:decoration-pink">
                      {experiment.title}
                    </h2>
                    <p className="px-1 pt-1.5 pb-2 text-sm text-ink-soft">
                      {experiment.description}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </Page>
  );
}
