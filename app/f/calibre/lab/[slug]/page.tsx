import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperimentStage } from "@/flavors/calibre/components/lab/experiment-stage";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { actionLinkClass } from "@/flavors/calibre/components/ui/link-class";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { pad2 } from "@/flavors/calibre/lib/movement";

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

/** One trial on the regulation bench: the stage, its tags and how to use it. */
export default async function LabExperimentPage({ params }: Props) {
  const { slug } = await params;
  const experiment = getLabExperiment(slug);
  if (!experiment) notFound();
  const n = labExperiments.findIndex((entry) => entry.slug === slug) + 1;

  return (
    <Page>
      <PageHeader
        hour={6}
        kicker={`Trial ${pad2(n)}`}
        title={experiment.title}
        lede={experiment.description}
      >
        <p className="mt-6 spec">{experiment.tags.join(" / ")}</p>
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
            ← All trials
          </Link>
        </p>
      </Container>
    </Page>
  );
}
