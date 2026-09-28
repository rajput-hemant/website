import type { Metadata } from "next";
import {
  ResumeDocument,
  resumeSections,
} from "@/flavors/surface/components/resume/resume-document";
import { Panel } from "@/flavors/surface/components/site/panel";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export const metadata: Metadata = pageMetadata(page);

export default async function ResumePage() {
  const data = await loadResumeData();

  return (
    <Panel
      ch="07"
      name="Resume"
      aside="Printable"
      title="Resume"
      lede={page.description}
      knob={{
        items: resumeSections(data).map((section) => ({
          label: section.title,
          href: `#${section.id}`,
        })),
        unit: "Section",
        label: "Section selector",
      }}
    >
      <ResumeDocument {...data} />
    </Panel>
  );
}
