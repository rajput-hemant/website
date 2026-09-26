import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/drawing-set/components/resume/resume-document";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import { Tag } from "@/flavors/drawing-set/components/ui";

import { sitePage } from "@/content/site";
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

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

      <div data-print="hide">
        <SceneSlot route="resume" size="band" />
      </div>

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
