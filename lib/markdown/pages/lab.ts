import { labExperiments } from "@/content/lab";

import { absoluteUrl, markdownDocument, metaLine } from "../document";
import { escapeText, heading, link } from "../escape";
import { pageInfo } from "./page-info";

const STATUS_LABELS = {
  live: "Live",
  "in-progress": "In progress",
  archived: "Archived",
} as const;

export function labToMarkdown(): string {
  const page = pageInfo("/lab");

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
          STATUS_LABELS[experiment.status],
          escapeText(experiment.tags.join(", ")),
        ]),
        escapeText(experiment.description, true),
        link("Open the experiment", absoluteUrl(`/lab/${experiment.slug}`)),
      ]),
    ],
  });
}
