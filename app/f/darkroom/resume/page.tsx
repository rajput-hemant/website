import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/darkroom/components/resume/resume-document";
import { Page } from "@/flavors/darkroom/components/site/page";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The fibre print: the resume as one sheet, printed to keep. */
export default async function ResumePage() {
  const resume = await loadResumeData();
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          frame="07"
          kicker="Fibre print"
          title={page.title}
          lede={page.description}
          scene="resume"
          board="doc.0"
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
