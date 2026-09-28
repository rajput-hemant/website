import * as React from "react";
import { Container } from "@/flavors/press/components/ui/container";
import { cn } from "@/flavors/press/lib/utils";
import { toPlainText } from "@portabletext/toolkit";

import { site } from "@/content/site";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear, formatTenure } from "@/lib/format";
import { hostedResumeLabel } from "@/lib/resume/hosted-resume";
import type { ResumeData } from "@/lib/resume/load";

import { PrintButton } from "./print-button";
import styles from "./resume.module.css";

const dates = (start: string, end?: string) =>
  `${formatMonthYear(start)} to ${end ? formatMonthYear(end) : "now"}`;

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
    <section className={cn("border-t-2 border-current pt-3", className)}>
      <h2 className="font-mono text-[0.75rem] font-semibold tracking-[0.1em] uppercase [font-stretch:75%]">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * The final print: the resume on one clean sheet in one ink, in both themes,
 * black on white on paper. The real name heads it, as a resume must.
 */
export function ResumeDocument({
  profile,
  experience,
  projects,
  skills,
  education,
}: ResumeData) {
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
        className="flex flex-wrap items-center justify-between gap-4 pb-6"
      >
        <p className="slug">A4, one ink, prints to two pages</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.resumeUrl ? (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-bold underline decoration-pink decoration-2 underline-offset-[0.2em]"
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
          styles.print,
          "crop-marks mx-3.5 grid gap-8 bg-[#fbfbf9] px-5 py-8 text-[#1f2a44] shadow-sheet [--color-ink-soft:#4a5570] sm:px-12 sm:py-12"
        )}
      >
        <header className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <h1 className="text-[2.75rem] leading-none tracking-[-0.04em] sm:text-[3.5rem]">
              {profile.name}
            </h1>
            <p className="mt-3 text-lead font-semibold">{profile.headline}</p>
          </div>
          <ul className="grid gap-0.5 font-mono text-[0.75rem] [font-stretch:75%] sm:text-right">
            {contact.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="max-w-[70ch] text-sm leading-relaxed sm:col-span-2">
            {toPlainText(profile.bio)}
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
                  <p className="font-mono text-[0.75rem] leading-snug [font-stretch:75%]">
                    {dates(role.startDate, role.endDate)}
                    <br />
                    <span className="opacity-75">
                      {formatTenure(role.startDate, role.endDate ?? new Date())}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-base font-extrabold tracking-[-0.01em]">
                      {role.title}, {role.company}
                    </h3>
                    <p className="font-mono text-[0.6875rem] [font-stretch:75%] opacity-75">
                      {role.employmentNote ??
                        employmentLabels[role.employmentType]}
                      {role.remote ? " / Remote" : ` / ${role.location}`}
                    </p>
                    {role.highlights.length > 0 ? (
                      <ul className="mt-2 grid list-disc gap-1 pl-4 text-sm leading-snug">
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
                  <h3 className="text-base font-extrabold tracking-[-0.01em]">
                    {project.name}{" "}
                    <span className="font-mono text-[0.6875rem] font-medium opacity-75">
                      {project.year ?? null}
                    </span>
                  </h3>
                  <p className="text-sm leading-snug">{project.tagline}</p>
                  <p className="font-mono text-[0.6875rem] [font-stretch:75%] opacity-75">
                    {project.stack.slice(0, 5).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </Part>
        ) : null}

        {skills.length > 0 ? (
          <Part title="Skills" className={styles.keep}>
            <dl className="grid gap-1.5 text-sm leading-snug sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6">
              {skills.map((group) => (
                <React.Fragment key={group.id}>
                  <dt className="font-extrabold">{group.title}</dt>
                  <dd className="mb-2 sm:mb-0">{group.items.join(", ")}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Part>
        ) : null}

        {education.length > 0 ? (
          <Part title="Education" className={styles.keep}>
            <ul className="grid gap-2 text-sm leading-snug">
              {education.map((entry) => (
                <li
                  key={entry.id}
                  className="grid gap-x-6 sm:grid-cols-[11rem_minmax(0,1fr)]"
                >
                  <span className="font-mono text-[0.75rem] [font-stretch:75%]">
                    {entry.startYear
                      ? `${entry.startYear} to ${entry.endYear}`
                      : entry.endYear}
                  </span>
                  <span>
                    <b className="font-extrabold">{entry.degree}</b>,{" "}
                    {entry.institution}
                    {entry.score ? `, ${entry.score}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </Part>
        ) : null}

        {profile.resumeNote ? (
          <p className="border-t border-current/20 pt-4 text-sm">
            {profile.resumeNote}
          </p>
        ) : null}
        <p data-print="hide" className="font-mono text-[0.6875rem] opacity-70">
          {site.url.replace(/^https?:\/\//, "")}
        </p>
      </article>
    </Container>
  );
}
