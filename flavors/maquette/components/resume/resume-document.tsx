import * as React from "react";
import { Container } from "@/flavors/maquette/components/ui/container";
import { cn } from "@/flavors/maquette/lib/utils";
import { toPlainText } from "@portabletext/toolkit";

import { site } from "@/content/site";
import { employmentLabels } from "@/lib/data/labels";
import { formatMonthYear, formatTenure } from "@/lib/format";
import { hostedResumeLabel } from "@/lib/resume/hosted-resume";
import type { ResumeData } from "@/lib/resume/load";
import { safeHref } from "@/lib/safe-href";

import { PrintButton } from "./print-button";

const dates = (start: string, end?: string) =>
  `${formatMonthYear(start)} to ${end ? formatMonthYear(end) : "now"}`;

/** A numbered part of the sheet, headed like a drawing's schedule. */
function Part({
  n,
  title,
  className,
  children,
}: {
  n: number;
  title: string;
  className?: string | undefined;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("border-t border-current pt-2.5", className)}>
      <h2 className="flex items-baseline gap-3 font-display text-[0.875rem] font-medium tracking-[0.16em] uppercase">
        <span className="font-mono text-[0.75rem] font-normal tracking-[0.06em] opacity-70">
          {String(n).padStart(2, "0")}
        </span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** One cell of the title block: a small caps label over its value. */
function Cell({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("border-current/35 px-3 py-2", className)}>
      <dt className="font-display text-[0.625rem] font-medium tracking-[0.16em] uppercase opacity-70">
        {label}
      </dt>
      <dd className="mt-0.5 font-mono text-[0.75rem] leading-snug tracking-[0.04em] [overflow-wrap:anywhere]">
        {children}
      </dd>
    </div>
  );
}

/**
 * The spec sheet: the resume on one clean sheet of white card in both
 * themes, black on white on paper. The real name heads it, as a resume must.
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
  // Parts are numbered in the order they appear, skipping any left empty.
  const parts = [
    experience.length > 0 && "Experience",
    projects.length > 0 && "Selected projects",
    skills.length > 0 && "Skills",
    education.length > 0 && "Education",
  ].filter(Boolean);
  const revision = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
  const technologies = new Set(skills.flatMap((group) => group.items)).size;
  return (
    <Container className="mt-12">
      <div
        data-print="hide"
        className="flex flex-wrap items-center justify-between gap-4 pb-6"
      >
        <p className="caps">A4, one sheet of white card, prints to two pages</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {profile.resumeUrl ? (
            <a
              href={safeHref(profile.resumeUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold underline decoration-cut underline-offset-[0.2em]"
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
          "spec-sheet",
          "grid gap-8 rounded-[2px] bg-[#fbf8f4] px-5 py-8 text-[#1c1715] shadow-vitrine sm:px-12 sm:py-12"
        )}
      >
        <header className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="font-display text-[0.6875rem] font-medium tracking-[0.18em] uppercase opacity-70">
              Spec sheet · Model room, 1:100
            </p>
            <h1 className="mt-3 font-display text-[2.75rem] leading-none font-light tracking-[-0.035em] sm:text-[3.75rem]">
              {profile.name}
            </h1>
            <p className="mt-3 font-display text-lead font-normal">
              {profile.headline}
            </p>
          </div>
          <ul className="grid gap-0.5 font-mono text-[0.8125rem] tracking-[0.06em] sm:text-right">
            {contact.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="max-w-[70ch] text-sm leading-relaxed sm:col-span-2">
            {toPlainText(profile.bio)}
          </p>
        </header>

        {experience.length > 0 ? (
          <Part n={parts.indexOf("Experience") + 1} title="Experience">
            <ol className="grid gap-5">
              {experience.map((role) => (
                <li
                  key={role.id}
                  className={cn(
                    "print-keep",
                    "grid gap-1 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-6"
                  )}
                >
                  <p className="font-mono text-[0.8125rem] leading-snug tracking-[0.06em]">
                    {dates(role.startDate, role.endDate)}
                    <br />
                    <span className="opacity-75">
                      {formatTenure(role.startDate, role.endDate ?? new Date())}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-base font-bold tracking-[-0.01em]">
                      {role.title}, {role.company}
                    </h3>
                    <p className="font-mono text-[0.75rem] tracking-[0.06em] opacity-75">
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
          <Part
            n={parts.indexOf("Selected projects") + 1}
            title="Selected projects"
            className="print-keep"
          >
            <ul className="grid gap-3 sm:grid-cols-2">
              {projects.map((project) => (
                <li key={project.id}>
                  <h3 className="text-base font-bold tracking-[-0.01em]">
                    {project.name}{" "}
                    <span className="font-mono text-[0.75rem] font-medium tracking-[0.06em] opacity-75">
                      {project.year ?? null}
                    </span>
                  </h3>
                  <p className="text-sm leading-snug">{project.tagline}</p>
                  <p className="font-mono text-[0.75rem] tracking-[0.06em] opacity-75">
                    {project.stack.slice(0, 5).join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </Part>
        ) : null}

        {skills.length > 0 ? (
          <Part
            n={parts.indexOf("Skills") + 1}
            title="Skills"
            className="print-keep"
          >
            <dl className="grid gap-1.5 text-sm leading-snug sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-x-6">
              {skills.map((group) => (
                <React.Fragment key={group.id}>
                  <dt className="font-bold">{group.title}</dt>
                  <dd className="mb-2 sm:mb-0">{group.items.join(", ")}</dd>
                </React.Fragment>
              ))}
            </dl>
          </Part>
        ) : null}

        {education.length > 0 ? (
          <Part
            n={parts.indexOf("Education") + 1}
            title="Education"
            className="print-keep"
          >
            <ul className="grid gap-2 text-sm leading-snug">
              {education.map((entry) => (
                <li
                  key={entry.id}
                  className="grid gap-x-6 sm:grid-cols-[11rem_minmax(0,1fr)]"
                >
                  <span className="font-mono text-[0.8125rem] tracking-[0.06em]">
                    {entry.startYear
                      ? `${entry.startYear} to ${entry.endYear}`
                      : entry.endYear}
                  </span>
                  <span>
                    <b className="font-bold">{entry.degree}</b>,{" "}
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
        <dl
          aria-label="Title block"
          className="print-keep grid grid-cols-2 border border-current sm:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))] sm:[&>*]:border-t-0 [&>*:not(:first-child)]:border-t sm:[&>*:not(:first-child)]:border-l max-sm:[&>*:nth-child(odd):not(:first-child)]:border-l"
        >
          <Cell label="Drawn by" className="max-sm:col-span-2">
            {profile.name}, {site.url.replace(/^https?:\/\//, "")}
          </Cell>
          <Cell label="Site">{profile.location}</Cell>
          <Cell label="Revision">{revision}</Cell>
          <Cell label="Pieces">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </Cell>
          <Cell label="Materials">{technologies} in stock</Cell>
        </dl>
      </article>
    </Container>
  );
}
