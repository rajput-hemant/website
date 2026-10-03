import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PlateScrews } from "@/flavors/surface/components/instruments/screws";
import { ExperimentStage } from "@/flavors/surface/components/lab/experiment-stage";
import { ExperimentPoster } from "@/flavors/surface/components/lab/poster";
import { Panel } from "@/flavors/surface/components/site/panel";
import { KeyLink } from "@/flavors/surface/components/ui/primitives";

import { getLabExperiment, labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { getSiteIdentity } from "@/lib/data";
import { personalize } from "@/lib/data/identity";
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

/** One experiment on its own screen: the stage behind a bezel, with its tags and how to play. */
export default async function LabExperimentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const experiment = getLabExperiment(slug);
  if (!experiment) notFound();
  const site = await getSiteIdentity();
  const n = labExperiments.findIndex((entry) => entry.slug === slug) + 1;

  return (
    <Panel
      ch="03"
      name={`Lab · Study ${String(n).padStart(2, "0")}`}
      aside={experiment.year}
      title={experiment.title}
      lede={experiment.description}
      meta={
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
          {experiment.tags.map((tag) => (
            <li key={tag} className="legend">
              {tag}
            </li>
          ))}
        </ul>
      }
      knob={{
        items: labExperiments.map((entry) => ({
          label: entry.title,
          href: `/lab/${entry.slug}`,
        })),
        unit: "Study",
        label: "Study selector",
        initial: n - 1,
      }}
    >
      <div className="mod relative p-3 sm:p-4">
        <PlateScrews name="lab-stage" />
        <ExperimentStage
          slug={experiment.slug}
          fallback={<ExperimentPoster slug={experiment.slug} />}
          label={personalize(experiment.label, site)}
          hint={experiment.hint}
          className="glass aspect-[16/10] sm:aspect-[21/9]"
        />
      </div>
      <div className="mt-8">
        <KeyLink href="/lab">Back to the lab</KeyLink>
      </div>
    </Panel>
  );
}
