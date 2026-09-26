import type { Metadata } from "next";

import { site } from "@/content/site";
import {
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";
import { ContactBand } from "@/components/home/contact-band";
import { HomeIntro } from "@/components/home/intro";
import { NowSnippet } from "@/components/home/now-snippet";
import { ReferenceDesk } from "@/components/home/reference-desk";
import { SelectedWork } from "@/components/home/selected-work";
import { Page, SceneSlot } from "@/components/site";
import { Container, Reveal } from "@/components/ui";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const FEATURED_COUNT = 3;

export default async function HomePage() {
  const [profile, now, projects, experience, questions] = await Promise.all([
    getProfile(),
    getNow(),
    getProjects(),
    getExperience(),
    getQuestions({ page: 1, pageSize: 1 }),
  ]);

  const startYears = experience.map((role) =>
    Number(role.startDate.slice(0, 4))
  );
  const firstYear =
    startYears.length > 0 ? Math.min(...startYears) : new Date().getFullYear();
  const featured = projects
    .filter((project) => project.featured)
    .slice(0, FEATURED_COUNT);
  const numberBySlug = new Map(
    projects.map((project, index) => [project.slug, index + 1])
  );
  const question = questions.items[0] ?? null;

  return (
    <Page>
      <div className="relative">
        <SceneSlot route="home" size="hero" />
        <div className="static px-gutter pt-8 sm:absolute sm:inset-x-0 sm:bottom-0 sm:px-gutter sm:pt-0 sm:pb-12 lg:pb-16">
          <HomeIntro profile={profile} firstYear={firstYear} />
        </div>
      </div>

      <Container className="py-section">
        <Reveal>
          <SelectedWork projects={featured} numberBySlug={numberBySlug} />
        </Reveal>
        <Reveal className="mt-16 sm:mt-20" delay={0.05}>
          <NowSnippet now={now} />
        </Reveal>
        <Reveal className="mt-16 sm:mt-20" delay={0.1}>
          <ReferenceDesk question={question} />
        </Reveal>
      </Container>

      <Reveal>
        <ContactBand profile={profile} />
      </Reveal>
    </Page>
  );
}
