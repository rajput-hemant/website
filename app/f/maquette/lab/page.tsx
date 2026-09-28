import type { Metadata } from "next";
import Link from "next/link";
import { posters } from "@/flavors/maquette/components/lab/experiments";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { encodeBoard, pad2 } from "@/flavors/maquette/lib/model";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata(page);

/** Test massing: each experiment runs on its own page; the index shows static posters only. */
export default function LabPage() {
  return (
    <Page>
      <PageHeader
        frame="03"
        kicker="Test massing"
        title={page.title}
        lede={page.description}
        meta={[{ label: "On the bench", value: String(labExperiments.length) }]}
        scene="lab"
        board={encodeBoard({
          blocks: labExperiments.map((experiment, i) => ({
            id: experiment.slug,
            cols: 2,
            rows: 2,
            storeys: i + 1,
            material: "foam",
            i: 3 + i * 4,
            j: 4,
          })),
          focus: null,
        })}
        sceneLabel="Foam test blocks, one per experiment"
      />
      <Container className="mt-section">
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => {
            const Poster = posters[experiment.slug];
            return (
              <li key={experiment.slug}>
                <Link href={`/lab/${experiment.slug}`} className="group block">
                  <div className="vitrine p-2">
                    <div className="aspect-video overflow-hidden ring-cut transition-shadow duration-(--duration-ui) fine:group-hover:ring-2">
                      <Poster />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <span className="num">
                      Test {pad2(i + 1)} · {experiment.year}
                    </span>
                    <span className="num">
                      {labStatusLabels[experiment.status]}
                    </span>
                  </div>
                  <h2 className="pt-2 text-h3 leading-tight font-normal tracking-[-0.01em] transition-colors duration-(--duration-ui) fine:group-hover:text-cut">
                    {experiment.title}
                  </h2>
                  <p className="pt-1.5 text-sm text-soft">
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
