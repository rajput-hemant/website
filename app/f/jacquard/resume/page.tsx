import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/jacquard/components/resume/resume-document";
import { Page } from "@/flavors/jacquard/components/site/page";
import { PageHeader } from "@/flavors/jacquard/components/ui/page-header";
import { draftWeave } from "@/flavors/jacquard/lib/scene/poses";
import { buildDraft } from "@/flavors/jacquard/lib/weave";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

const page = sitePage("/resume");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

/** The pattern card: the resume as one printable card. */
export default async function ResumePage() {
  const resume = await loadResumeData();
  return (
    <Page>
      <div data-print="hide">
        <PageHeader
          card={8}
          kicker="Pattern card"
          title={page.title}
          lede={page.description}
          scene={{
            route: "resume",
            weave: draftWeave(buildDraft(resume.projects)),
            caption: "The cloth this card describes, hanging still.",
          }}
        />
      </div>
      <ResumeDocument {...resume} />
    </Page>
  );
}
