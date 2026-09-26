import type { Project } from "@/lib/data/types";
import { ProjectCard } from "@/components/projects/project-card";
import { ArrowLink, Section } from "@/components/ui";

export type SelectedWorkProps = {
  projects: Project[];
  numberBySlug: Map<string, number>;
};

/** The 3 featured projects, as large index cards, with an onward link to the full archive. */
export function SelectedWork({ projects, numberBySlug }: SelectedWorkProps) {
  if (projects.length === 0) return null;

  return (
    <Section id="selected-work" title="Selected work">
      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            number={numberBySlug.get(project.slug) ?? 0}
          />
        ))}
      </ul>
      <ArrowLink href="/projects" className="mt-8 inline-block">
        All projects
      </ArrowLink>
    </Section>
  );
}
