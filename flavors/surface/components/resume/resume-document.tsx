import type * as React from "react";
import { ExternalLink } from "@/flavors/surface/components/ui/primitives";
import { MODEL } from "@/flavors/surface/content";
import { cn } from "@/flavors/surface/lib/utils";

import type {
  Education,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from "@/lib/data/types";
import { hostedResumeLabel } from "@/lib/resume/hosted-resume";

import { PrintButton } from "./print-button";
import { ResumeEducation } from "./resume-education";
import { ResumeExperience } from "./resume-experience";
import { ResumeHeader } from "./resume-header";
import { ResumeProjects } from "./resume-projects";
import { ResumeSection } from "./resume-section";
import { ResumeSkills } from "./resume-skills";
import styles from "./resume.module.css";

export type ResumeDocumentProps = {
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  education: Education[];
};

type SectionId = "experience" | "projects" | "skills" | "education";

/** The sections that have content, in order: the document and the page's knob share it. */
export function resumeSections({
  experience,
  projects,
  skills,
  education,
}: Omit<ResumeDocumentProps, "profile">): { id: SectionId; title: string }[] {
  const all = [
    { id: "experience", title: "Experience", count: experience.length },
    { id: "projects", title: "Projects", count: projects.length },
    { id: "skills", title: "Skills", count: skills.length },
    { id: "education", title: "Education", count: education.length },
  ] as const;
  return all
    .filter((section) => section.count > 0)
    .map(({ id, title }) => ({ id, title }));
}

/**
 * The printable resume as the instrument's operating manual: a light sheet
 * on the plate in either edition, numbered sections, pure black on white in
 * print (resume.module.css). On phones it drops the sheet chrome so text runs
 * full width.
 */
export function ResumeDocument(props: ResumeDocumentProps) {
  const { profile, experience, projects, skills, education } = props;
  const body: Record<SectionId, React.ReactNode> = {
    experience: <ResumeExperience roles={experience} />,
    projects: <ResumeProjects projects={projects} />,
    skills: <ResumeSkills groups={skills} />,
    education: <ResumeEducation entries={education} />,
  };

  return (
    <div className={styles.page}>
      <div
        data-print="hide"
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pb-5"
      >
        <p className="legend">A4, prints to two pages</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.resumeUrl && (
            <ExternalLink href={profile.resumeUrl} className="text-sm">
              {`Also on ${hostedResumeLabel(profile.resumeUrl)}`}
            </ExternalLink>
          )}
          <PrintButton />
        </div>
      </div>
      <article
        style={{ colorScheme: "light" }}
        className={cn(
          styles.sheet,
          "space-y-8 text-[#1a1a18] max-sm:-mx-4 max-sm:bg-[#f7f6f2] max-sm:px-4 max-sm:py-8 sm:rounded-[6px] sm:bg-[#f7f6f2] sm:px-10 sm:pt-8 sm:pb-11 sm:shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_0_0_1px_rgb(0_0_0/0.14),0_18px_36px_-22px_rgb(0_0_0/0.5)] print:space-y-6"
        )}
      >
        <p
          aria-hidden
          className="flex justify-between border-b border-black/15 pb-3 font-display text-[0.6875rem] tracking-[0.15em] text-[#4b4944] uppercase print:hidden"
        >
          <span>{MODEL} &nbsp;·&nbsp; Operating manual</span>
          <span>Resume</span>
        </p>
        <ResumeHeader profile={profile} />
        {resumeSections(props).map((section, i) => (
          <ResumeSection
            key={section.id}
            id={section.id}
            n={String(i + 1)}
            title={section.title}
            detent={i}
            className={section.id === "experience" ? undefined : styles.keep}
          >
            {body[section.id]}
          </ResumeSection>
        ))}
        {profile.resumeNote && (
          <p className="border-t border-black/15 pt-6 text-sm text-[#6f6c65]">
            {profile.resumeNote}
          </p>
        )}
      </article>
    </div>
  );
}
