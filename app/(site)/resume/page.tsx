import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { ResumeDocument } from "@/components/resume/resume-document";
import { Page, SceneSlot } from "@/components/site";
import { Tag } from "@/components/ui";

export const metadata: Metadata = pageMetadata(sitePage("/resume"));

export default async function ResumePage() {
  const [profile, experience, projects, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
    getEducation(),
  ]);

  return (
    <Page>
      <div data-print="hide" className="mx-auto max-w-[88rem] px-gutter pt-8">
        <Tag>Folio</Tag>
      </div>

      <SceneSlot route="resume" size="none" />

      <ResumeDocument
        profile={profile}
        experience={experience}
        projects={projects.filter((project) => project.featured)}
        skills={skills}
        education={education}
      />
    </Page>
  );
}
