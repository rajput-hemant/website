import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/press/components/resume/resume-document";
import { Page } from "@/flavors/press/components/site/page";
import { PageHeader } from "@/flavors/press/components/ui/page-header";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export const metadata: Metadata = pageMetadata(page);

/** The final print: the resume as one printable sheet. */
export default async function ResumePage() {
  const resume = await loadResumeData();
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          sheet={8}
          kicker="Final print"
          title={page.title}
          lede={page.description}
          scene="resume"
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
