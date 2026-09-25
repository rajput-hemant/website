import type {
  Education,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui/external-link";

import { hostedResumeLabel } from "./hosted-resume";
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

/** The resume as a sheet on screen and as plain black-on-white A4 in print. */
export function ResumeDocument({
  profile,
  experience,
  projects,
  skills,
  education,
}: ResumeDocumentProps) {
  return (
    <div
      className={cn(
        styles.page,
        "mx-auto w-full max-w-[calc(50rem+2*var(--gutter))] px-(--gutter)"
      )}
    >
      <div
        data-print-hide
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-10 pb-6 sm:pt-14"
      >
        <p className="meta text-subtle">Resume · A4, prints to two pages</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.resumeUrl && (
            <ExternalLink
              href={profile.resumeUrl}
              data-no-preview
              className="text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              {`Also on ${hostedResumeLabel(profile.resumeUrl)}`}
            </ExternalLink>
          )}
          <PrintButton />
        </div>
      </div>
      <article
        className={cn(
          styles.sheet,
          "space-y-8 rounded-lg border border-border bg-background px-5 py-8 shadow-[0_28px_56px_-36px_color-mix(in_oklab,var(--color-foreground)_28%,transparent)] sm:px-12 sm:py-12 dark:shadow-[0_28px_56px_-36px_oklch(0_0_0/0.9)] print:space-y-6"
        )}
      >
        <ResumeHeader profile={profile} />
        {experience.length > 0 && (
          <ResumeSection id="experience" title="Experience">
            <ResumeExperience roles={experience} />
          </ResumeSection>
        )}
        {projects.length > 0 && (
          <ResumeSection id="projects" title="Projects" className={styles.keep}>
            <ResumeProjects projects={projects} />
          </ResumeSection>
        )}
        {skills.length > 0 && (
          <ResumeSection id="skills" title="Skills" className={styles.keep}>
            <ResumeSkills groups={skills} />
          </ResumeSection>
        )}
        {education.length > 0 && (
          <ResumeSection
            id="education"
            title="Education"
            className={styles.keep}
          >
            <ResumeEducation entries={education} />
          </ResumeSection>
        )}
        {profile.resumeNote && (
          <p className="border-t border-border pt-6 text-sm text-subtle">
            {profile.resumeNote}
          </p>
        )}
      </article>
    </div>
  );
}
