import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getEducation, getExperience, getSkills } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { EducationList } from "@/components/experience/education-list";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";
import { SkillsList } from "@/components/experience/skills-list";
import { Reveal } from "@/components/interaction/reveal";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { ArrowLink } from "@/components/ui/arrow-link";
import { MetaList } from "@/components/ui/meta-list";
import { SectionHeading } from "@/components/ui/section-heading";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

export default async function WorkPage() {
  const [experience, skills, education] = await Promise.all([
    getExperience(),
    getSkills(),
    getEducation(),
  ]);
  const earliest = experience.at(-1);

  return (
    <Container>
      <PageHeader
        title={page.title}
        description={page.description}
        meta={
          <MetaList className="items-center">
            <span>
              {experience.length} {experience.length === 1 ? "role" : "roles"}
            </span>
            {earliest && (
              <span>Since {formatMonthYear(earliest.startDate)}</span>
            )}
            <span>
              <ArrowLink
                href="/resume"
                className="text-muted hover:text-foreground"
              >
                Printable resume
              </ArrowLink>
            </span>
          </MetaList>
        }
      />

      <Section aria-labelledby="experience-heading" className="pt-0">
        <SectionHeading
          id="experience-heading"
          title="Experience"
          className="sr-only"
        />
        <ExperienceTimeline roles={experience} />
      </Section>

      {skills.length > 0 && (
        <Reveal
          as="section"
          aria-labelledby="skills-heading"
          className="pt-section"
        >
          <SectionHeading id="skills-heading" title="Skills" />
          <SkillsList groups={skills} />
        </Reveal>
      )}

      {education.length > 0 && (
        <Reveal
          as="section"
          aria-labelledby="education-heading"
          className="pt-section"
        >
          <SectionHeading id="education-heading" title="Education" />
          <EducationList items={education} />
        </Reveal>
      )}
    </Container>
  );
}
