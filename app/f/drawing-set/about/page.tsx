import type { Metadata } from "next";
import { GeneralNotes } from "@/flavors/drawing-set/components/about/bio";
import { ContactTitleBlock } from "@/flavors/drawing-set/components/about/contact-block";
import { EducationSchedule } from "@/flavors/drawing-set/components/about/education-volume";
import { SkillsSchedule } from "@/flavors/drawing-set/components/about/skills-case";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import {
  Container,
  PageHeader,
  Section,
} from "@/flavors/drawing-set/components/ui";
import { sheetFor, sheetTotal } from "@/flavors/drawing-set/content";

import { sitePage } from "@/content/site";
import { getChangelog, getEducation, getProfile, getSkills } from "@/lib/data";
import { formatRevision } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");
const sheet = sheetFor(page.path)?.sheet ?? "04";

export const metadata: Metadata = pageMetadata(page);

export default async function AboutPage() {
  const [profile, skills, education, changelog] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
    getChangelog(),
  ]);
  const rev = changelog[0] ? formatRevision(changelog[0].date) : "—";

  return (
    <Page>
      <Container>
        <PageHeader sheet={sheet} title={page.title} lede={page.description} />

        <SceneSlot route="about" size="band" />

        <GeneralNotes profile={profile} />

        {skills.length > 0 && (
          <Section id="skills" label="02" title="Skills" className="mt-section">
            <SkillsSchedule groups={skills} />
          </Section>
        )}

        {education.length > 0 && (
          <Section
            id="education"
            label="03"
            title="Education"
            className="mt-section"
          >
            <EducationSchedule items={education} />
          </Section>
        )}

        <Section id="contact" label="04" title="Contact" className="mt-section">
          <ContactTitleBlock
            email={profile.email}
            links={profile.links}
            resumeUrl={profile.resumeUrl}
            sheet={sheet}
            total={sheetTotal}
            rev={rev}
          />
        </Section>
      </Container>
    </Page>
  );
}
