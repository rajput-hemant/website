import type { Metadata } from 'next';
import { PortableText } from '~/components/portable-text';
import { Footer } from '~/components/site/footer';
import { getProjects, type Project } from '~/lib/data';

export const metadata: Metadata = {
  title: 'Projects',
  description:
    'Open-source projects and experiments, with source and live links.',
};

const statusLabels = {
  active: 'Active',
  maintained: 'Maintained',
  archived: 'Archived',
  wip: 'In progress',
} satisfies Record<NonNullable<Project['status']>, string>;

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <>
      <main className="flex flex-col gap-12">
        <h1>Projects</h1>
        <ul className="flex flex-col gap-12">
          {projects.map((project) => (
            <li key={project._id}>
              <ProjectEntry project={project} />
            </li>
          ))}
        </ul>
      </main>
      <Footer path="/projects" />
    </>
  );
}

function ProjectEntry({ project }: { project: Project }) {
  const meta = [
    project.year,
    project.status ? statusLabels[project.status] : null,
  ].filter(Boolean);
  const [lead, ...rest] = project.description ?? [];
  const links = [
    { label: 'Source', href: project.github },
    { label: 'Live', href: project.live },
  ].flatMap(({ label, href }) => (href ? [{ label, href }] : []));

  return (
    <article className="flex flex-col gap-3">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h2 className="text-lg">{project.name}</h2>
          {meta.length > 0 ? (
            <p className="text-fg-muted font-mono text-xs">
              {meta.join(' · ')}
            </p>
          ) : null}
        </div>
        {project.tagline ? (
          <p className="text-fg-muted">{project.tagline}</p>
        ) : null}
      </div>
      {lead ? (
        <div className="prose">
          <PortableText value={[lead]} />
          {rest.length > 0 ? (
            <details>
              <summary className="quiet-link cursor-pointer text-sm">
                More about {project.name}
              </summary>
              <div className="prose mt-4">
                <PortableText value={rest} />
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
      {project.stack && project.stack.length > 0 ? (
        <ul
          aria-label="Stack"
          className="text-fg-muted flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs"
        >
          {project.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>
      ) : null}
      {links.length > 0 ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className="quiet-link">
                {link.label}
                <span className="sr-only"> for {project.name}</span>
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
