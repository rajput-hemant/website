export const labIntro =
  'Small interactive pieces, one per page. They respect reduced motion and the motion switch in Customize, and every other page stays free of them.';

export const experiments = [
  {
    slug: 'signature-field',
    title: 'Signature field',
    summary:
      'The wordmark as a field of particles that gathers into letters and parts around the pointer.',
    notes:
      'Every particle is one sample of the wordmark set in Fraunces. The vertex shader carries the settle and the ripples, so the page does no work while nothing moves. Move across it, or tap, to disturb it.',
    alt: 'Hemant Rajput, drawn in particles',
    year: 2026,
  },
] as const;

export type Experiment = (typeof experiments)[number];
export type ExperimentSlug = Experiment['slug'];

export function getExperiment(slug: string): Experiment | undefined {
  return experiments.find((experiment) => experiment.slug === slug);
}
