import type { Metadata } from "next";
import { StudyModule } from "@/flavors/surface/components/lab/study-module";
import { Panel } from "@/flavors/surface/components/site/panel";

import { labExperiments } from "@/content/lab";
import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/lab");

export const metadata: Metadata = pageMetadata({
  title: page.title,
  description: page.description,
  path: page.path,
});

/**
 * The lab: every experiment as a rack module. Posters are the experiments'
 * own static fallbacks, so the index never loads three.js for a preview.
 */
export default function LabPage() {
  const count = labExperiments.length;
  return (
    <Panel
      ch="03"
      name="Lab"
      aside={`${count} ${count === 1 ? "study" : "studies"}`}
      title={page.title}
      lede={page.description}
      knob={{
        items: labExperiments.map((experiment) => ({
          label: experiment.title,
          href: `/lab/${experiment.slug}`,
        })),
        unit: "Study",
        label: "Study selector",
      }}
    >
      <ul className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {labExperiments.map((experiment, i) => (
          <li key={experiment.slug}>
            <StudyModule experiment={experiment} number={i + 1} detent={i} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
