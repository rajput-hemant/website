import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/drawing-set/components/resume/resume-document";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import { Tag } from "@/flavors/drawing-set/components/ui";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

export const metadata: Metadata = pageMetadata(sitePage("/resume"));

export default async function ResumePage() {
  const data = await loadResumeData();

  return (
    <Page>
      <div data-print="hide" className="mx-auto max-w-[88rem] px-gutter pt-8">
        <Tag>Folio</Tag>
      </div>

      <div data-print="hide">
        <SceneSlot route="resume" size="band" />
      </div>

      <ResumeDocument {...data} />
    </Page>
  );
}
