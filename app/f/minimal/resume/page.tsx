import type { Metadata } from "next";
import { ResumeDocument } from "@/flavors/minimal/components/resume/resume-document";

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
    <ResumeDocument
      profile={profile}
      experience={experience}
      projects={projects.filter((project) => project.featured)}
      skills={skills}
      education={education}
    />
  );
}
