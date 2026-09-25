import { toPlainText } from "@portabletext/toolkit";

import { type Experience } from "@/lib/data/types";

import { monthYear } from "./format";
import { ResumeLink } from "./resume-link";
import styles from "./resume.module.css";

const employmentLabel: Record<Experience["employmentType"], string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  freelance: "Freelance",
};

/** Up to three words each reads better as one run-in line than as a stack of bullets. */
const isTerse = (highlights: string[]) =>
  highlights.every((highlight) => highlight.split(/\s+/).length <= 3);

function Summary({ role }: { role: Experience }) {
  if (role.highlights.length > 0) {
    return isTerse(role.highlights) ? (
      <ul className="flex flex-wrap gap-x-2">
        {role.highlights.map((highlight, index) => (
          <li key={highlight}>
            {highlight}
            {index < role.highlights.length - 1 && (
              <span aria-hidden className="ml-2 text-subtle">
                ·
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <ul className="grid [list-style-type:'–__'] gap-1 pl-4 marker:text-subtle">
        {role.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    );
  }
  const [firstParagraph] = role.body;
  return firstParagraph ? <p>{toPlainText([firstParagraph])}</p> : null;
}

function Role({ role }: { role: Experience }) {
  const details = [
    role.location,
    role.remote && "Remote",
    role.employmentNote ?? employmentLabel[role.employmentType],
  ].filter(Boolean);

  return (
    <article className={styles.keep}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <h3 className="font-semibold text-foreground">
          {role.title}
          <span className="font-normal text-muted">
            {", "}
            {role.companyUrl ? (
              <ResumeLink href={role.companyUrl}>{role.company}</ResumeLink>
            ) : (
              role.company
            )}
          </span>
        </h3>
        <p className="meta whitespace-nowrap text-subtle tabular-nums">
          <time dateTime={role.startDate}>{monthYear(role.startDate)}</time>
          {" – "}
          {role.endDate ? (
            <time dateTime={role.endDate}>{monthYear(role.endDate)}</time>
          ) : (
            "Present"
          )}
        </p>
      </div>
      <p className="mt-0.5 text-sm text-subtle">{details.join(" · ")}</p>
      <div className="mt-2.5 text-[0.9375rem] text-muted">
        <Summary role={role} />
      </div>
    </article>
  );
}

export function ResumeExperience({ roles }: { roles: Experience[] }) {
  return (
    <ol className="space-y-7 print:space-y-5">
      {roles.map((role) => (
        <li key={role.id}>
          <Role role={role} />
        </li>
      ))}
    </ol>
  );
}
