import type { Metadata } from "next";
import {
  DepartureBoard,
  DepartureLegend,
} from "@/flavors/timetable/components/projects/departure-board";
import { Page } from "@/flavors/timetable/components/site/page";
import { Container, PageHeader } from "@/flavors/timetable/components/ui";
import {
  RowFilter,
  type RowFilterOption,
} from "@/flavors/timetable/components/ui/row-filter";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { stackSlug } from "@/lib/data/stack-slug";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

export default async function ProjectsPage() {
  const projects = await getProjects();
  const byYear = orderProjectsForCatalog(projects);
  const platforms = new Map<string, RowFilterOption>();
  for (const project of projects) {
    const label = project.stack[0] ?? "Web";
    const slug = stackSlug(label);
    const entry = platforms.get(slug) ?? { slug, label, count: 0 };
    entry.count++;
    platforms.set(slug, entry);
  }
  const options = [...platforms.values()].sort(
    (a, b) => b.count - a.count || a.label.localeCompare(b.label)
  );
  const active = projects.filter((p) => p.status !== "archived").length;

  return (
    <Page>
      <PageHeader
        platform="1"
        kicker="Departures"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Departures", value: String(projects.length) },
          { label: "In service", value: String(active) },
          { label: "Platforms", value: String(options.length) },
        ]}
        scene="projects"
        board={`${projects.length} departures|Point at a row`}
      />
      <Container className="mt-section">
        <RowFilter
          boardId="board"
          filterKey="platform"
          label="Filter departures by platform"
          allLabel="All platforms"
          options={options}
        />
        <DepartureBoard
          id="board"
          className="mt-6"
          title="All departures, by year started"
          projects={byYear}
          total={projects.length}
        />
        <DepartureLegend className="mt-5" />
      </Container>
    </Page>
  );
}
