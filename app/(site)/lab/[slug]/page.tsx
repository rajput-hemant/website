import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { sharedElementName } from "@/lib/interaction/shared-element-name";
import { pageMetadata } from "@/lib/metadata";
import { SharedElement } from "@/components/interaction/shared-element";
import { ExperimentStage } from "@/components/lab/experiment-stage";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { BackLink } from "@/components/ui/back-link";

export const dynamicParams = false;

export function generateStaticParams() {
  return labExperiments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/lab/[slug]">): Promise<Metadata> {
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
}: PageProps<"/lab/[slug]">) {
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
          className="aspect-[4/5] w-full rounded-lg border border-border sm:aspect-[3/2]"
        />
      </Container>
    </div>
  );
}
