import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/flavors/calibre/components/home/hero";
import { JewelCard } from "@/flavors/calibre/components/jewels/jewel-card";
import { StateLegend } from "@/flavors/calibre/components/jewels/state-pip";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { actionLinkClass } from "@/flavors/calibre/components/ui/link-class";
import {
  jewels,
  legend,
  serviceRecord,
  spell,
  technicalSheet,
} from "@/flavors/calibre/lib/movement";
import { encodeBoard } from "@/flavors/calibre/lib/scene/poses";

import { site } from "@/content/site";
import { getExperience, getProfile, getProjects, getSkills } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The catalogue spread, then the jewels set in view: the featured projects. */
export default async function HomePage() {
  const [profile, experience, projects, skills] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
  ]);
  const all = jewels(orderProjectsForCatalog(projects));
  const inView = all.filter((jewel) => jewel.inView);
  const sheet = technicalSheet(projects, skills);

  return (
    <Page>
      <Hero
        profile={profile}
        sheet={sheet}
        record={serviceRecord(experience, new Date())}
        board={encodeBoard({ jewels: all.length, lit: 0 })}
      />

      <Container
        as="section"
        id="jewels"
        aria-labelledby="jewels-heading"
        className="mt-section scroll-mt-6"
      >
        <div className="grid items-end gap-x-10 gap-y-5 border-b border-line-strong pb-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,5fr)_minmax(0,3.4fr)]">
          <p className="spec lg:pb-2">
            <span className="numeral-italic text-[1.0625rem] normal-case">
              II
            </span>{" "}
            · The jewels
          </p>
          <div>
            <h2 id="jewels-heading" className="text-h2">
              Selected <em>projects</em>
            </h2>
            <p className="mt-3 max-w-[40ch] text-soft">
              {capital(spell(all.length))} jewels in the movement, one per
              project. {capital(spell(inView.length))} are set in view here;
              each map shows where it sits among the {spell(all.length)}.
            </p>
          </div>
          <Link
            href="/projects"
            className={`${actionLinkClass} lg:justify-self-end`}
          >
            All {all.length} projects
          </Link>
        </div>
        <StateLegend
          statuses={legend(projects)}
          className="flex flex-wrap gap-x-8 gap-y-2 py-4 spec"
        />
        <ul className="mt-6 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-4">
          {inView.map((jewel) => (
            <li
              key={jewel.project.id}
              className="flex xl:border-l xl:border-line xl:pl-8 xl:first:border-0 xl:first:pl-0"
            >
              <JewelCard jewel={jewel} className="w-full" />
            </li>
          ))}
        </ul>
      </Container>
    </Page>
  );
}
