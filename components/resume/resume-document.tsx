import type {
  Education,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from "@/lib/data/types";
import { hostedResumeLabel } from "@/lib/resume/hosted-resume";
import { cn } from "@/lib/utils";
import { Container, ExternalLink } from "@/components/ui";

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

/**
 * The resume: a folded folio sheet on the ink ground on screen, plain
 * black-on-white A4 in print. The sheet's outer edges sit on the site column,
 * in line with the header; on phones it drops the sheet chrome so text runs
 * full width.
 */
export function ResumeDocument({
  profile,
  experience,
  projects,
  skills,
  education,
}: ResumeDocumentProps) {
  return (
    <Container className={styles.page}>
      <div
        data-print="hide"
        className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 pt-10 pb-6 sm:pt-14"
      >
        <p className="font-mono text-mono-xs text-pencil">
          Resume · A4, prints to two pages
        </p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.resumeUrl && (
            <ExternalLink
              href={profile.resumeUrl}
              className="text-sm text-graphite transition-colors duration-(--duration-ui) hover:text-paper"
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
          "space-y-8 pt-4 pb-4 sm:rounded-lg sm:border sm:border-hairline sm:bg-ink-raised sm:px-10 sm:py-11 sm:shadow-lift print:space-y-6"
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
          <p className="border-t border-rule pt-6 text-sm text-pencil">
            {profile.resumeNote}
          </p>
        )}
      </article>
    </Container>
  );
}
