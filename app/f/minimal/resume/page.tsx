import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/minimal/components/resume/resume-document";

import { sitePage } from "@/content/site";
import { pageMetadata } from "@/lib/metadata";
import { loadResumeData } from "@/lib/resume/load";

export const metadata: Metadata = pageMetadata(sitePage("/resume"));

export default async function ResumePage() {
  const data = await loadResumeData();

  return <ResumeDocument {...data} />;
}
