import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExperimentStage } from "@/flavors/timetable/components/lab/experiment-stage";
import { Page } from "@/flavors/timetable/components/site/page";
import { Container, PageHeader, Tag } from "@/flavors/timetable/components/ui";

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

/** One experiment on its own platform: the stage, its tags and how to use it. */
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
      <PageHeader
        platform="3"
        kicker={`Experiment ${String(n).padStart(2, "0")}`}
        title={experiment.title}
        lede={experiment.description}
        scene={null}
      >
        <div className="mt-6 flex flex-wrap gap-2">
          {experiment.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      </PageHeader>
      <Container className="mt-12">
        <ExperimentStage
          slug={experiment.slug}
          label={experiment.label}
          hint={experiment.hint}
          className="aspect-[16/10] sm:aspect-[21/9]"
        />
        <p className="mt-10">
          <Link
            href="/lab"
            className="inline-flex min-h-11 items-center gap-2 border-b-2 border-current leading-none font-bold"
          >
            <span aria-hidden>←</span> All experiments
          </Link>
        </p>
      </Container>
    </Page>
  );
}
