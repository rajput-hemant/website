import type { Metadata } from "next";
import Link from "next/link";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { pageMetadata } from "@/lib/metadata";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

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
                className="group -mx-2 block rounded-md px-2 py-6 transition-colors hover:bg-surface"
              >
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="display text-2xl transition-colors group-hover:text-accent">
                    {experiment.title}
                  </h2>
                  <span className="shrink-0 meta text-subtle tabular-nums">
                    {experiment.year}
                  </span>
                </div>
                <p className="mt-2 text-muted">{experiment.description}</p>
                <p className="mt-3 meta text-subtle">
                  {[...experiment.tags, status].filter(Boolean).join(" · ")}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
