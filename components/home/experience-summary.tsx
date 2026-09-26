import Link from "next/link";

import type { Experience } from "@/lib/data/types";
import { formatTenure } from "@/lib/dates";
import { formatDateRange } from "@/lib/format";
import { ArrowLink, SheetHeading } from "@/components/ui";

import { TenureDimension } from "./tenure-dimension";

/** Every role as one link of a chain dimension, newest first. */
export function ExperienceSummary({
  roles,
  sheet,
}: {
  roles: Experience[];
  sheet: string;
}) {
  if (roles.length === 0) return null;

  return (
    <section aria-labelledby="experience">
      <SheetHeading
        id="experience"
        n={`Sheet ${sheet}`}
        title="Experience"
        aside={`${roles.length} roles`}
      />
      <ol className="mt-6">
        {roles.map((role) => (
          <li
            key={role.id}
            data-scene-item={`role:${role.id}`}
            className="group grid grid-cols-[1.5rem_1.25rem_minmax(0,1fr)] items-center gap-x-3 sm:gap-x-4"
          >
            <TenureDimension
              start={role.startDate}
              end={role.endDate}
              buildLabel={formatTenure(role.startDate, role.endDate)}
              className="min-h-28 self-stretch"
            />
            <span
              aria-hidden
              className="h-px origin-left scale-x-0 bg-accent motion:transition-transform motion:duration-200 motion:ease-glide fine:group-hover:scale-x-100"
            />
            <Link
              href={`/work#${role.id}`}
              className="grid gap-x-6 gap-y-1 border-b border-line py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline"
            >
              <span className="font-display text-h3 leading-none font-[540] uppercase [font-stretch:66%] transition-colors duration-200 group-focus-within:text-accent fine:group-hover:text-accent">
                {role.company}
              </span>
              <span className="font-mono text-mono-xs tracking-[0.08em] text-ink-soft uppercase tabular-nums sm:row-span-2 sm:text-right">
                {formatDateRange(role.startDate, role.endDate)}
              </span>
              <span className="text-sm text-ink-soft">{role.title}</span>
            </Link>
          </li>
        ))}
      </ol>
      <ArrowLink href="/work" className="mt-8">
        Full experience
      </ArrowLink>
    </section>
  );
}
