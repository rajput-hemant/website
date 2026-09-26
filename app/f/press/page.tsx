import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/flavors/press/components/home/hero";
import { LatestProof } from "@/flavors/press/components/home/latest-proof";
import { ProofCard } from "@/flavors/press/components/projects/proof-card";
import { Page } from "@/flavors/press/components/site/page";
import { Container } from "@/flavors/press/components/ui/container";
import { SectionHead } from "@/flavors/press/components/ui/section-head";
import { PressLog } from "@/flavors/press/components/work/press-log";
import { pressLog } from "@/flavors/press/lib/proof";

import { site } from "@/content/site";
import {
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
  getSkills,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const SELECTED = 4;

/** The title sheet, the press log right under it, four signatures, then the latest proof. */
export default async function HomePage() {
  const [profile, experience, projects, now, questions, skills] =
    await Promise.all([
      getProfile(),
      getExperience(),
      getProjects(),
      getNow(),
      getQuestions({ page: 1, pageSize: 1 }),
      getSkills(),
    ]);
  const log = pressLog(experience, new Date());
  const selected = projects.filter((p) => p.featured).slice(0, SELECTED);
  const current = experience.find((role) => !role.endDate);

  return (
    <Page>
      <Hero profile={profile} current={current} skills={skills} />

      <Container className="mt-[clamp(3rem,2rem+3vw,5rem)]">
        <section aria-labelledby="log-heading">
          <SectionHead
            id="log-heading"
            kicker="Sheet 03 / Press log"
            title="Experience"
            size="h2"
            action={
              <Link
                href="/work"
                className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em] fine:hover:decoration-blue"
              >
                The full press log
              </Link>
            }
          />
          <PressLog
            className="mt-6"
            log={log}
            hrefFor={(id) => `/work#${id}`}
          />
        </section>
      </Container>

      <Container className="mt-section">
        <section aria-labelledby="projects-heading">
          <SectionHead
            id="projects-heading"
            kicker="Sheet 02 / Signatures"
            title="Selected projects"
            aside={
              <>
                <span>
                  <b className="font-semibold text-ink">
                    {selected.length} of {projects.length}
                  </b>{" "}
                  on this sheet
                </span>
                <span>
                  In print = maintained &nbsp;/&nbsp; Proofing = in progress
                  &nbsp;/&nbsp; Out of print = archived
                </span>
              </>
            }
          />
          <ul className="mt-16 grid gap-x-16 gap-y-20 px-3.5 md:grid-cols-2">
            {selected.map((project) => (
              <li key={project.id}>
                <ProofCard
                  project={project}
                  sig={projects.indexOf(project) + 1}
                />
              </li>
            ))}
          </ul>
          <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-4">
            <span className="slug">
              Progressive proof on each signature: P1, then P2, then both in
              register
            </span>
            <Link
              href="/projects"
              className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.3em] fine:hover:decoration-blue"
            >
              All {projects.length} projects
            </Link>
          </div>
        </section>
      </Container>

      <Container className="mt-section">
        <LatestProof now={now} question={questions.items[0] ?? null} />
      </Container>
    </Page>
  );
}
