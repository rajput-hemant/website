import type { Metadata } from "next";
import Link from "next/link";
import { SharedElement } from "@/flavors/minimal/components/interaction/shared-element";
import { ExperimentPoster } from "@/flavors/minimal/components/lab/poster";
import { Container } from "@/flavors/minimal/components/site/container";
import { PageHeader } from "@/flavors/minimal/components/site/page-header";
import { sharedElementName } from "@/flavors/minimal/lib/interaction/shared-element-name";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata(page);

export default function LabPage() {
  return (
    <Container>
      <PageHeader title={page.title} description={page.description} />

      <ol className="border-t border-border">
        {labExperiments.map((experiment) => {
          // Live is the default; only a departure from it is worth a label.
          const status =
            experiment.status === "live"
              ? null
              : labStatusLabels[experiment.status];
          return (
            <li key={experiment.slug} className="border-b border-border">
              <Link
                href={`/lab/${experiment.slug}`}
                className="group -mx-2 block rounded-md px-2 py-6 transition-colors hover:bg-surface active:bg-surface lg:grid lg:grid-cols-[12rem_1fr] lg:items-center lg:gap-6"
              >
                <div
                  aria-hidden
                  className="aspect-[16/10] w-full overflow-hidden rounded-md border border-hairline bg-surface lg:aspect-square"
                >
                  <ExperimentPoster
                    slug={experiment.slug}
                    className="size-full"
                  />
                </div>
                <div className="mt-4 lg:mt-0">
                  <div className="flex items-baseline justify-between gap-6">
                    <SharedElement
                      name={sharedElementName("lab", experiment.slug)}
                    >
                      <h2 className="display text-2xl transition-colors group-hover:text-accent">
                        {experiment.title}
                      </h2>
                    </SharedElement>
                    <span className="shrink-0 meta text-subtle tabular-nums">
                      {experiment.year}
                    </span>
                  </div>
                  <p className="mt-2 text-muted">{experiment.description}</p>
                  <p className="mt-3 meta text-subtle">
                    {[...experiment.tags, status].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
