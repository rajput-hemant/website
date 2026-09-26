import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
} from "@/lib/data";
import type {
  Education,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from "@/lib/data/types";

export type ResumeData = {
  profile: Profile;
  experience: Experience[];
  /** Featured projects only: the resume is one page. */
  projects: Project[];
  skills: SkillGroup[];
  education: Education[];
};

/** Everything the printable resume shows, in one fetch. */
export async function loadResumeData(): Promise<ResumeData> {
  const [profile, experience, projects, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
    getEducation(),
  ]);
  return {
    profile,
    experience,
    projects: projects.filter((project) => project.featured),
    skills,
    education,
  };
}
