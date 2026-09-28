import type { Metadata } from "next";
import { PieceGrid } from "@/flavors/maquette/components/model/piece-grid";
import { MaterialLegend } from "@/flavors/maquette/components/model/vitrine";
import { Page } from "@/flavors/maquette/components/site/page";
import { Container } from "@/flavors/maquette/components/ui/container";
import { PageHeader } from "@/flavors/maquette/components/ui/page-header";
import { SectionHead } from "@/flavors/maquette/components/ui/section-head";
import {
  encodeBoard,
  finishes,
  pieces,
  sitePlan,
} from "@/flavors/maquette/lib/model";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import type { ProjectStatus } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata(page);
}

const STATES: ProjectStatus[] = ["active", "maintained", "wip", "archived"];

/** Every piece on the plinth in its own material, then each in its vitrine, gathered by what it is cut from. */
export default async function ProjectsPage() {
  const all = pieces(orderProjectsForCatalog(await getProjects()), new Date());
  const storeys = all.reduce((sum, p) => sum + p.storeys, 0);
  const bays = all.reduce((sum, p) => sum + p.bays, 0);
  const groups = STATES.map((status) => ({
    status,
    pieces: all.filter((piece) => piece.project.status === status),
  })).filter((group) => group.pieces.length > 0);

  return (
    <Page>
      <PageHeader
        frame="01"
        kicker="Vitrines"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Pieces", value: String(all.length) },
          { label: "Storeys", value: String(storeys) },
          { label: "Bays", value: String(bays) },
        ]}
        scene="projects"
        board={encodeBoard(sitePlan(all, { allFinished: true }))}
        pins={all.map((piece) => ({
          id: piece.project.slug,
          n: piece.n,
          name: piece.project.name,
        }))}
        sceneLabel={`All ${all.length} pieces in their own material`}
      >
        <MaterialLegend className="mt-6" />
      </PageHeader>
      <Container className="mt-section grid gap-section">
        {groups.map((group) => (
          <section key={group.status} aria-labelledby={`state-${group.status}`}>
            <SectionHead
              id={`state-${group.status}`}
              kicker={finishes[group.status].word}
              title={finishes[group.status].meaning}
              size="h3"
              aside={`${group.pieces.length} ${group.pieces.length === 1 ? "piece" : "pieces"}`}
              className="mb-8"
            />
            <PieceGrid
              pieces={group.pieces}
              label={`${finishes[group.status].meaning} pieces`}
            />
          </section>
        ))}
      </Container>
    </Page>
  );
}
