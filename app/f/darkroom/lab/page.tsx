import type { Metadata } from "next";
import Link from "next/link";
import { posters } from "@/flavors/darkroom/components/lab/experiments";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { pad2 } from "@/flavors/darkroom/lib/roll";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** Test strips: each experiment runs on its own page; the index shows static posters only. */
export default function LabPage() {
  return (
    <Page>
      <PageHeader
        frame="03"
        kicker="Test strips"
        title={page.title}
        lede={page.description}
        meta={[{ label: "On the easel", value: String(labExperiments.length) }]}
        scene="lab"
      />
      <Container className="mt-section">
        <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => {
            const Poster = posters[experiment.slug];
            return (
              <li key={experiment.slug}>
                <Link href={`/lab/${experiment.slug}`} className="group block">
                  <div className="perfs px-2 py-6.5">
                    <div className="aspect-video overflow-hidden ring-grease transition-shadow duration-(--duration-ui) fine:group-hover:ring-2">
                      <Poster />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <span className="edge">
                      Strip {pad2(i + 1)} / {experiment.year}
                    </span>
                    <span className="edge">
                      {labStatusLabels[experiment.status]}
                    </span>
                  </div>
                  <h2 className="pt-2 text-[1.625rem] leading-tight tracking-[-0.03em] underline decoration-transparent underline-offset-[0.2em] fine:group-hover:decoration-grease">
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
