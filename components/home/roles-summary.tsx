import Link from "next/link";

import type { Experience } from "@/lib/data/types";
import { parseIsoDate } from "@/lib/format";

import { HomeSection } from "./home-section";

const year = (date: string) => parseIsoDate(date).year;

function yearSpan(role: Experience) {
  const start = year(role.startDate);
  if (!role.endDate) return `${start} – now`;
  const end = year(role.endDate);
  return start === end ? `${start}` : `${start} – ${end}`;
}

export type RolesSummaryProps = {
  roles: Experience[];
  /** Show only the newest roles; the "Full story" link covers the rest. */
  limit?: number;
  as?: "h2" | "h3";
  className?: string;
};

/** The newest roles on one line each; a row opens its full entry on /work. */
export function RolesSummary({
  roles,
  limit,
  as = "h3",
  className,
}: RolesSummaryProps) {
  const shown = limit === undefined ? roles : roles.slice(0, limit);
  if (shown.length === 0) return null;

  return (
    <HomeSection
      id="experience"
      as={as}
      title="Experience"
      link={{ href: "/work", label: "Full story" }}
      className={className}
    >
      <ol className="grid gap-px">
        {shown.map((role) => (
          <li key={role.id}>
            <Link
              href={`/work#${role.id}`}
              className="-mx-3 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 rounded-md px-3 py-2 transition-colors duration-(--duration-exit) hover:bg-surface focus-visible:outline-offset-0 active:bg-surface sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <span className="font-medium text-foreground">
                {role.company}
              </span>
              <span className="col-span-2 row-start-2 text-[0.9375rem] leading-snug text-muted sm:col-span-1 sm:col-start-2 sm:row-start-1 sm:truncate sm:leading-[inherit]">
                {role.title}
              </span>
              <span className="col-start-2 row-start-1 font-mono text-2xs tracking-wide whitespace-nowrap text-subtle tabular-nums [font-variation-settings:'wdth'_87.5] sm:col-start-3">
                {yearSpan(role)}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
