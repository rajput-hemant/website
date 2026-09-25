import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";

import { employmentLabels } from "@/lib/data/labels";
import type { Experience } from "@/lib/data/types";
import { formatTenure } from "@/lib/format";
import { cn } from "@/lib/utils";
import { RichText } from "@/components/portable-text";
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
    <div className="mt-4 grid gap-1.5 meta text-subtle">
      <MetaList>
        <span className="text-foreground">{role.title}</span>
        <span>{employment}</span>
        <span>{location}</span>
      </MetaList>
      <MetaList>
        <DateRange start={role.startDate} end={role.endDate} />
        <span>
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
    </div>
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
          "size-3.5 shrink-0 self-center text-accent transition-transform duration-200 ease-snappy",
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
    <ul className="mt-4 grid gap-1 text-sm text-muted">
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
    <div className="mt-6">
      <h4 className="meta text-subtle">Highlights</h4>
      <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm text-muted sm:grid-cols-2">
        {items.map((item) => (
          <li
            key={item}
            className="relative pl-4 before:absolute before:top-[0.7em] before:left-0 before:h-px before:w-2 before:bg-subtle"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** One role on /work: company, metadata, continuity links, narrative prose. */
export function ExperienceEntry({ role }: { role: Experience }) {
  return (
    <>
      <h3
        id={`${role.id}-heading`}
        className="display text-2xl text-foreground"
      >
        {role.companyUrl ? (
          <ExternalLink
            href={role.companyUrl}
            underline={false}
            className="hover:text-accent"
          >
            {role.company}
          </ExternalLink>
        ) : (
          role.company
        )}
      </h3>
      {role.companyBlurb && (
        <p className="mt-2 max-w-[60ch] text-sm text-muted">
          {role.companyBlurb}
        </p>
      )}
      <RoleMeta role={role} />
      <Continuity role={role} />
      <RichText value={role.body} className="mt-6" />
      <Highlights items={role.highlights} />
    </>
  );
}
