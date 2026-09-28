import type { Metadata } from "next";
import { Hero } from "@/flavors/surface/components/home/hero";
import { NowAndAsk } from "@/flavors/surface/components/home/now-and-ask";
import { SectionHead } from "@/flavors/surface/components/home/section-head";
import { PresetModule } from "@/flavors/surface/components/projects/preset-module";
import { Page } from "@/flavors/surface/components/site/page";
import { KeyLink } from "@/flavors/surface/components/ui/primitives";
import { pad2, Seg } from "@/flavors/surface/components/ui/seg";
import { Multitrack } from "@/flavors/surface/components/work/multitrack";

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

const FEATURED = 4;

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

  const today = new Date();
  const since = Math.min(
    today.getFullYear(),
    ...projects.flatMap((project) =>
      project.year != null ? [project.year] : []
    )
  );
  const featured = projects
    .filter((project) => project.featured)
    .slice(0, FEATURED);
  const numberOf = new Map(projects.map((project, i) => [project.slug, i + 1]));
  const revision = (changelog[0]?.date ?? now.updatedAt)
    .slice(0, 7)
    .replace("-", ".");

  return (
    <Page>
      <Hero
        profile={profile}
        current={experience.find((role) => !role.endDate)}
        since={since}
        projects={projects.length}
        roles={experience.length}
        revision={revision}
      />

      <div className="grid gap-section px-4 pt-section md:px-6 lg:px-12">
        <section aria-labelledby="experience">
          <SectionHead
            id="experience"
            legend={["Channel 02", "Multitrack"]}
            title="Experience"
            aside={
              <KeyLink href="/work" className="justify-self-start">
                Every role in full
              </KeyLink>
            }
          />
          <Multitrack
            roles={experience}
            today={today}
            hrefFor={(role) => `/work#${role.id}`}
            className="mt-8"
          />
        </section>

        <section aria-labelledby="projects">
          <SectionHead
            id="projects"
            legend={["Channel 01", "Preset bank A"]}
            title="Selected projects"
            aside={
              <div className="glass flex items-end gap-4 justify-self-start px-3.5 pt-2 pb-2.5">
                <div>
                  <p className="legend mb-1.5 text-[0.5625rem]">Loaded</p>
                  <Seg value={pad2(featured.length)} className="h-8" />
                </div>
                <div>
                  <p className="legend mb-1.5 text-[0.5625rem]">Of</p>
                  <Seg value={pad2(projects.length)} className="h-8" />
                </div>
              </div>
            }
          />
          <ol className="mt-8 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((project) => (
              <li key={project.id}>
                <PresetModule
                  project={project}
                  number={numberOf.get(project.slug) ?? 0}
                />
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <KeyLink href="/projects">All {projects.length} presets</KeyLink>
          </div>
        </section>

        <NowAndAsk
          now={now}
          question={questions.items[0] ?? null}
          answered={questions.total}
        />
      </div>
    </Page>
  );
}
