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
  const dates = role.startDate
    ? `${month(role.startDate)} - ${role.endDate ? month(role.endDate) : 'Present'}`
    : null;
  const details = [
    role.location,
    role.remote ? 'Remote' : null,
    role.employmentType,
    dates && role.endNote ? `${dates} (${role.endNote})` : dates,
  ].filter(Boolean);
  const continuation = role.continuedFrom
    ? {
        label: 'Continued from',
        target: role.continuedFrom,
        note: role.continuedFrom.continuationNote,
      }
    : role.continuedInto
      ? {
          label: 'Continued into',
          target: role.continuedInto,
          note: role.continuationNote,
        }
      : null;

  return (
    <article id={role._id} className="scroll-mt-8">
      <h3 className="leading-snug">
        {role.companyUrl ? (
          <a className="hover:text-accent" href={role.companyUrl}>
            {role.company}
          </a>
        ) : (
          role.company
        )}
      </h3>
      {role.title ? <p className="mt-1">{role.title}</p> : null}
      {details.length ? (
        <p className="text-fg-muted mt-2 font-mono text-xs">
          {details.join(' · ')}
        </p>
      ) : null}
      {continuation ? (
        <p className="text-fg-muted mt-2 text-sm">
          {continuation.label}{' '}
          <a className="text-link text-fg" href={`#${continuation.target._id}`}>
            {continuation.target.company}
          </a>
          {continuation.note ? ` · ${continuation.note}` : null}
        </p>
      ) : null}
      {role.body?.length || role.highlights?.length ? (
        <div className="prose mt-5">
          {role.body ? <PortableText value={role.body} /> : null}
          {role.highlights?.length ? (
            <ul>
              {role.highlights.map((highlight, index) => (
                <li key={index}>{highlight}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
