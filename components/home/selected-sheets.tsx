import type { Project } from "@/lib/data/types";
import { ProjectSheet } from "@/components/projects/project-sheet";
import { ArrowLink, SheetHeading } from "@/components/ui";

/** The featured projects as large sheet previews, then the way to the full register. */
export function SelectedSheets({
  projects,
  numberBySlug,
  sheet,
}: {
  projects: Project[];
  numberBySlug: Map<string, number>;
  sheet: string;
}) {
  if (projects.length === 0) return null;

  return (
    <section aria-labelledby="selected-sheets">
      <SheetHeading
        id="selected-sheets"
        n={`Sheet ${sheet}`}
        title="Selected sheets"
        aside={`${numberBySlug.size} drawings`}
      />
      <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <li key={project.id}>
            <ProjectSheet
              project={project}
              number={numberBySlug.get(project.slug) ?? 0}
            />
          </li>
        ))}
      </ul>
      <ArrowLink href="/projects" className="mt-8">
        Open the register
      </ArrowLink>
    </section>
  );
}
