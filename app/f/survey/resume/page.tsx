import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/survey/components/resume/resume-document";
import { Page } from "@/flavors/survey/components/site/page";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export const metadata: Metadata = pageMetadata(page);

/** The printed sheet: the resume on one day sheet, ready to print. */
export default async function ResumePage() {
  const resume = await loadResumeData();
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          kicker="Printed sheet"
          title={page.title}
          lede={page.description}
          scene={null}
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
