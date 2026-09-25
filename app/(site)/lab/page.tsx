import type { Metadata } from "next";
import Link from "next/link";

import { labExperiments } from "@/content/lab";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

const description =
  "Small interactive experiments in WebGL, type and motion. Each one runs on its own page and pauses when you look away.";

export const metadata: Metadata = {
  title: "Lab",
  description,
  alternates: { canonical: "/lab" },
};

const statusLabel = {
  live: null,
  "in-progress": "In progress",
  archived: "Archived",
} as const;

export default function LabPage() {
  return (
    <Container className="pb-section">
      <PageHeader title="Lab" description={description} />

      <ol className="border-t border-border">
        {labExperiments.map((experiment) => {
          const status = statusLabel[experiment.status];
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
