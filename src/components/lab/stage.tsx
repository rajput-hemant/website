'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';
import type { ExperimentSlug } from '~/content/lab';
import { PlainWordmark } from './experiments/signature-field/wordmark';

const scenes: Record<ExperimentSlug, ComponentType> = {
  'signature-field': dynamic(
    () => import('./experiments/signature-field/signature-field'),
    { ssr: false, loading: () => <PlainWordmark /> },
  ),
};

type StageProps = { slug: ExperimentSlug; alt: string };

export function Stage({ slug, alt }: StageProps) {
  const Scene = scenes[slug];

  return (
    <figure className="mx-[calc(50%-min(50vw-1rem,30rem))] flex flex-col gap-3">
      <div
        role="img"
        aria-label={alt}
        className="lab-stage border-rule relative aspect-square overflow-hidden rounded-sm border sm:aspect-[12/5]"
      >
        <Scene />
      </div>
      <figcaption className="lab-paused text-fg-muted text-center font-mono text-xs">
        Motion is paused, so this is a still frame.
      </figcaption>
    </figure>
  );
}
