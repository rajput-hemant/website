import type { Metadata } from "next";
import { ContactSheet } from "@/flavors/darkroom/components/sheet/contact-sheet";
import { FrameList } from "@/flavors/darkroom/components/sheet/selects";
import { Page } from "@/flavors/darkroom/components/site/page";
import { Container } from "@/flavors/darkroom/components/ui/container";
import { PageHeader } from "@/flavors/darkroom/components/ui/page-header";
import { SectionHead } from "@/flavors/darkroom/components/ui/section-head";
import { contactSheet, development } from "@/flavors/darkroom/lib/roll";
import { encodeBoard } from "@/flavors/darkroom/lib/scene/prints";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { orderProjectsForCatalog } from "@/lib/data/project-order";
import type { ProjectStatus } from "@/lib/data/types";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

const STAGES: ProjectStatus[] = ["active", "maintained", "wip", "archived"];

/** The whole roll on one contact sheet, then every frame as a row, gathered by how far it has developed. */
export default async function ProjectsPage() {
  const frames = contactSheet(orderProjectsForCatalog(await getProjects()));
  const selects = frames.filter((frame) => frame.select).length;
  const groups = STAGES.map((status) => ({
    status,
    frames: frames.filter((frame) => frame.project.status === status),
  })).filter((group) => group.frames.length > 0);

  return (
    <Page>
      <PageHeader
        frame="01"
        kicker="Contact sheet"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Frames", value: String(frames.length) },
          { label: "Marked", value: `${selects} selects` },
          {
            label: "Still fixed",
            value: String(
              frames.filter((f) => f.project.status !== "archived").length
            ),
          },
        ]}
        scene="projects"
        board={encodeBoard(frames)}
      />
      <Container className="mt-section">
        <ContactSheet frames={frames} />
      </Container>
      <Container className="mt-section grid gap-section">
        {groups.map((group) => (
          <section key={group.status} aria-labelledby={`stage-${group.status}`}>
            <SectionHead
              id={`stage-${group.status}`}
              kicker={development[group.status].meaning}
              title={development[group.status].word}
              size="h3"
              aside={`${group.frames.length} ${group.frames.length === 1 ? "frame" : "frames"}`}
              className="border-b-0"
            />
            <FrameList
              frames={group.frames}
              label={`${development[group.status].word} frames`}
            />
          </section>
        ))}
      </Container>
    </Page>
  );
}
