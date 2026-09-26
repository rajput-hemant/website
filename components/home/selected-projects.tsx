import type { Project } from "@/lib/data/types";
import { ProjectList } from "@/components/projects/project-list";

import { HomeSection } from "./home-section";

const MAX_PROJECTS = 4;

/** Featured projects as one-line rows that open in place. */
export function SelectedProjects({ projects }: { projects: Project[] }) {
  const selected = projects.filter((p) => p.featured).slice(0, MAX_PROJECTS);
  if (selected.length === 0) return null;

  return (
    <HomeSection
      id="selected"
      title="Selected"
      link={{ href: "/projects", label: "All projects" }}
      className="mt-10 sm:mt-14"
    >
      <ProjectList projects={selected} />
    </HomeSection>
  );
}
