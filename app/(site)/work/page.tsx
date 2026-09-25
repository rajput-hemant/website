import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { sitePage } from "@/content/site";
import { getEducation, getExperience, getSkills } from "@/lib/data";
import { formatMonthYear } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/utils";
import { EducationList } from "@/components/experience/education-list";
import { ExperienceTimeline } from "@/components/experience/experience-timeline";
import { SkillsList } from "@/components/experience/skills-list";
import { Reveal } from "@/components/interaction/reveal";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { Section } from "@/components/site/section";
import { MetaList } from "@/components/ui/meta-list";
import { SectionHeading } from "@/components/ui/section-heading";

const page = sitePage("/work");

export const metadata: Metadata = pageMetadata(page);

function ResumeLink({ className }: { className?: string }) {
  return (
    <Link
      href="/resume"
      className={cn("group/resume inline-flex items-center gap-1.5", className)}
    >
      <span className="link">Printable resume</span>
      <ArrowRight
        aria-hidden
        strokeWidth={1.75}
        className="size-[0.9em] text-subtle transition-[translate,color] duration-200 ease-snappy group-hover/resume:translate-x-0.5 group-hover/resume:text-accent"
      />
    </Link>
  );
}

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
              <ResumeLink className="text-muted hover:text-foreground" />
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

      <p className="pt-section" data-print-hide>
        <ResumeLink className="text-sm text-muted hover:text-foreground" />
      </p>
    </Container>
  );
}
