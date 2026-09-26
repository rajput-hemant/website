import type { Metadata } from "next";
import { ProjectRegister } from "@/flavors/drawing-set/components/projects/project-register";
import { ProjectSheet } from "@/flavors/drawing-set/components/projects/project-sheet";
import { sheetOf } from "@/flavors/drawing-set/components/projects/sheet";
import { StampLegend } from "@/flavors/drawing-set/components/projects/status-stamp";
import { Page, SceneSlot } from "@/flavors/drawing-set/components/site";
import {
  Container,
  PageHeader,
  SheetHeading,
} from "@/flavors/drawing-set/components/ui";

import { sitePage } from "@/content/site";
import { getProjects } from "@/lib/data";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/projects");

export const metadata: Metadata = pageMetadata(page);

export default async function ProjectsPage() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);

  return (
    <Page>
      <PageHeader
        sheet={sheetOf("/projects")}
        eyebrow="Drawing register"
        title={page.title}
        lede={page.description}
        meta={[
          { label: "Drawings", value: String(projects.length) },
          { label: "Selected", value: String(featured.length) },
        ]}
      />
      <SceneSlot route="projects" size="window" />

      <Container className="py-section">
        {featured.length > 0 && (
          <section aria-labelledby="selected">
            <SheetHeading
              id="selected"
              n="Selected"
              title="Selected sheets"
              aside={`${featured.length} of ${projects.length}`}
            />
            <ul className="mt-10 grid gap-8 sm:grid-cols-2">
              {featured.map((project) => (
                <li key={project.id}>
                  <ProjectSheet
                    project={project}
                    number={projects.indexOf(project) + 1}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section aria-labelledby="register" className="mt-24 sm:mt-32">
          <SheetHeading
            id="register"
            n={`Sheet ${sheetOf("/projects")}`}
            title="Drawing register"
            aside={`${projects.length} drawings · ${featured.length} selected`}
          />
          <StampLegend className="mt-4 md:pl-[120px]" />
          <div className="mt-8">
            <ProjectRegister projects={projects} />
          </div>
        </section>
      </Container>
    </Page>
  );
}
