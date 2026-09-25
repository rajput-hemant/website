import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Stage } from '~/components/lab/stage';
import { Footer } from '~/components/site/footer';
import { experiments, getExperiment } from '~/content/lab';

type ExperimentPageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return experiments.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: ExperimentPageProps): Promise<Metadata> {
  const experiment = getExperiment((await params).slug);
  if (!experiment) return {};
  return { title: experiment.title, description: experiment.summary };
}

export default async function ExperimentPage({ params }: ExperimentPageProps) {
  const experiment = getExperiment((await params).slug);
  if (!experiment) notFound();

  return (
    <>
      <main className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <p className="font-mono text-xs">
            <Link href="/lab" className="quiet-link">
              Lab
            </Link>
          </p>
          <h1>{experiment.title}</h1>
          <p className="text-fg-muted">{experiment.summary}</p>
        </div>
        <Stage slug={experiment.slug} alt={experiment.alt} />
        <div className="prose text-fg-muted">
          <p>{experiment.notes}</p>
        </div>
      </main>
      <Footer path={`/lab/${experiment.slug}`} />
    </>
  );
}
