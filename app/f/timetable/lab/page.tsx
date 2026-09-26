import type { Metadata } from "next";
import Link from "next/link";
import { ExperimentPoster } from "@/flavors/timetable/components/lab/poster";
import { Page } from "@/flavors/timetable/components/site/page";
import { Container, PageHeader, Tag } from "@/flavors/timetable/components/ui";

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

/**
 * Experimental services: each experiment runs on its own page. The index
 * shows each one's static poster, so it never loads three.js for a preview.
 */
export default function LabPage() {
  return (
    <Page>
      <PageHeader
        platform="3"
        kicker="Experimental services"
        title={page.title}
        lede={page.description}
        meta={[{ label: "Running", value: String(labExperiments.length) }]}
        scene="lab"
      />
      <Container className="mt-section">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment, i) => (
            <li key={experiment.slug}>
              <Link
                href={`/lab/${experiment.slug}`}
                data-tilt
                data-scene-item={`study:${experiment.slug}`}
                data-scene-label={`${experiment.title}|Experiment ${i + 1}|${experiment.year}`}
                className="tilt group block rounded-lg bg-surface p-3 shadow-[inset_0_0_0_1.5px_var(--color-rule)] transition-shadow duration-(--duration-ui) fine:hover:shadow-[inset_0_0_0_2px_var(--color-ink)]"
              >
                <div className="aspect-video overflow-hidden rounded-md">
                  <ExperimentPoster slug={experiment.slug} />
                </div>
                <div className="flex items-center justify-between gap-3 px-1 pt-4">
                  <span className="font-mono text-mono-xs font-bold tracking-[0.08em] text-ink-soft uppercase">
                    Experiment {String(i + 1).padStart(2, "0")} ·{" "}
                    {experiment.year}
                  </span>
                  <Tag className="text-xs">
                    {labStatusLabels[experiment.status]}
                  </Tag>
                </div>
                <h2 className="px-1 pt-2 text-h3 font-extrabold tracking-[-0.015em]">
                  {experiment.title}
                </h2>
                <p className="px-1 pt-1.5 pb-2 text-sm text-ink-soft">
                  {experiment.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </Page>
  );
}
