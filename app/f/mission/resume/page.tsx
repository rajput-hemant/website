import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/mission/components/resume/resume-document";
import { Page } from "@/flavors/mission/components/site/page";
import { PageHeader } from "@/flavors/mission/components/ui/page-header";
import { flightPlan } from "@/flavors/mission/lib/flight";
import { boardFor } from "@/flavors/mission/lib/scene/poses";

import { sitePage } from "@/content/site";
import { getExperience } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export const metadata: Metadata = pageMetadata(page);

/** The crew record: the resume as one printable sheet. */
export default async function ResumePage() {
  const [resume, experience] = await Promise.all([
    loadResumeData(),
    getExperience(),
  ]);
  const flight = flightPlan(experience, resume.projects, new Date());
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          section={8}
          kicker="Crew record"
          title={page.title}
          lede={page.description}
          scene={{
            route: "resume",
            board: boardFor(flight),
            caption: "Every phase this record describes, all lit.",
          }}
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
