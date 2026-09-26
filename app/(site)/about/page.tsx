import type { Metadata } from "next";

import { sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { Bio } from "@/components/about/bio";
import { ContactBlock } from "@/components/about/contact-block";
import { EducationVolume } from "@/components/about/education-volume";
import { SkillsCase } from "@/components/about/skills-case";
import { Page, SceneSlot } from "@/components/site";
import { Container, PageHeader, Section } from "@/components/ui";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

export default async function AboutPage() {
  const [profile, skills, education] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
  ]);

  return (
    <Page>
      <Container>
        <PageHeader
          eyebrow="Drawer 04 · About"
          title={page.title}
          lede={page.description}
        />

        <SceneSlot route="about" size="window" />

        <Bio profile={profile} />

        {skills.length > 0 && (
          <Section
            id="skills"
            label="Type case"
            title="Skills"
            className="mt-section"
          >
            <SkillsCase groups={skills} />
          </Section>
        )}

        {education.length > 0 && (
          <Section
            id="education"
            label="Bound volume"
            title="Education"
            className="mt-section"
          >
            <EducationVolume items={education} />
          </Section>
        )}

        <Section
          id="contact"
          label="Reach me"
          title="Contact"
          className="mt-section"
        >
          <ContactBlock
            email={profile.email}
            links={profile.links}
            resumeUrl={profile.resumeUrl}
          />
        </Section>
      </Container>
    </Page>
  );
}
