import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/flavors/darkroom/components/home/hero";
import { FilmRoll } from "@/flavors/darkroom/components/roll/film-roll";
import { ContactSheet } from "@/flavors/darkroom/components/sheet/contact-sheet";
import { FrameList } from "@/flavors/darkroom/components/sheet/selects";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { actionLinkClass } from "@/flavors/darkroom/components/ui/link-class";
import { SectionHead } from "@/flavors/darkroom/components/ui/section-head";
import {
  contactSheet,
  development,
  filmRoll,
  ROLL,
  rollStrip,
} from "@/flavors/darkroom/lib/roll";
import { encodeBoard } from "@/flavors/darkroom/lib/scene/prints";

import { site } from "@/content/site";
import { getExperience, getProfile, getProjects, getSkills } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { pageMetadata } from "@/lib/metadata";

export const metadata: Metadata = pageMetadata({
  description: site.description,
  path: "/",
});

/** The contact print in the tray, the roll of roles right under it, then the whole sheet with its selects. */
export default async function HomePage() {
  const [profile, experience, projects, skills] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
  ]);
  const today = new Date();
  const frames = contactSheet(orderProjectsForCatalog(projects));
  const selects = frames.filter((frame) => frame.select);
  const strip = rollStrip(projects, experience, today);
  const current = experience.find((role) => !role.endDate);

  return (
    <Page>
      <Hero
        profile={profile}
        current={current}
        stack={skills[0]?.items.slice(0, 5) ?? []}
        strip={strip}
        board={encodeBoard(frames)}
        selects={selects.length}
      />

      <Container
        as="section"
        aria-labelledby="roll-heading"
        className="mt-[clamp(4rem,3rem+4vw,7rem)]"
      >
        <SectionHead
          id="roll-heading"
          kicker={`Roll ${ROLL} / ${experience.length} roles`}
          title="Experience"
          action={
            <Link href="/work" className={actionLinkClass}>
              The whole roll
            </Link>
          }
        />
        <FilmRoll
          frames={filmRoll(experience, today)}
          hrefFor={(id) => `/work#${id}`}
          className="mt-6"
        />
      </Container>

      <Container
        as="section"
        id="sheet"
        aria-labelledby="sheet-heading"
        className="mt-section scroll-mt-6"
      >
        <SectionHead
          id="sheet-heading"
          title="Contact sheet"
          size="title"
          aside={
            <span>
              Roll {ROLL} · {frames.length} frames · {selects.length} marked
            </span>
          }
          action={
            <Link href="/projects" className={actionLinkClass}>
              All {frames.length} frames
            </Link>
          }
        />
        <p className="flex flex-wrap gap-x-7 gap-y-2 pt-3.5 pb-8 edge">
          {(["maintained", "wip", "archived"] as const).map((status) => (
            <span key={status}>
              <b className="text-ink">{development[status].word}</b>{" "}
              {development[status].meaning.toLowerCase()}
            </span>
          ))}
        </p>
        <ContactSheet frames={frames} />
        <FrameList frames={selects} label="Marked frames" className="mt-16" />
      </Container>
    </Page>
  );
}
