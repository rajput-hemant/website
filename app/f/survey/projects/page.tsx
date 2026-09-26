import type { Metadata } from "next";
import { conditions } from "@/flavors/survey/components/projects/conditions";
import { Gazetteer } from "@/flavors/survey/components/projects/gazetteer";
import { Page } from "@/flavors/survey/components/site/page";
import { Container } from "@/flavors/survey/components/ui/container";
import { PageHeader } from "@/flavors/survey/components/ui/page-header";
import { RowFilter } from "@/flavors/survey/components/ui/row-filter";
import { getRelief } from "@/flavors/survey/lib/sheet";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import type { ProjectStatus } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

const ORDER: ProjectStatus[] = ["active", "maintained", "wip", "archived"];

/** The full gazetteer: every surveyed site in grid order, filtered by condition. */
export default async function ProjectsPage() {
  const [projects, relief] = await Promise.all([getProjects(), getRelief()]);
  const options = ORDER.map((status) => ({
    slug: status,
    label: conditions[status].label,
    count: projects.filter((p) => p.status === status).length,
  })).filter((o) => o.count > 0);
  const years = new Set(projects.map((p) => p.year));

  return (
    <Page>
      <PageHeader
        kicker="Gazetteer"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Sites", value: String(projects.length) },
          {
            label: "Maintained",
            value: String(
              projects.filter(
                (p) => p.status !== "archived" && p.status !== "wip"
              ).length
            ),
          },
          { label: "Grid columns", value: String(years.size) },
        ]}
        scene={{ relief, route: "projects" }}
      />
      <Container className="mt-section">
        <p className="caps flex flex-wrap gap-x-8 gap-y-1 text-ink-faint">
          <span>Grid ref: year, then northing</span>
          <span>Rows 00 to 04: own work</span>
        </p>
        <RowFilter
          boardId="gazetteer"
          filterKey="condition"
          label="Filter sites by condition"
          allLabel="All sites"
          options={options}
          className="mt-5"
        />
        <Gazetteer
          id="gazetteer"
          relief={relief}
          projects={projects}
          className="mt-6"
        />
      </Container>
    </Page>
  );
}
