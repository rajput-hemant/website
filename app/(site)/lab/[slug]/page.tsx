import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { ExperimentStage } from "@/components/lab/experiment-stage";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

type LabExperimentPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return labExperiments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: LabExperimentPageProps): Promise<Metadata> {
  const experiment = getLabExperiment((await params).slug);
  if (!experiment) return {};
  return {
    title: experiment.title,
    description: experiment.description,
    alternates: { canonical: `/lab/${experiment.slug}` },
  };
}

export default async function LabExperimentPage({
  params,
}: LabExperimentPageProps) {
  const experiment = getLabExperiment((await params).slug);
  if (!experiment) notFound();

  return (
    <div className="pb-section">
      <Container className="pt-10 sm:pt-14">
        <Link
          href="/lab"
          className="link meta text-subtle hover:text-foreground"
        >
          <span aria-hidden>← </span>Lab
        </Link>
        <PageHeader
          className="pt-8 sm:pt-10"
          title={experiment.title}
          description={experiment.description}
          meta={[experiment.year, ...experiment.tags].join(" · ")}
        />
      </Container>

      <Container size="wide">
        <ExperimentStage
          slug={experiment.slug}
          label={`The word “hemant” drawn as a field of particles. ${experiment.description}`}
          hint="Move your pointer over the word, or drag on a touch screen."
          className="aspect-[3/2] w-full rounded-lg border border-border sm:aspect-[16/9]"
        />
      </Container>
    </div>
  );
}
