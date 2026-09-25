import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getEducation, getExperience, getProfile, getSkills } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { CollapsedSection } from "@/components/experience/collapsed-section";
import { EducationList } from "@/components/experience/education-list";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";
import { SkillsList } from "@/components/experience/skills-list";
import { ResumeLinks } from "@/components/resume/resume-links";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { ExpandAll } from "@/components/ui/disclosure";
import { MetaList } from "@/components/ui/meta-list";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

/** "Expand all" earns its place only in longer lists. */
const EXPAND_ALL_MIN = 4;

export default async function WorkPage() {
  const [profile, experience, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getSkills(),
    getEducation(),
  ]);
  const earliest = experience.at(-1);
  const skillCount = skills.reduce((sum, group) => sum + group.items.length, 0);

  return (
    <Container className="stagger">
      <PageHeader
        title={page.title}
        description={page.description}
        meta={
          <MetaList as="div" className="items-center">
            <span className="tabular-nums">
              {experience.length} {experience.length === 1 ? "role" : "roles"}
            </span>
            {earliest && (
              <span className="tabular-nums">
                Since {formatMonthYear(earliest.startDate)}
              </span>
            )}
            <ResumeLinks resumeUrl={profile.resumeUrl} />
          </MetaList>
        }
      />

      <section aria-labelledby="experience-heading">
        <div className="mb-8 flex items-center justify-between gap-6 border-b border-hairline pb-3">
          <h2 id="experience-heading" className="meta text-subtle">
            Experience
          </h2>
          {experience.length >= EXPAND_ALL_MIN && (
            <ExpandAll controls="roles" />
          )}
        </div>
        <ExperienceTimeline id="roles" roles={experience} />
      </section>

      {(skills.length > 0 || education.length > 0) && (
        <div className="mt-section grid gap-2">
          {skills.length > 0 && (
            <CollapsedSection id="skills" title="Skills" count={skillCount}>
              <SkillsList groups={skills} />
            </CollapsedSection>
          )}
          {education.length > 0 && (
            <CollapsedSection
              id="education"
              title="Education"
              count={education.length}
            >
              <EducationList items={education} />
            </CollapsedSection>
          )}
        </div>
      )}
    </Container>
  );
}
