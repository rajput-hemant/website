import { RichText } from "@/flavors/survey/components/ui/rich-text";
import {
  gridRef,
  rolesRunning,
  type Relief,
  type Summit,
} from "@/flavors/survey/lib/relief";
import { cn } from "@/flavors/survey/lib/utils";

import { employmentLabels } from "@/lib/data/labels";
import type { Experience } from "@/lib/data/types";
import { formatDateRange } from "@/lib/format";

import { Transect } from "./transect";

/** One role as a transect: its dates and height in the margin, its ridge in section, then the account. */
export function RoleTransect({
  role,
  summit,
  relief,
}: {
  role: Experience;
  summit: Summit;
  relief: Relief;
}) {
  const alongside = new Set<string>();
  for (let m = summit.start; m < summit.end; m++) {
    for (const s of rolesRunning(relief, m)) {
      if (s.id !== summit.id) alongside.add(s.company);
    }
  }

  return (
    <article
      id={role.id}
      data-scene-item={`role:${role.id}`}
      aria-labelledby={`${role.id}-heading`}
      className="grid scroll-mt-[calc(var(--header-height)+1.5rem)] gap-x-12 gap-y-6 border-b border-rule py-12 first:pt-8 lg:grid-cols-12"
    >
      <div className="lg:col-span-3">
        <p
          className={cn(
            "font-sans text-[1.75rem] leading-none font-semibold tracking-[0.08em] tabular-nums",
            summit.current ? "text-revision" : "text-ink"
          )}
        >
          {gridRef(relief, summit.x, summit.p)}
        </p>
        <dl className="mt-5 grid gap-3">
          <div>
            <dt className="caps text-ink-faint">Surveyed</dt>
            <dd className="mt-1 text-sm">
              {formatDateRange(role.startDate, role.endDate)}
            </dd>
          </div>
          <div>
            <dt className="caps text-ink-faint">Height</dt>
            <dd className="mt-1 text-sm">
              {summit.h} months
              {summit.current ? ", still rising" : ""}
            </dd>
          </div>
          <div>
            <dt className="caps text-ink-faint">Terms</dt>
            <dd className="mt-1 text-sm">
              {role.employmentNote ?? employmentLabels[role.employmentType]}
              {role.remote ? ", remote" : `, ${role.location}`}
            </dd>
          </div>
          {alongside.size > 0 ? (
            <div>
              <dt className="caps text-ink-faint">Alongside</dt>
              <dd className="mt-1 text-sm">{[...alongside].join(", ")}</dd>
            </div>
          ) : null}
        </dl>
      </div>
      <div className="min-w-0 lg:col-span-9">
        <h3
          id={`${role.id}-heading`}
          className="spaced text-h3 tracking-[0.24em]"
        >
          {role.companyUrl ? (
            <a
              href={role.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-transparent underline-offset-[0.2em] fine:hover:decoration-contour"
            >
              {role.company}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            role.company
          )}
        </h3>
        <p className="mt-2 text-lead text-ink-soft">{role.title}</p>
        {role.companyBlurb ? (
          <p className="mt-1 text-sm text-ink-faint">{role.companyBlurb}</p>
        ) : null}
        <Transect relief={relief} summit={summit} className="mt-6 max-w-2xl" />
        {role.note ? (
          <p className="mt-6 max-w-[56ch] border-l-2 border-contour pl-4 font-serif text-lead italic">
            {role.note}
          </p>
        ) : null}
        <RichText value={role.body} className="mt-6" />
        {role.highlights.length > 0 ? (
          <ul className="mt-6 grid max-w-[64ch] gap-2">
            {role.highlights.map((item) => (
              <li
                key={item}
                className="grid grid-cols-[1rem_minmax(0,1fr)] gap-2 text-[0.9375rem]"
              >
                <span aria-hidden className="pt-2">
                  <span className="block size-1.5 rotate-45 bg-contour" />
                </span>
                {item}
              </li>
            ))}
          </ul>
        ) : null}
        {role.continuedFrom || role.continuedInto ? (
          <p className="caps mt-6 text-ink-faint">
            {role.continuedFrom ? (
              <>
                Continued from{" "}
                <a
                  href={`#${role.continuedFrom.id}`}
                  className="text-ink underline decoration-contour underline-offset-[0.35em]"
                >
                  {role.continuedFrom.company}
                </a>
                {role.continuedFrom.note
                  ? `, ${role.continuedFrom.note.toLowerCase()}`
                  : ""}
              </>
            ) : null}
            {role.continuedFrom && role.continuedInto ? " · " : null}
            {role.continuedInto ? (
              <>
                Continued into{" "}
                <a
                  href={`#${role.continuedInto.id}`}
                  className="text-ink underline decoration-contour underline-offset-[0.35em]"
                >
                  {role.continuedInto.company}
                </a>
                {role.continuedInto.note
                  ? `, ${role.continuedInto.note.toLowerCase()}`
                  : ""}
              </>
            ) : null}
          </p>
        ) : null}
      </div>
    </article>
  );
}
