import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperimentStage } from "@/flavors/maquette/components/lab/experiment-stage";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { actionLinkClass } from "@/flavors/maquette/components/ui/link-class";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { pad2 } from "@/flavors/maquette/lib/model";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

const listPage = sitePage("/lab");

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return labExperiments.map((experiment) => ({ slug: experiment.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const experiment = getLabExperiment((await params).slug);
  if (!experiment) return {};
  return pageMetadata({
    title: `${experiment.title} · ${listPage.title}`,
    description: experiment.description,
    path: `/lab/${experiment.slug}`,
  });
}

/** One test on the bench: the stage, its tags and how to use it. */
export default async function LabExperimentPage({ params }: Props) {
  const { slug } = await params;
  const experiment = getLabExperiment(slug);
  if (!experiment) notFound();
  const n = labExperiments.findIndex((entry) => entry.slug === slug) + 1;

  return (
    <Page>
      <PageHeader
        frame="03"
        kicker={`Test ${pad2(n)}`}
        title={experiment.title}
        lede={experiment.description}
        scene={null}
      >
        <p className="mt-6 num">{experiment.tags.join(" / ")}</p>
      </PageHeader>
      <Container className="mt-12">
        <ExperimentStage
          slug={experiment.slug}
          label={experiment.label}
          hint={experiment.hint}
          className="aspect-[16/10] sm:aspect-[21/9]"
        />
        <p className="mt-10">
          <Link href="/lab" className={actionLinkClass}>
            ← All tests
          </Link>
        </p>
      </Container>
    </Page>
  );
}
