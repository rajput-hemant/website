import { PortableText } from '~/components/portable-text';
import type { ExperienceRole } from '~/lib/data';

function month(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

export function ExperienceEntry({ role }: { role: ExperienceRole }) {
  const details = [
    role.location,
    role.remote ? 'Remote' : null,
    role.employmentType,
    role.startDate
      ? `${month(role.startDate)} - ${role.endDate ? month(role.endDate) : 'Present'}`
      : null,
  ].filter(Boolean);

  return (
    <article id={role._id} className="border-rule scroll-mt-8 border-t pt-7">
      <h2 className="text-lg leading-snug">
        {role.companyUrl ? (
          <a className="hover:text-accent" href={role.companyUrl}>
            {role.company}
          </a>
        ) : (
          role.company
        )}
      </h2>
      {role.title ? <p className="mt-1">{role.title}</p> : null}
      {details.length ? (
        <p className="text-fg-muted mt-2 font-mono text-xs">
          {details.join(' · ')}
        </p>
      ) : null}
      {role.body?.length ? (
        <div className="prose mt-5">
          <PortableText value={role.body} />
        </div>
      ) : null}
      {role.highlights?.length ? (
        <ul className="mt-5 list-disc space-y-2 pl-5">
          {role.highlights.map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}
      {role.continuedInto || role.continuedFrom ? (
        <p className="text-fg-muted mt-5 text-sm">
          {role.continuedFrom ? (
            <>
              Continued from{' '}
              <a
                className="text-fg hover:text-accent underline underline-offset-4"
                href={`#${role.continuedFrom._id}`}
              >
                {role.continuedFrom.company}
              </a>
            </>
          ) : (
            <>
              Continued into{' '}
              <a
                className="text-fg hover:text-accent underline underline-offset-4"
                href={`#${role.continuedInto?._id}`}
              >
                {role.continuedInto?.company}
              </a>
            </>
          )}
          {role.continuationNote ? ` · ${role.continuationNote}` : null}
        </p>
      ) : null}
      {role.endNote ? (
        <p className="text-fg-muted mt-2 text-sm">{role.endNote}</p>
      ) : null}
    </article>
  );
}
