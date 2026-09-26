import type { Metadata } from "next";
import { CurrentRevision } from "@/flavors/drawing-set/components/home/current-revision";
import { ExperienceSummary } from "@/flavors/drawing-set/components/home/experience-summary";
import { Hero } from "@/flavors/drawing-set/components/home/hero";
import { SelectedSheets } from "@/flavors/drawing-set/components/home/selected-sheets";
import {
  lastSheet,
  revOf,
  sheetOf,
} from "@/flavors/drawing-set/components/projects/sheet";
import { Page } from "@/flavors/drawing-set/components/site";
import { Container } from "@/flavors/drawing-set/components/ui";

import { labExperiments } from "@/content/lab";
import { site } from "@/content/site";
import {
  getChangelog,
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const FEATURED_COUNT = 3;

const count = (n: number, one: string, many: string) =>
  `${n} ${n === 1 ? one : many}`;

export default async function HomePage() {
  const [profile, now, projects, experience, questions, changelog] =
    await Promise.all([
      getProfile(),
      getNow(),
      getProjects(),
      getExperience(),
      getQuestions({ page: 1, pageSize: 1 }),
      getChangelog(),
    ]);

  const thisYear = new Date().getFullYear();
  const firstYear = Math.min(
    thisYear,
    ...experience.map((role) => Number(role.startDate.slice(0, 4)))
  );
  const featured = projects
    .filter((project) => project.featured)
    .slice(0, FEATURED_COUNT);
  const numberBySlug = new Map(
    projects.map((project, index) => [project.slug, index + 1])
  );
  const callouts = {
    "/projects": count(projects.length, "sheet", "sheets"),
    "/work": count(experience.length, "role", "roles"),
    "/lab": count(labExperiments.length, "study", "studies"),
    "/about": "General notes",
    "/ask": `${questions.total} answered`,
  };

  return (
    <Page>
      <Hero
        profile={profile}
        firstYear={firstYear}
        thisYear={thisYear}
        sheet={sheetOf("/")}
        total={lastSheet}
        rev={revOf(changelog[0]?.date ?? now.updatedAt)}
        callouts={callouts}
      />

      <Container className="grid gap-28 py-section sm:gap-36">
        <ExperienceSummary roles={experience} sheet={sheetOf("/work")} />
        <SelectedSheets
          projects={featured}
          numberBySlug={numberBySlug}
          sheet={sheetOf("/projects")}
        />
        <CurrentRevision
          now={now}
          question={questions.items[0] ?? null}
          sheet={sheetOf("/now")}
        />
      </Container>
    </Page>
  );
}
