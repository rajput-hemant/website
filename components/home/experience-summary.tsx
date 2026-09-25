import Link from "next/link";

import type { Experience } from "@/lib/data/types";
import { DateRange } from "@/components/experience/date-range";

import { HomeSection } from "./home-section";

/** An index of roles; each row jumps to its full entry on /work. */
export function ExperienceSummary({ roles }: { roles: Experience[] }) {
  if (roles.length === 0) return null;

  return (
    <HomeSection
      id="experience"
      title="Experience"
      link={{ href: "/work", label: "Full story" }}
    >
      <ol className="-mx-3">
        {roles.map((role) => (
          <li key={role.id}>
            <Link
              href={`/work#${role.id}`}
              className="group/role block rounded-md px-3 py-2.5 transition-colors duration-150 hover:bg-surface"
            >
              <span className="flex items-baseline gap-3">
                <span className="font-medium text-foreground">
                  {role.company}
                </span>
                <span
                  aria-hidden
                  className="min-w-4 flex-1 translate-y-[-0.3em] border-b border-dotted border-border transition-colors group-hover/role:border-subtle"
                />
                <DateRange
                  start={role.startDate}
                  end={role.endDate}
                  className="shrink-0 font-mono text-2xs tracking-wide text-subtle tabular-nums [font-variation-settings:'wdth'_87.5]"
                />
              </span>
              <span className="mt-0.5 block text-sm text-muted">
                {role.title}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </HomeSection>
  );
}
