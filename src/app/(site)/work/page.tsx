import type { Metadata } from 'next';
import { ExperienceEntry } from '~/components/experience/entry';
import { Footer } from '~/components/site/footer';
import { siteConfig } from '~/content/site';
import { getEducation, getExperience, getSkills } from '~/lib/data';

export const metadata: Metadata = {
  title: 'Work',
  description: `Experience, skills and education of ${siteConfig.name}.`,
};

export default async function Work() {
  const [experience, skills, education] = await Promise.all([
    getExperience(),
    getSkills(),
    getEducation(),
  ]);

  return (
    <>
      <main className="flex flex-col gap-16 sm:gap-20">
        <section aria-labelledby="work-title">
          <h1 id="work-title">Work</h1>
          <p className="text-fg-muted mt-4">
            The teams I have joined and the things we built together.
          </p>
        </section>
        <section
          aria-labelledby="experience-title"
          className="border-rule border-t pt-8"
        >
          <h2 id="experience-title">Experience</h2>
          <div className="mt-8 space-y-14">
            {experience.map((role) => (
              <ExperienceEntry key={role._id} role={role} />
            ))}
          </div>
        </section>
        <section
          aria-labelledby="skills-title"
          className="border-rule border-t pt-8"
        >
          <h2 id="skills-title">Skills</h2>
          <dl className="mt-6 space-y-5">
            {skills.map((group) => (
              <div key={group._id}>
                <dt className="font-medium">{group.title}</dt>
                <dd className="text-fg-muted mt-1">
                  {group.items?.join(', ')}
                </dd>
              </div>
            ))}
          </dl>
        </section>
        <section
          aria-labelledby="education-title"
          className="border-rule border-t pt-8"
        >
          <h2 id="education-title">Education</h2>
          <ul className="mt-6 space-y-7">
            {education.map((entry) => (
              <li key={entry._id}>
                <h3 className="text-base">{entry.degree}</h3>
                <p className="mt-1">{entry.institution}</p>
                <p className="text-fg-muted mt-1 font-mono text-xs">
                  {[
                    entry.location,
                    [...new Set([entry.startYear, entry.endYear])]
                      .filter(Boolean)
                      .join(' - '),
                    entry.score,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer path="/work" />
    </>
  );
}
