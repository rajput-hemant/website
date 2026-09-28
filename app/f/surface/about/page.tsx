import type { Metadata } from "next";
import { CopyEmail } from "@/flavors/surface/components/home/copy-email";
import { Panel } from "@/flavors/surface/components/site/panel";
import { KeyLink, Legend } from "@/flavors/surface/components/ui/primitives";
import { RichText } from "@/flavors/surface/components/ui/rich-text";
import { MODEL, STACK } from "@/flavors/surface/content";
import { cn } from "@/flavors/surface/lib/utils";

import { site, sitePage } from "@/content/site";
import { getEducation, getProfile, getSkills } from "@/lib/data";
import { formatYearRange } from "@/lib/format";
import { pageMetadata } from "@/lib/metadata";

const page = sitePage("/about");

export const metadata: Metadata = pageMetadata(page);

function ManualSection({
  n,
  id,
  title,
  children,
  className,
}: {
  n: number;
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      data-knob-item={n - 1}
      aria-labelledby={`${id}-title`}
      className={cn(
        "grid scroll-mt-[calc(var(--header-height)+1.5rem)] gap-6 md:grid-cols-[9rem_minmax(0,1fr)]",
        className
      )}
    >
      <div className="seam-b flex items-baseline gap-3 pb-3 md:block md:border-0 md:pb-0 md:shadow-none">
        <p
          aria-hidden
          className="font-display text-h2 leading-none text-ink-3 tabular-nums"
        >
          {n}
        </p>
        <h2 id={`${id}-title`} className="legend md:mt-3">
          {title}
        </h2>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

/** The rating plate expanded into an operating manual: numbered sections, because manuals are. */
export default async function AboutPage() {
  const [profile, skills, education] = await Promise.all([
    getProfile(),
    getSkills(),
    getEducation(),
  ]);

  const sections = [
    { id: "general", title: "General" },
    ...(skills.length > 0
      ? [{ id: "specifications", title: "Specifications" }]
      : []),
    ...(education.length > 0 ? [{ id: "education", title: "Education" }] : []),
    { id: "contact", title: "Contact" },
  ];
  const n = (id: string) =>
    sections.findIndex((section) => section.id === id) + 1;
  const social = profile.links.filter((link) => /^https?:/.test(link.url));

  return (
    <Panel
      ch="04"
      name="About"
      aside="Operating manual"
      title="About"
      lede={page.description}
      knob={{
        items: sections.map((section, i) => ({
          label: `${i + 1} ${section.title}`,
          href: `#${section.id}`,
        })),
        unit: "Section",
        label: "Section selector",
      }}
    >
      <div className="grid gap-16">
        <ManualSection n={n("general")} id="general" title="General">
          <RichText
            value={profile.bio}
            className="text-lead leading-[1.4] font-medium"
          />
          <div className="rating-plate mt-10 max-w-md px-[22px] py-3.5">
            <div className="flex items-baseline justify-between border-b border-black/25 pb-[7px]">
              <b className="font-display text-[1.0625rem] leading-none tracking-[0.06em]">
                {MODEL}
              </b>
              <span className="font-display text-[0.625rem] leading-none tracking-[0.14em] uppercase">
                {site.handle}
              </span>
            </div>
            <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[0.8125rem] leading-[1.35]">
              {[
                ["Type", "Fullstack engineer"],
                ["Stack", STACK],
                ["Teams", "US and UK, remote"],
                ["Made in", profile.location],
                ...(profile.availability
                  ? [["Status", profile.availability]]
                  : []),
              ].map(([term, value]) => (
                <div key={term} className="contents">
                  <dt className="legend text-[0.59375rem] leading-[1.5]">
                    {term}
                  </dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </ManualSection>

        {skills.length > 0 && (
          <ManualSection
            n={n("specifications")}
            id="specifications"
            title="Specifications"
          >
            <div className="grid gap-3.5 sm:grid-cols-2">
              {skills.map((group, g) => (
                <div key={group.id} className="mod p-4">
                  <h3 className="legend flex justify-between">
                    <span>{group.title}</span>
                    <span aria-hidden className="text-ink-3">
                      {n("specifications")}.{g + 1}
                    </span>
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-[4px] bg-plate px-2 py-1 text-sm leading-tight shadow-[inset_0_1px_2px_rgb(0_0_0/0.12),0_1px_0_var(--color-hi)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </ManualSection>
        )}

        {education.length > 0 && (
          <ManualSection n={n("education")} id="education" title="Education">
            <ol className="grid gap-3.5">
              {education.map((item) => (
                <li
                  key={item.id}
                  className="mod grid gap-1 p-4 sm:grid-cols-[1fr_auto] sm:gap-6"
                >
                  <div>
                    <p className="font-display text-xl leading-tight">
                      {item.institution}
                    </p>
                    <p className="mt-1">{item.degree}</p>
                    <p className="text-sm text-ink-2">
                      {item.location}
                      {item.score ? `, ${item.score}` : ""}
                    </p>
                  </div>
                  <p className="legend sm:text-right">
                    {formatYearRange(item.startYear, item.endYear).replace(
                      " – ",
                      " to "
                    )}
                  </p>
                </li>
              ))}
            </ol>
          </ManualSection>
        )}

        <ManualSection n={n("contact")} id="contact" title="Contact">
          <div className="mod grid gap-5 p-5">
            <div>
              <Legend className="mb-2">Email</Legend>
              <CopyEmail email={profile.email} />
            </div>
            <div>
              <Legend className="mb-2">Elsewhere</Legend>
              <ul className="flex flex-wrap gap-2">
                {social.map((link) => (
                  <li key={link.url}>
                    <KeyLink href={link.url} size="sm">
                      {link.label}
                    </KeyLink>
                  </li>
                ))}
                <li>
                  <KeyLink href="/resume" size="sm">
                    Resume
                  </KeyLink>
                </li>
              </ul>
            </div>
          </div>
        </ManualSection>
      </div>
    </Panel>
  );
}
