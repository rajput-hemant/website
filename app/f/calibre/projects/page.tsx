import type { Metadata } from "next";
import { JewelCard } from "@/flavors/calibre/components/jewels/jewel-card";
import { StateLegend } from "@/flavors/calibre/components/jewels/state-pip";
import { Page } from "@/flavors/calibre/components/site/page";
import { Container } from "@/flavors/calibre/components/ui/container";
import { PageHeader } from "@/flavors/calibre/components/ui/page-header";
import { SectionHead } from "@/flavors/calibre/components/ui/section-head";
import {
  bezelPrints,
  jewels,
  jewelTags,
  legend,
  states,
} from "@/flavors/calibre/lib/movement";
import { encodeBoard } from "@/flavors/calibre/lib/scene/poses";

import { sitePage } from "@/content/site";
import { getProfile, getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

/** The jewel register: every jewel in the movement, gathered by its state. */
export default async function ProjectsPage() {
  const [projects, profile] = await Promise.all([getProjects(), getProfile()]);
  const all = jewels(orderProjectsForCatalog(projects));
  const groups = legend(projects).map((status) => ({
    status,
    jewels: all.filter((jewel) => jewel.project.status === status),
  }));

  return (
    <Page>
      <PageHeader
        hour={0}
        kicker="Jewel register"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Jewels", value: `${all.length} projects` },
          {
            label: "Set in view",
            value: String(all.filter((jewel) => jewel.inView).length),
          },
          {
            label: "In service",
            value: String(
              all.filter((jewel) => jewel.project.status !== "archived").length
            ),
          },
        ]}
        scene="projects"
        board={encodeBoard({ jewels: all.length, lit: 0 })}
        tags={jewelTags(all)}
        prints={bezelPrints(all.length, profile.location)}
      />
      <Container className="mt-section">
        <StateLegend
          statuses={legend(projects)}
          className="flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 spec"
        />
      </Container>
      <Container className="mt-16 grid gap-section">
        {groups.map((group) => (
          <section key={group.status} aria-labelledby={`state-${group.status}`}>
            <SectionHead
              id={`state-${group.status}`}
              kicker={states[group.status].meaning}
              title={states[group.status].word}
              size="h3"
              aside={`${group.jewels.length} ${group.jewels.length === 1 ? "jewel" : "jewels"}`}
            />
            <ul className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
              {group.jewels.map((jewel) => (
                <li key={jewel.project.id} className="flex">
                  <JewelCard jewel={jewel} className="w-full" />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Container>
    </Page>
  );
}
