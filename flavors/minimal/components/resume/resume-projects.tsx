import { type Project } from "@/lib/data/types";
import { displayUrl } from "@/lib/url";

import { ResumeLink } from "./resume-link";
import styles from "./resume.module.css";

export function ResumeProjects({ projects }: { projects: Project[] }) {
  return (
    <ul className="space-y-5 print:space-y-3.5">
      {projects.map((project) => {
        const url = project.live ?? project.github;
        return (
          <li key={project.id} className={styles.keep}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
              <h3 className="font-semibold text-foreground">{project.name}</h3>
              {url && (
                <ResumeLink href={url} className="text-sm text-subtle">
                  {displayUrl(url)}
                </ResumeLink>
              )}
            </div>
            <p className="mt-0.5 text-[0.9375rem] text-muted">
              {project.tagline}
            </p>
            {project.stack.length > 0 && (
              <p className="mt-1 text-sm text-subtle">
                {project.stack.join(" · ")}
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
