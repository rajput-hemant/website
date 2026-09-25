import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { pageMetadata } from "@/lib/metadata";
import { SharedElement } from "@/components/interaction/shared-element";
import { sharedElementName } from "@/components/interaction/shared-element-name";
import { ExperimentStage } from "@/components/lab/experiment-stage";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { BackLink } from "@/components/ui/back-link";

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
  return pageMetadata({
    title: experiment.title,
    description: experiment.description,
    path: `/lab/${experiment.slug}`,
  });
}

export default async function LabExperimentPage({
  params,
}: LabExperimentPageProps) {
  const experiment = getLabExperiment((await params).slug);
  if (!experiment) notFound();

  return (
    <div>
      <Container className="pt-10 sm:pt-14">
        <BackLink href="/lab">Lab</BackLink>
        <PageHeader
          className="pt-8 sm:pt-10"
          title={
            <SharedElement name={sharedElementName("lab", experiment.slug)}>
              <span className="inline-block">{experiment.title}</span>
            </SharedElement>
          }
          description={experiment.description}
          meta={[experiment.year, ...experiment.tags].join(" · ")}
        />
      </Container>

      <Container size="wide">
        <ExperimentStage
          slug={experiment.slug}
          label={experiment.label}
          hint={experiment.hint}
          className="aspect-[3/2] w-full rounded-lg border border-border sm:aspect-[16/9]"
        />
      </Container>
    </div>
  );
}
