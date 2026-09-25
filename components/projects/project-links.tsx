import { type Project } from "@/lib/data/types";
import { cn } from "@/lib/utils";
import { ExternalLink } from "@/components/ui/external-link";

/** The project's source and live links; each names its project for screen readers. */
export function ProjectLinks({
  project,
  className,
}: {
  project: Pick<Project, "name" | "github" | "live">;
  className?: string;
}) {
  if (!project.github && !project.live) return null;

  return (
    <ul className={cn("flex items-center gap-x-5", className)}>
      {project.github && (
        <li>
          <ExternalLink href={project.github}>
            GitHub
            <span className="sr-only"> repository for {project.name}</span>
          </ExternalLink>
        </li>
      )}
      {project.live && (
        <li>
          <ExternalLink href={project.live}>
            Live
            <span className="sr-only"> site for {project.name}</span>
          </ExternalLink>
        </li>
      )}
    </ul>
  );
}
