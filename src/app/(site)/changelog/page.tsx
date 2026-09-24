import type { Metadata } from 'next';
import { Footer } from '~/components/site/footer';
import { getChangelog, type ChangelogEntry } from '~/lib/data';
import { formatDate } from '~/lib/format';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'A running log of work, projects and changes, newest first.',
};

type DatedEntry = ChangelogEntry & { date: string };

export default async function ChangelogPage() {
  const entries = await getChangelog();
  const years = Map.groupBy(
    entries.filter((entry): entry is DatedEntry => entry.date !== null),
    (entry) => entry.date.slice(0, 4),
  );

  return (
    <>
      <main className="flex flex-col gap-12">
        <h1>Changelog</h1>
        {[...years].map(([year, yearEntries]) => (
          <section
            key={year}
            aria-labelledby={`year-${year}`}
            className="flex flex-col gap-4"
          >
            <h2 id={`year-${year}`} className="scroll-mt-6 text-lg">
              <a href={`#year-${year}`} className="quiet-link">
                {year}
              </a>
            </h2>
            <ol className="flex flex-col gap-3">
              {yearEntries.map((entry) => (
                <li
                  key={entry._id}
                  className="grid grid-cols-[4.5em_1fr] items-baseline gap-x-4"
                >
                  <time
                    dateTime={entry.date}
                    className="text-fg-muted font-mono text-xs"
                  >
                    {formatDate(entry.date, { month: 'short', day: 'numeric' })}
                  </time>
                  <p className="prose">
                    {entry.link ? (
                      <a href={entry.link}>{entry.text}</a>
                    ) : (
                      entry.text
                    )}
                    {entry.category ? (
                      <span className="text-fg-muted ml-2 font-mono text-xs">
                        {entry.category}
                      </span>
                    ) : null}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </main>
      <Footer path="/changelog" />
    </>
  );
}
