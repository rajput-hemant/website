import type { Metadata } from "next";
import Link from "next/link";
import { WeaveFocus } from "@/flavors/jacquard/components/draft/weave-focus";
import { Hero } from "@/flavors/jacquard/components/home/hero";
import { OnTheLoom } from "@/flavors/jacquard/components/home/on-the-loom";
import { SwatchCard } from "@/flavors/jacquard/components/projects/swatch-card";
import { Page } from "@/flavors/jacquard/components/site/page";
import { Container } from "@/flavors/jacquard/components/ui/container";
import { SectionHead } from "@/flavors/jacquard/components/ui/section-head";
import { Threads } from "@/flavors/jacquard/components/work/threads";
import { summarize } from "@/flavors/jacquard/lib/focus";
import {
  accessions,
  buildDraft,
  loomThreads,
  pickFor,
} from "@/flavors/jacquard/lib/weave";

import {
  getExperience,
  getNow,
  getProfile,
  getProjects,
  getQuestions,
  getSiteIdentity,
} from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return pageMetadata({
    description: site.description,
    path: "/",
  });
}

const SELECTED = 4;

/** The title page with the draft, the threads right under it, four swatches, then what is on the loom. */
export default async function HomePage() {
  const site = await getSiteIdentity();
  const [profile, experience, projects, now, questions] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getNow(),
    getQuestions({ page: 1, pageSize: 1 }),
  ]);
  const draft = buildDraft(projects);
  const numbers = accessions(projects, site.initials);
  const loom = loomThreads(experience, new Date());
  const selected = projects.filter((p) => p.featured).slice(0, SELECTED);
  const current = experience.find((role) => !role.endDate);

  return (
    <Page>
      <WeaveFocus summary={summarize(draft)} />
      <Hero
        profile={profile}
        current={current}
        draft={draft}
        total={projects.length}
      />

      <Container
        as="section"
        aria-labelledby="threads-heading"
        className="mt-section"
      >
        <SectionHead
          id="threads-heading"
          title="Experience"
          aside={`${loom.rows.length} roles · ${loom.threads} threads · ${loom.from} to now`}
        />
        <p className="mt-5 mb-10 max-w-[62ch] text-[1.0625rem] text-ink-soft">
          Each colour is one thread of work. When a team moved, I moved with it,
          so the thread carries on into the next role instead of ending.
        </p>
        <Threads loom={loom} hrefFor={(id) => `/work#${id}`} />
        <p className="mt-6">
          <Link
            href="/work"
            className="thread-link inline-flex min-h-11 items-center font-medium"
          >
            Every role, thread by thread
          </Link>
        </p>
      </Container>

      <Container
        as="section"
        aria-labelledby="projects-heading"
        className="mt-section"
      >
        <SectionHead
          id="projects-heading"
          title="Selected projects"
          aside={`Swatch book · ${selected.length} of ${projects.length}`}
        />
        <p className="mt-5 mb-12 max-w-[62ch] text-[1.0625rem] text-ink-soft">
          Each swatch is woven from its project&rsquo;s own pick in the draft,
          stepped one end per row the way a twill steps. The colours are the
          kinds of technology it uses, so a full stack reads as a broad band and
          a small tool as a few fine lines.
        </p>
        <ol className="grid gap-x-7 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          {selected.map((project) => (
            <li key={project.id}>
              <SwatchCard
                project={project}
                draft={draft}
                pick={pickFor(draft, project.slug)}
                accession={numbers.get(project.slug) ?? ""}
              />
            </li>
          ))}
        </ol>
        <p className="mt-12 border-t border-rule pt-4">
          <Link
            href="/projects"
            className="thread-link inline-flex min-h-11 items-center font-medium"
          >
            The whole swatch book, all {projects.length} projects
          </Link>
        </p>
      </Container>

      <Container className="mt-section">
        <OnTheLoom now={now} question={questions.items[0] ?? null} />
      </Container>
    </Page>
  );
}
