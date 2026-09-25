import { type Project } from "@/lib/data/types";
import { RevealGroup, RevealItem } from "@/components/interaction/reveal";

import { ProjectItem } from "./project-item";

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <RevealGroup
      as="ol"
      className="divide-y divide-border border-t border-border"
    >
      {projects.map((project) => (
        <RevealItem as="li" key={project.id}>
          <ProjectItem project={project} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
