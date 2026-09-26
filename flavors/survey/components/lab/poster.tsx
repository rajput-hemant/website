import * as React from "react";

import type { LabSlug } from "@/content/lab";

import { SignatureFieldFallback } from "./experiments/signature-field/signature-field-fallback";

/**
 * The /lab index's poster for one experiment: its own static fallback, so
 * the poster and the paused state always agree, with no three.js.
 */
const posters = {
  "signature-field": SignatureFieldFallback,
} satisfies Record<LabSlug, React.ComponentType<{ className?: string }>>;

export function ExperimentPoster({
  slug,
  className,
}: {
  slug: LabSlug;
  className?: string;
}) {
  const Poster = posters[slug];
  return <Poster className={className} />;
}
