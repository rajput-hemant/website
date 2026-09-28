import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/timetable/components/resume/resume-document";
import { Page } from "@/flavors/timetable/components/site/page";
import { PageHeader } from "@/flavors/timetable/components/ui";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export const metadata: Metadata = pageMetadata(page);

/** The printed guide: the resume as one printable page. */
export default async function ResumePage() {
  const resume = await loadResumeData();

  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          platform="7"
          kicker="Printed guide"
          title={page.title}
          lede={page.description}
          scene="resume"
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
