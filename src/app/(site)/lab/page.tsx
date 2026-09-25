import Link from 'next/link';
import type { Metadata } from 'next';
import { Footer } from '~/components/site/footer';
import { experiments, labIntro } from '~/content/lab';

export const metadata: Metadata = {
  title: 'Lab',
  description: 'Small interactive experiments in WebGL, one per page.',
};

export default function LabPage() {
  return (
    <>
      <main className="flex flex-col gap-12">
        <div className="flex flex-col gap-4">
          <h1>Lab</h1>
          <p className="text-fg-muted">{labIntro}</p>
        </div>
        <ol className="flex flex-col gap-8">
          {experiments.map((experiment) => (
            <li key={experiment.slug}>
              <article className="flex flex-col gap-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h2 className="text-lg">
                    <Link
                      href={`/lab/${experiment.slug}`}
                      className="text-link"
                    >
                      {experiment.title}
                    </Link>
                  </h2>
                  <p className="text-fg-muted font-mono text-xs">
                    {experiment.year}
                  </p>
                </div>
                <p className="text-fg-muted">{experiment.summary}</p>
              </article>
            </li>
          ))}
        </ol>
      </main>
      <Footer path="/lab" />
    </>
  );
}
