import type { Metadata } from 'next';
import { Avatar } from '~/components/avatar';
import { PortableText } from '~/components/portable-text';
import { PrintButton } from '~/components/print-button';
import { Footer } from '~/components/site/footer';
import {
  getEducation,
  getExperience,
  getProfile,
  getProjects,
  getSkills,
  type ExperienceRole,
} from '~/lib/data';
import { formatDate } from '~/lib/format';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Experience, projects, skills and education on one page.',
};

function displayUrl(url: string) {
  return url.replace(/^(mailto:|https?:\/\/(www\.)?)/, '').replace(/\/$/, '');
}

function formatMonth(isoDate: string) {
  return formatDate(isoDate, { month: 'short', year: 'numeric' });
}

export default async function ResumePage() {
  const [profile, experience, projects, skills, education] = await Promise.all([
    getProfile(),
    getExperience(),
    getProjects(),
    getSkills(),
    getEducation(),
  ]);
  const links = (profile?.links ?? []).flatMap(({ _key, url }) =>
    url ? [{ _key, url }] : [],
  );

  return (
    <>
      <main className="resume flex flex-col gap-12 print:gap-6">
        <header className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <h1>{profile?.name}</h1>
            {profile?.headline ? (
              <p className="text-fg-muted text-lg">{profile.headline}</p>
            ) : null}
            <ul className="text-fg-muted flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {profile?.location ? <li>{profile.location}</li> : null}
              {links.map((link) => (
                <li key={link._key}>
                  <a href={link.url} className="quiet-link">
                    {displayUrl(link.url)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <Avatar avatar={profile?.avatar ?? null} size={72} />
        </header>

        <div className="-mt-4 print:hidden">
          <PrintButton />
        </div>

        {experience.length > 0 ? (
          <ResumeSection title="Experience">
            {experience.map((role) => (
              <RoleEntry key={role._id} role={role} />
            ))}
          </ResumeSection>
        ) : null}

        {projects.length > 0 ? (
          <ResumeSection title="Projects">
            <ul className="flex flex-col gap-3 print:grid print:grid-cols-2 print:gap-x-6">
              {projects.map((project) => {
                const href = project.github ?? project.live;
                return (
                  <li key={project._id} className="break-inside-avoid">
                    <p>
                      <span className="font-semibold">{project.name}</span>
                      {project.tagline ? (
                        <span className="text-fg-muted">
                          {' '}
                          - {project.tagline}
                        </span>
                      ) : null}
                    </p>
                    {href ? (
                      <a
                        href={href}
                        className="quiet-link font-mono text-xs break-all"
                      >
                        {displayUrl(href)}
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </ResumeSection>
        ) : null}

        {skills.length > 0 ? (
          <ResumeSection title="Skills">
            <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr] print:grid-cols-[auto_1fr]">
              {skills.map((group) => (
                <div key={group._id} className="contents">
                  <dt className="font-semibold">{group.title}</dt>
                  <dd className="text-fg-muted mb-2 sm:mb-0 print:mb-0">
                    {group.items?.join(', ')}
                  </dd>
                </div>
              ))}
            </dl>
          </ResumeSection>
        ) : null}

        {education.length > 0 ? (
          <ResumeSection title="Education">
            {education.map((entry) => (
              <article key={entry._id} className="break-inside-avoid">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <h3 className="text-base">{entry.institution}</h3>
                  <p className="text-fg-muted font-mono text-xs">
                    {[...new Set([entry.startYear, entry.endYear])]
                      .filter(Boolean)
                      .join(' – ')}
                  </p>
                </div>
                <p className="text-fg-muted">
                  {[entry.degree, entry.score, entry.location]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </article>
            ))}
          </ResumeSection>
        ) : null}

        {profile?.resumeNote ? (
          <p className="text-fg-muted text-sm">{profile.resumeNote}</p>
        ) : null}
      </main>
      <Footer path="/resume" />
    </>
  );
}

function ResumeSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = title.toLowerCase();

  return (
    <section aria-labelledby={id} className="flex flex-col gap-6 print:gap-4">
      <h2
        id={id}
        className="text-fg-muted border-rule border-b pb-2 font-mono text-xs font-normal tracking-wider uppercase"
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function RoleEntry({ role }: { role: ExperienceRole }) {
  const dates = [
    role.startDate ? formatMonth(role.startDate) : null,
    role.endDate ? formatMonth(role.endDate) : 'Present',
  ]
    .filter(Boolean)
    .join(' – ');
  const meta = [
    role.location,
    role.remote ? 'Remote' : null,
    role.employmentType,
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-2">
      <div className="flex break-inside-avoid break-after-avoid flex-col gap-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <h3 className="text-base">
            {role.title}
            {role.company ? (
              <>
                {', '}
                {role.companyUrl ? (
                  <a href={role.companyUrl} className="hover:text-accent">
                    {role.company}
                  </a>
                ) : (
                  role.company
                )}
              </>
            ) : null}
          </h3>
          <p className="text-fg-muted font-mono text-xs">{dates}</p>
        </div>
        {meta.length > 0 ? (
          <p className="text-fg-muted text-sm">{meta.join(' · ')}</p>
        ) : null}
      </div>
      {role.body ? (
        <div className="prose">
          <PortableText value={role.body} />
        </div>
      ) : null}
      {role.highlights && role.highlights.length > 0 ? (
        <div className="prose">
          <ul>
            {role.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
