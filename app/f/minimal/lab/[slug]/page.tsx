import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SharedElement } from "@/flavors/minimal/components/interaction/shared-element";
import { ExperimentStage } from "@/flavors/minimal/components/lab/experiment-stage";
import { Container } from "@/flavors/minimal/components/site/container";
import { PageHeader } from "@/flavors/minimal/components/site/page-header";
import { BackLink } from "@/flavors/minimal/components/ui/back-link";
import { sharedElementName } from "@/flavors/minimal/lib/interaction/shared-element-name";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { pageMetadata } from "@/lib/metadata";

export const dynamicParams = false;

export function generateStaticParams() {
  return labExperiments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/f/minimal/lab/[slug]">): Promise<Metadata> {
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
}: PageProps<"/f/minimal/lab/[slug]">) {
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
