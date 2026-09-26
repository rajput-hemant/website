import type { Metadata } from "next";
import Link from "next/link";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { ExperimentPoster } from "@/components/lab/poster";
import { Page } from "@/components/site";
import { Container, PageHeader, Tag } from "@/components/ui";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

/**
 * The lab index: a dated grid of experiment tiles. Each poster is the same
 * static fallback the experiment itself falls back to, so the index never
 * loads three.js just to show a preview.
 */
export default function LabPage() {
  return (
    <Page>
      <Container className="py-section">
        <PageHeader
          eyebrow="Drawer 07 · Lab"
          title={page.title}
          lede={page.description}
        />

        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {labExperiments.map((experiment) => (
            <li key={experiment.slug}>
              <Link
                href={`/lab/${experiment.slug}`}
                data-tilt
                data-cursor="Open"
                className="tilt press group relative block overflow-hidden rounded-md border border-hairline bg-ink-raised transition-colors duration-(--duration-ui) ease-enter hover:border-accent/40"
              >
                <span
                  aria-hidden
                  className="tilt-glare pointer-events-none absolute inset-0 z-10"
                />
                <div className="aspect-video overflow-hidden border-b border-hairline">
                  <ExperimentPoster slug={experiment.slug} />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-mono-xs text-pencil tabular-nums">
                      {experiment.year}
                    </span>
                    <Tag>{experiment.status}</Tag>
                  </div>
                  <h2 className="mt-2 font-display text-lg tracking-[-0.01em] text-paper">
                    {experiment.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-graphite">
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
