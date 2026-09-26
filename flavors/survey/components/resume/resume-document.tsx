import * as React from "react";
import { Container } from "@/flavors/survey/components/ui/container";
import { cn } from "@/flavors/survey/lib/utils";

import { site } from "@/content/site";
import { employmentLabels } from "@/lib/data/labels";
import type {
  Education,
  Experience,
  Profile,
  Project,
  SkillGroup,
} from "@/lib/data/types";
import { formatMonthYear, formatTenure } from "@/lib/format";
import { hostedResumeLabel } from "@/lib/resume/hosted-resume";

import { PrintButton } from "./print-button";
import styles from "./resume.module.css";

export type ResumeDocumentProps = {
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  skills: SkillGroup[];
  education: Education[];
};

const dates = (start: string, end?: string) =>
  `${formatMonthYear(start)} to ${end ? formatMonthYear(end) : "now"}`;

const plain = (value: Profile["bio"]) =>
  value
    .flatMap((block) =>
      "children" in block && Array.isArray(block.children)
        ? block.children.map((child) =>
            typeof child === "object" && child && "text" in child
              ? String(child.text)
              : ""
          )
        : []
    )
    .join("");

function Part({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn("border-t-[1.5px] border-[#1c2a2b] pt-2.5", className)}
    >
      <h2 className="caps text-[#7e4a20]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * The printed sheet: the resume on the light day sheet in both themes, black
 * on white on paper. The real name heads it, as a resume must.
 */
export function ResumeDocument({
  profile,
  experience,
  projects,
  skills,
  education,
}: ResumeDocumentProps) {
  const contact = [
    profile.location,
    profile.email,
    ...profile.links
      .filter((link) => ["GitHub", "LinkedIn", "Website"].includes(link.label))
      .map((link) => link.url.replace(/^https?:\/\/(www\.)?/, "")),
  ];
  return (
    <Container className="mt-12">
      <div
        data-print="hide"
        className="flex flex-wrap items-center justify-between gap-4 pb-5"
      >
        <p className="caps text-ink-soft">A4 sheet, prints to two pages</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.resumeUrl ? (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center text-sm font-semibold underline decoration-contour underline-offset-[0.3em] fine:hover:text-water"
            >
              Also on {hostedResumeLabel(profile.resumeUrl)}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : null}
          <PrintButton />
        </div>
      </div>
      <article
        style={{ colorScheme: "light" }}
        className={cn(
          styles.sheet,
          "grid gap-8 border border-[#1c2a2b] bg-[#ebefe7] px-5 py-8 text-[#1c2a2b] shadow-lift sm:px-12 sm:py-12"
        )}
      >
        <header className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h1 className="mr-[-0.2em] font-display text-[2.25rem] leading-none tracking-[0.2em] uppercase sm:text-[3rem]">
              {profile.name}
            </h1>
            <p className="mt-3 font-serif text-lead italic">
              {profile.headline}
            </p>
          </div>
          <ul className="grid gap-0.5 text-sm tabular-nums sm:text-right">
            {contact.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="max-w-[70ch] text-[0.9375rem] leading-relaxed sm:col-span-2">
            {plain(profile.bio)}
          </p>
        </header>

        {experience.length > 0 ? (
          <Part title="Experience">
            <ol className="grid gap-5">
              {experience.map((role) => (
                <li
                  key={role.id}
                  className={cn(
                    styles.keep,
                    "grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
                  )}
                >
                  <p className="text-sm leading-snug tabular-nums">
                    {dates(role.startDate, role.endDate)}
                    <br />
                    <span className="text-[#536361]">
                      {formatTenure(role.startDate, role.endDate ?? new Date())}
                    </span>
                  </p>
                  <div>
                    <h3 className="font-display text-lead leading-snug">
                      {role.title}, {role.company}
                    </h3>
                    <p className="caps text-[#536361]">
                      {role.employmentNote ??
                        employmentLabels[role.employmentType]}
                      {role.remote ? " · Remote" : ` · ${role.location}`}
                    </p>
                    {role.highlights.length > 0 ? (
                      <ul className="mt-2 grid list-disc gap-1 pl-4 text-[0.9375rem] leading-snug marker:text-[#9a5b2a]">
                        {role.highlights.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </Part>
        ) : null}

        {projects.length > 0 ? (
          <Part title="Selected projects" className={styles.keep}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <h3 className="font-display text-lead leading-snug">
                    {project.name}{" "}
                    <span className="font-sans text-sm text-[#536361] tabular-nums">
                      {project.year}
                    </span>
                  </h3>
                  <p className="text-[0.9375rem] leading-snug">
                    {project.tagline}
                  </p>
                  <p className="text-sm text-[#536361]">
                    {project.stack.slice(0, 5).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </Part>
        ) : null}

        {skills.length > 0 ? (
          <Part title="Skills" className={styles.keep}>
            <dl className="grid gap-1.5 text-[0.9375rem] leading-snug sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6">
              {skills.map((group) => (
                <React.Fragment key={group.id}>
                  <dt className="font-semibold">{group.title}</dt>
                  <dd className="mb-2 sm:mb-0">{group.items.join(", ")}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Part>
        ) : null}

        {education.length > 0 ? (
          <Part title="Education" className={styles.keep}>
            <ul className="grid gap-2 text-[0.9375rem] leading-snug">
              {education.map((entry) => (
                <li
                  key={entry.id}
                  className="grid gap-x-6 sm:grid-cols-[11rem_minmax(0,1fr)]"
                >
                  <span className="text-sm tabular-nums">
                    {entry.startYear
                      ? `${entry.startYear} to ${entry.endYear}`
                      : entry.endYear}
                  </span>
                  <span>
                    <b className="font-semibold">{entry.degree}</b>,{" "}
                    {entry.institution}
                    {entry.score ? `, ${entry.score}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Part>
        ) : null}

        {profile.resumeNote ? (
          <p className="border-t border-[#1c2a2b]/20 pt-4 text-sm">
            {profile.resumeNote}
          </p>
        ) : null}
        <p data-print="hide" className="caps text-[#536361]">
          {site.url.replace(/^https?:\/\//, "")}
        </p>
      </article>
    </Container>
  );
}
