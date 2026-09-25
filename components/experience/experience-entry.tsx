import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";

import { employmentLabels } from "@/lib/data/labels";
import type { Experience } from "@/lib/data/types";
import { formatTenure } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/portable-text";
import { Disclosure } from "@/components/ui/disclosure";
import { ExternalLink } from "@/components/ui/external-link";
import { MetaList } from "@/components/ui/meta-list";

import { DateRange } from "./date-range";
import { OngoingTenure } from "./ongoing-tenure";

const lowerFirst = (text: string) =>
  text.charAt(0).toLowerCase() + text.slice(1);

function RoleMeta({ role }: { role: Experience }) {
  const employment =
    role.employmentNote ?? employmentLabels[role.employmentType];
  const location = role.remote ? `${role.location} (Remote)` : role.location;

  return (
    <MetaList className="meta text-subtle">
      <span>{employment}</span>
      <span>{location}</span>
      <span className="tabular-nums">
        {role.endDate ? (
          formatTenure(role.startDate, role.endDate)
        ) : (
          <OngoingTenure
            start={role.startDate}
            buildLabel={formatTenure(role.startDate, new Date())}
          />
        )}
      </span>
      {role.endNote && <span>{role.endNote}</span>}
    </MetaList>
  );
}

function ContinuityLink({
  target,
  label,
  direction,
}: {
  target: NonNullable<Experience["continuedInto"]>;
  label: string;
  /** Where the linked role sits in the newest-first list. */
  direction: "up" | "down";
}) {
  const Arrow = direction === "up" ? ArrowUp : ArrowDown;
  return (
    <Link
      href={`#${target.id}`}
      className="group/continuity inline-flex items-baseline gap-1.5 hover:text-foreground"
    >
      <Arrow
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "size-3.5 shrink-0 self-center text-accent transition-transform duration-(--duration-enter) ease-enter",
          direction === "up"
            ? "group-hover/continuity:-translate-y-0.5"
            : "group-hover/continuity:translate-y-0.5"
        )}
      />
      <span>
        <span className="link">
          {label} {target.company}
        </span>
        {target.note && (
          <span className="text-subtle"> · {lowerFirst(target.note)}</span>
        )}
      </span>
    </Link>
  );
}

function Continuity({ role }: { role: Experience }) {
  const { continuedFrom, continuedInto } = role;
  if (!continuedFrom && !continuedInto) return null;

  return (
    <ul className="grid gap-1 text-sm text-muted">
      {continuedFrom && (
        <li>
          <ContinuityLink
            target={continuedFrom}
            label="Continued from"
            direction="down"
          />
        </li>
      )}
      {continuedInto && (
        <li>
          <ContinuityLink
            target={continuedInto}
            label="Continued at"
            direction="up"
          />
        </li>
      )}
    </ul>
  );
}

function Highlights({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="meta text-subtle">Highlights</h4>
      <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-muted sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2 before:bg-faint"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * One role on /work, summary first: company, title and dates, and the
 * company's one-line blurb. "Read more" opens the rest in place: how the role
 * was held, where it led, the narrative and its highlights.
 */
export function ExperienceEntry({ role }: { role: Experience }) {
  return (
    <>
      <h3
        id={`${role.id}-heading`}
        className="display text-2xl font-book text-foreground"
      >
        {role.companyUrl ? (
          <ExternalLink
            href={role.companyUrl}
            underline={false}
            className="transition-colors duration-(--duration-exit) hover:text-accent"
          >
            {role.company}
          </ExternalLink>
        ) : (
          role.company
        )}
      </h3>
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="font-medium text-foreground">{role.title}</span>
        <DateRange
          start={role.startDate}
          end={role.endDate}
          className="font-mono text-2xs tracking-wide whitespace-nowrap text-subtle tabular-nums [font-variation-settings:'wdth'_87.5]"
        />
      </p>
      {role.companyBlurb && (
        <p className="mt-2 max-w-[60ch] text-[0.9375rem] text-muted">
          {role.companyBlurb}
        </p>
      )}
      <Disclosure
        id={`${role.id}-details`}
        openOnHash={role.id}
        className="mt-3"
        summaryClassName="hit-area -mx-1.5 w-fit items-center gap-1.5 rounded-sm px-1.5 py-1 meta text-muted transition-colors duration-(--duration-exit) select-none hover:text-foreground focus-visible:outline-offset-0 print:hidden"
        contentClassName="grid gap-6 pt-4 pb-1"
        summary={
          <>
            <span className="group-open/disclosure:hidden">Read more</span>
            <span className="hidden group-open/disclosure:inline">
              Show less
            </span>
            <span className="sr-only"> about {role.company}</span>
          </>
        }
      >
        <div className="grid gap-3">
          <RoleMeta role={role} />
          <Continuity role={role} />
        </div>
        <RichText value={role.body} />
        <Highlights items={role.highlights} />
      </Disclosure>
    </>
  );
}
