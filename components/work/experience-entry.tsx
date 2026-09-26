import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";

import { employmentLabels } from "@/lib/data/labels";
import type { Experience } from "@/lib/data/types";
import { tenure } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  CatalogueNumber,
  Disclosure,
  ExternalLink,
  RichText,
} from "@/components/ui";

import { DateRange } from "./date-range";
import { TenureLabel } from "./tenure-label";

const lowerFirst = (text: string) =>
  text.charAt(0).toLowerCase() + text.slice(1);

const locationLabel = (role: Experience) =>
  role.remote ? `${role.location} (Remote)` : role.location;

/**
 * How the role was held, and how long: hidden from `md` once the chain
 * segment beside it carries the dates and the tenure label.
 */
function RoleMeta({ role }: { role: Experience }) {
  const employment =
    role.employmentNote ?? employmentLabels[role.employmentType];

  return (
    <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-mono-xs text-ink-soft [&>*:not(:last-child)]:after:mx-2 [&>*:not(:last-child)]:after:text-line [&>*:not(:last-child)]:after:content-['/']">
      <span>{locationLabel(role)}</span>
      <span className="tabular-nums md:hidden">
        <TenureLabel
          start={role.startDate}
          end={role.endDate}
          buildTenure={tenure(role.startDate, role.endDate ?? new Date())}
        />
      </span>
      <span>{employment}</span>
      {role.endNote && <span>{role.endNote}</span>}
    </p>
  );
}

/** Why the role mattered, as a short quoted margin note. */
function RoleNote({ note }: { note: string }) {
  return (
    <aside
      aria-label="Why it mattered"
      className="mt-4 max-w-[34rem] border-l border-accent/40 pl-3"
    >
      <p
        aria-hidden
        className="font-mono text-mono-xs tracking-[0.14em] text-ink-faint uppercase"
      >
        Why it mattered
      </p>
      <p className="mt-1 text-sm text-pretty text-ink-soft">{note}</p>
    </aside>
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
      className="group/continuity inline-flex items-baseline gap-1.5 active:text-ink fine:hover:text-ink"
    >
      <Arrow
        aria-hidden
        strokeWidth={1.75}
        className={cn(
          "size-3.5 shrink-0 self-center text-accent transition-transform duration-(--duration-ui) ease-enter",
          direction === "up"
            ? "group-hover/continuity:-translate-y-0.5"
            : "group-hover/continuity:translate-y-0.5"
        )}
      />
      <span>
        <span className="underline decoration-line underline-offset-2">
          {label} {target.company}
        </span>
        {target.note && (
          <span className="text-ink-faint"> · {lowerFirst(target.note)}</span>
        )}
      </span>
    </Link>
  );
}

function Continuity({ role }: { role: Experience }) {
  const { continuedFrom, continuedInto } = role;
  if (!continuedFrom && !continuedInto) return null;

  return (
    <ul className="grid gap-1 text-sm text-ink-soft">
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
      <h4 className="font-mono text-mono-xs tracking-[0.14em] text-ink-faint uppercase">
        Highlights
      </h4>
      <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-ink-soft sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2 before:bg-line"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type ExperienceEntryProps = {
  role: Experience;
  /** 1-based position in the newest-first list, drawn as a catalogue number. */
  index: number;
};

/**
 * One role beside its chain segment: a catalogue number, company, title and
 * dates, how the role was held and where it led, then the company's one-line
 * blurb. "Read more" opens the narrative and its highlights in place.
 */
export function ExperienceEntry({ role, index }: ExperienceEntryProps) {
  return (
    <>
      <CatalogueNumber n={index} prefix="Role" />
      <h3
        id={`${role.id}-heading`}
        className="mt-1.5 font-display text-2xl font-normal text-ink"
      >
        {role.companyUrl ? (
          <ExternalLink
            href={role.companyUrl}
            className="no-underline transition-colors duration-(--duration-ui) active:text-accent fine:hover:text-accent"
          >
            {role.company}
          </ExternalLink>
        ) : (
          role.company
        )}
      </h3>
      <p className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <span className="font-medium text-ink">{role.title}</span>
        <DateRange
          start={role.startDate}
          end={role.endDate}
          className="font-mono text-mono-xs tracking-wide whitespace-nowrap text-ink-faint tabular-nums md:hidden"
        />
      </p>
      <div className="mt-2 grid gap-1.5">
        <RoleMeta role={role} />
        <Continuity role={role} />
      </div>
      {role.companyBlurb && (
        <p className="mt-3 max-w-[60ch] text-[0.9375rem] text-ink-soft">
          {role.companyBlurb}
        </p>
      )}
      {role.note && <RoleNote note={role.note} />}
      <Disclosure
        id={`${role.id}-details`}
        openOnHash={role.id}
        className="mt-3"
        summaryClassName="-mx-1.5 w-fit items-center gap-1.5 rounded-sm px-1.5 py-1 font-mono text-mono-xs text-ink-soft select-none fine:hover:text-ink active:text-ink print:hidden"
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
        <RichText value={role.body} />
        <Highlights items={role.highlights} />
      </Disclosure>
    </>
  );
}
