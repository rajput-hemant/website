import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExperimentStage } from "@/flavors/drawing-set/components/lab/experiment-stage";
import { Page } from "@/flavors/drawing-set/components/site";
import {
  Container,
  PageHeader,
  Tag,
} from "@/flavors/drawing-set/components/ui";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

const listPage = sitePage("/lab");

export function generateStaticParams() {
  return labExperiments.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const experiment = getLabExperiment(slug);
  if (!experiment) return {};
  return pageMetadata({
    title: `${experiment.title} · ${listPage.title}`,
    description: experiment.description,
    path: `/lab/${experiment.slug}`,
  });
}

/** One experiment: its own canvas (or the static fallback), tags and caption. */
export default async function LabExperimentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiment = getLabExperiment(slug);
  if (!experiment) notFound();
  const n = labExperiments.findIndex((entry) => entry.slug === slug) + 1;

  return (
    <Page>
      <Container className="py-section">
        <PageHeader
          sheet="03"
          eyebrow={`Study ${String(n).padStart(2, "0")} · ${listPage.title}`}
          title={experiment.title}
          lede={experiment.description}
        />

        <div className="mt-4 flex flex-wrap gap-1.5">
          {experiment.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <div className="mt-10">
          <ExperimentStage
            slug={experiment.slug}
            label={experiment.label}
            hint={experiment.hint}
            className="aspect-[16/10] rounded-lg border border-line bg-sheet-deep sm:aspect-[21/9]"
          />
        </div>
      </Container>
    </Page>
  );
}
