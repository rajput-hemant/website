import Link from 'next/link';
import { toPlainText } from '@portabletext/react';
import type { Metadata } from 'next';
import { Avatar } from '~/components/avatar';
import { PortableText } from '~/components/portable-text';
import { Footer } from '~/components/site/footer';
import { siteConfig } from '~/content/site';
import { getExperience, getNow, getProfile, getProjects } from '~/lib/data';

const fallbackHeadline = 'Software engineer';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  return {
    title: { absolute: profile?.name ?? siteConfig.name },
    description: profile?.bio?.length
      ? toPlainText(profile.bio).split(/(?<=\.)\s/)[0]
      : (profile?.headline ?? fallbackHeadline),
  };
}

export default async function Home() {
  const [profile, now, projects, experience] = await Promise.all([
    getProfile(),
    getNow(),
    getProjects(),
    getExperience(),
  ]);
  const featuredProjects = projects.filter((project) => project.featured);
  const featured = (
    featuredProjects.length ? featuredProjects : projects
  ).slice(0, 4);
  const links =
    profile?.links?.flatMap(({ _key, label, url }) =>
      label && url ? [{ _key, label, url }] : [],
    ) ?? [];

  return (
    <>
      <main className="flex flex-col gap-16 sm:gap-20">
        <section aria-labelledby="intro-title">
          <div className="flex items-center gap-3">
            <Avatar avatar={profile?.avatar ?? null} size={56} />
            <h1
              id="intro-title"
              className="font-serif text-3xl font-medium tracking-tight"
            >
              {profile?.headline ?? fallbackHeadline}
            </h1>
          </div>
          {profile?.bio?.length ? (
            <div className="prose text-fg-muted mt-6">
              <PortableText value={profile.bio} />
            </div>
          ) : null}
          {profile?.availability ? (
            <p className="text-fg-muted mt-6 font-mono text-xs">
              {profile.availability}
            </p>
          ) : null}
        </section>

        {now?.items?.length ? (
          <section
            aria-labelledby="now-title"
            className="border-rule border-t pt-7"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="now-title">Now</h2>
              <Link href="/now" className="quiet-link shrink-0 text-sm">
                More now <span aria-hidden="true">→</span>
              </Link>
            </div>
            {now.items[0]?.text ? (
              <p className="text-fg-muted mt-4">{now.items[0].text}</p>
            ) : null}
          </section>
        ) : null}

        {featured.length ? (
          <section
            aria-labelledby="projects-title"
            className="border-rule border-t pt-7"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="projects-title">Selected projects</h2>
              <Link href="/projects" className="quiet-link shrink-0 text-sm">
                All projects <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="mt-6 space-y-5">
              {featured.map((project) => {
                const href = project.live ?? project.github;

                return (
                  <li key={project._id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-base">
                        {href ? (
                          <a href={href} className="hover:text-accent">
                            {project.name} <span aria-hidden="true">↗</span>
                          </a>
                        ) : (
                          <Link
                            href={`/projects#${project.slug?.current ?? project._id}`}
                            className="hover:text-accent"
                          >
                            {project.name}
                          </Link>
                        )}
                      </h3>
                      {project.year ? (
                        <span className="text-fg-muted shrink-0 font-mono text-xs">
                          {project.year}
                        </span>
                      ) : null}
                    </div>
                    {project.tagline ? (
                      <p className="text-fg-muted mt-1">{project.tagline}</p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        {experience.length ? (
          <section
            aria-labelledby="experience-title"
            className="border-rule border-t pt-7"
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id="experience-title">Experience</h2>
              <Link href="/work" className="quiet-link shrink-0 text-sm">
                Full history <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="mt-6 space-y-5">
              {experience.slice(0, 3).map((role) => (
                <li
                  key={role._id}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-4"
                >
                  <Link
                    href={`/work#${role._id}`}
                    className="hover:text-accent"
                  >
                    {role.company}
                  </Link>
                  {role.startDate ? (
                    <span className="text-fg-muted font-mono text-xs">
                      {role.endDate
                        ? [
                            ...new Set([
                              role.startDate.slice(0, 4),
                              role.endDate.slice(0, 4),
                            ]),
                          ].join(' - ')
                        : `Since ${role.startDate.slice(0, 4)}`}
                    </span>
                  ) : null}
                  {role.title ? (
                    <p className="text-fg-muted col-span-2">{role.title}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {links.length ? (
          <section
            aria-labelledby="contact-title"
            className="border-rule border-t pt-7"
          >
            <h2 id="contact-title">Get in touch</h2>
            <p className="text-fg-muted mt-4">
              Find me elsewhere or say hello.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {links.map((link) => (
                <li key={link._key}>
                  <a href={link.url} className="text-link">
                    {link.label} <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer path="/" />
    </>
  );
}
