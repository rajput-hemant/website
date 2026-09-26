import * as React from "react";

import type { LabSlug } from "@/content/lab";

import { SignatureFieldFallback } from "./experiments/signature-field/signature-field-fallback";

/**
 * The /lab index's poster frame for one experiment: a static, three.js-free
 * preview, reused from the experiment's own reduced-motion/no-WebGL
 * fallback so the poster and the "paused" state always agree. Pure CSS, so
 * it costs nothing to keep lazy and never shifts layout (the frame around it
 * reserves a fixed aspect ratio).
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
