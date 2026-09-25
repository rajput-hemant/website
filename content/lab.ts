export type LabStatus = "live" | "in-progress" | "archived";

export type LabExperiment = {
  slug: string;
  title: string;
  /** One line; used on the index and as the page's meta description. */
  description: string;
  year: number;
  tags: readonly string[];
  status: LabStatus;
};

/** Every experiment under /lab, newest first. Each slug needs a scene in `components/lab/experiments`. */
export const labExperiments = [
  {
    slug: "signature-field",
    title: "Signature field",
    description:
      "My name as a few thousand particles that settle into the letters and ripple away from your pointer, tinted with your accent colour.",
    year: 2026,
    tags: ["WebGL", "GLSL", "Typography"],
    status: "live",
  },
] as const satisfies readonly LabExperiment[];

export type LabSlug = (typeof labExperiments)[number]["slug"];

export function getLabExperiment(slug: string) {
  return labExperiments.find((experiment) => experiment.slug === slug);
}
