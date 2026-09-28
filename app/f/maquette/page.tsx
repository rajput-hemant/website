import type { Metadata } from "next";
import Link from "next/link";
import { Hero } from "@/flavors/maquette/components/home/hero";
import { PieceGrid } from "@/flavors/maquette/components/model/piece-grid";
import { MaterialLegend } from "@/flavors/maquette/components/model/vitrine";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { linkClass } from "@/flavors/maquette/components/ui/link-class";
import {
  encodeBoard,
  phasingPlan,
  pieces,
  sitePlan,
} from "@/flavors/maquette/lib/model";

import {
  getExperience,
  getProfile,
  getProjects,
  getSiteIdentity,
} from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { pageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteIdentity();
  return pageMetadata({
    description: site.description,
    path: "/",
  });
}

const NUMBERS = [
  "no",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

/** The model room: the site model and its studies, then the featured pieces in their vitrines. */
export default async function HomePage() {
  const [profile, experience, projects] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
  ]);
  const today = new Date();
  const all = pieces(orderProjectsForCatalog(projects), today);
  const featured = all.filter((piece) => piece.featured);
  const rest = all.filter((piece) => !piece.featured);
  const more = rest.length - 1;

  return (
    <Page>
      <Hero
        profile={profile}
        featured={featured}
        total={all.length}
        plan={phasingPlan(experience, today)}
        board={encodeBoard(sitePlan(all))}
        pins={all.map((piece) => ({
          id: piece.project.slug,
          n: piece.n,
          name: piece.project.name,
        }))}
        month={today.toLocaleDateString("en-GB", {
          month: "long",
          year: "numeric",
        })}
      />

      <Container
        as="section"
        id="pieces"
        aria-labelledby="pieces-heading"
        className="mt-section scroll-mt-6"
      >
        <div className="grid items-end gap-x-6 gap-y-4.5 pb-10 lg:grid-cols-12">
          <p className="caps lg:col-span-12">
            On the plinth · {featured.length} of {all.length}
          </p>
          <h2 id="pieces-heading" className="text-title lg:col-span-5">
            Selected pieces
          </h2>
          <div className="grid gap-4.5 lg:col-span-6 lg:col-start-7">
            <p className="max-w-[60ch] text-soft">
              Every piece is cut to one rule.{" "}
              <b className="font-semibold text-ink">Height</b> is one storey per
              year since the first commit.{" "}
              <b className="font-semibold text-ink">Footprint</b> is one bay per
              technology in the stack.{" "}
              <b className="font-semibold text-ink">Material</b> is state. Each
              drawing pairs an elevation with a plan, and the plan shadows
              follow the same sun as the model above.
            </p>
            <MaterialLegend />
          </div>
        </div>
        <PieceGrid pieces={featured} />
        {rest[0] ? (
          <p className="mt-9 text-sm text-soft">
            {rest[0].project.name}
            {more > 0
              ? ` and ${NUMBERS[more] ?? String(more)} more stand`
              : " stands"}{" "}
            on the model as foam context blocks.{" "}
            <Link href="/projects" className={`text-ink ${linkClass}`}>
              Open the full catalogue of {all.length}
            </Link>
          </p>
        ) : null}
      </Container>
    </Page>
  );
}
