import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { labStatusLabels } from "@/lib/data/labels";
import { absoluteUrl } from "@/lib/url";

import { markdownDocument, metaLine } from "../document";
import { escapeText, heading, link } from "../escape";

export function labToMarkdown(): string {
  const page = sitePage("/lab");

  return markdownDocument({
    title: page.title,
    path: page.path,
    summary: page.description,
    sections: [
      "Each experiment is an interactive WebGL scene, so it has no markdown mirror; follow the links to open them in a browser.",
      ...labExperiments.flatMap((experiment) => [
        heading(2, escapeText(experiment.title, true)),
        metaLine([
          String(experiment.year),
          labStatusLabels[experiment.status],
          escapeText(experiment.tags.join(", ")),
        ]),
        escapeText(experiment.description, true),
        link("Open the experiment", absoluteUrl(`/lab/${experiment.slug}`)),
      ]),
    ],
  });
}
