import type { Metadata } from "next";

import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import { ResumeDocument } from "@/components/resume/resume-document";

export const metadata: Metadata = {
  title: "Resume",
  description:
    "A printable resume: experience, selected projects, skills and education.",
  alternates: { canonical: "/resume" },
};

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
