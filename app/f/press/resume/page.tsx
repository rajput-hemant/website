import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/press/components/resume/resume-document";
import { FoldPoster } from "@/flavors/press/components/scene/view-posters";
import { ViewSlot } from "@/flavors/press/components/scene/view-slot";
import { Page } from "@/flavors/press/components/site/page";
import { PageHeader } from "@/flavors/press/components/ui/page-header";
import { VIEW } from "@/flavors/press/lib/scene/views";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

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
        >
          {/* The final print, folded in three until the sheet below is read. */}
          <ViewSlot
            id={VIEW.fold}
            className="mt-8 h-24 w-40"
            poster={<FoldPoster />}
          />
        </PageHeader>
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
