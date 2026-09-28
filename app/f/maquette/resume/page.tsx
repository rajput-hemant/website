import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/maquette/components/resume/resume-document";
import { Page } from "@/flavors/maquette/components/site/page";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { siteBoard } from "@/flavors/maquette/lib/site-board";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The spec sheet: the resume as one sheet, printed to keep. */
export default async function ResumePage() {
  const [resume, model] = await Promise.all([loadResumeData(), siteBoard()]);
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          frame="07"
          kicker="Spec sheet"
          title={page.title}
          lede={page.description}
          scene="resume"
          board={model.board}
          pins={model.pins}
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
