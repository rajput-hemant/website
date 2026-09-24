import Link from 'next/link';
import type { Metadata } from 'next';
import { Avatar } from '~/components/avatar';
import { PortableText } from '~/components/portable-text';
import { Footer } from '~/components/site/footer';
import { siteConfig } from '~/content/site';
import { getExperience, getNow, getProfile, getProjects } from '~/lib/data';

export async function generateMetadata(): Promise<Metadata> {
  const profile = await getProfile();

  return {
    title: { absolute: profile?.name ?? siteConfig.name },
    description:
      profile?.headline ?? 'Software engineer. Work, projects and notes.',
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

  return (
    <>
      <main className="flex flex-col gap-16 sm:gap-20">
        <section aria-labelledby="intro-title">
          <p className="text-fg-muted mb-5 font-mono text-xs tracking-widest uppercase">
            Hello, I’m
          </p>
          <div className="flex items-center gap-3">
            <Avatar avatar={profile?.avatar ?? null} size={56} />
            <h1
              id="intro-title"
              className="font-serif text-3xl font-medium tracking-tight"
            >
              {profile?.name ?? siteConfig.name}
            </h1>
          </div>
          {profile?.headline ? (
            <p className="mt-7 text-xl leading-snug">{profile.headline}</p>
          ) : null}
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
                More now ↗
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
                All projects ↗
              </Link>
            </div>
            <ul className="mt-6 space-y-6">
              {featured.map((project) => (
                <li
                  key={project._id}
                  className="border-rule border-b pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-base">
                      <a
                        href={
                          project.live ??
                          project.github ??
                          `/projects#${project.slug?.current ?? project._id}`
                        }
                        className="hover:text-accent"
                      >
                        {project.name} <span aria-hidden="true">↗</span>
                      </a>
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
              ))}
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
                Full history ↗
              </Link>
            </div>
            <ul className="mt-6 space-y-5">
              {experience.slice(0, 3).map((role) => (
                <li
                  key={role._id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1"
                >
                  <p>
                    <Link
                      href={`/work#${role._id}`}
                      className="hover:text-accent"
                    >
                      {role.company}
                    </Link>{' '}
                    <span className="text-fg-muted">· {role.title}</span>
                  </p>
                  {role.startDate ? (
                    <span className="text-fg-muted font-mono text-xs">
                      {role.startDate.slice(0, 4)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {profile?.links?.length ? (
          <section
            aria-labelledby="contact-title"
            className="border-rule border-t pt-7"
          >
            <h2 id="contact-title">Get in touch</h2>
            <p className="text-fg-muted mt-4">
              Find me elsewhere or say hello.
            </p>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
              {profile.links
                .filter((link) => link.label && link.url)
                .map((link) => (
                  <li key={link._key}>
                    <a
                      href={link.url ?? '#'}
                      className="text-fg hover:text-accent underline underline-offset-4"
                    >
                      {link.label} ↗
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
