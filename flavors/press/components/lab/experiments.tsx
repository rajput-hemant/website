import * as React from "react";

import type { LabSlug } from "@/content/lab";

import { SignatureFieldFallback } from "./signature-field-fallback";

/** Each experiment's three.js-free poster, which is also its paused and no-WebGL state. */
export const posters = {
  "signature-field": SignatureFieldFallback,
} satisfies Record<LabSlug, React.ComponentType<{ className?: string }>>;
