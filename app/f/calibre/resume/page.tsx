import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/calibre/components/resume/resume-document";
import { Page } from "@/flavors/calibre/components/site/page";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export const metadata: Metadata = pageMetadata(page);

/** The certificate: the resume as one sheet, printed to keep. */
export default async function ResumePage() {
  const resume = await loadResumeData();
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          hour={null}
          kicker="Certificate"
          title={page.title}
          lede={page.description}
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
