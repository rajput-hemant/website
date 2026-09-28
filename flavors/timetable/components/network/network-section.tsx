import Link from "next/link";
import {
  LineBadge,
  lineVar,
} from "@/flavors/timetable/components/ui/line-badge";
import { SectionHead } from "@/flavors/timetable/components/ui/section-head";
import { monthDate, type Network } from "@/flavors/timetable/lib/network";
import { cn } from "@/flavors/timetable/lib/utils";

import { formatMonthYear, formatTenure } from "@/lib/format";

import { NetworkMap } from "./network-map";

/** "Sep 2024 to Jan 2026", or "to now" for a role still in service. */
export const serviceDates = (start: string, end?: string) =>
  `${formatMonthYear(start)} to ${end ? formatMonthYear(end) : "now"}`;

/** The same span in 16 flap cells: "SEP 24 TO JAN 26". */
export const boardDates = (start: string, end?: string) =>
  `${boardMonth(start)} to ${end ? boardMonth(end) : "now"}`;

/** "Sep 24": a month in as few flap cells as it can take. */
export const boardMonth = (date: string) =>
  formatMonthYear(date).replace(/(\w+) \d\d(\d\d)$/, "$1 $2");

const plural = (n: number, one: string, many = `${one}s`) =>
  `${n} ${n === 1 ? one : many}`;

/** One sentence of true facts about the network, for the section head. */
export function networkSummary(network: Network) {
  const changes = network.interchanges.length;
  const { count, from, to } = network.peak;
  const span =
    from === to
      ? formatMonthYear(monthDate(from))
      : `${formatMonthYear(monthDate(from))} to ${formatMonthYear(monthDate(to))}`;
  return `${plural(network.lines.length, "line")}, ${plural(changes, "interchange")}. Up to ${count} lines in service at once, ${span}.`;
}

function MapKey({ className }: { className?: string }) {
  return (
    <ul
      aria-label="Map key"
      className={cn(
        "flex flex-wrap gap-x-6 gap-y-2 font-mono text-mono-sm text-ink-soft",
        className
      )}
    >
      <li className="flex items-center gap-2">
        <svg width="22" height="12" aria-hidden className="overflow-visible">
          <path d="M0 6h16" className="stroke-ink" strokeWidth="5" />
          <circle
            cx="16"
            cy="6"
            r="4.5"
            className="fill-ground stroke-ink"
            strokeWidth="2.5"
          />
        </svg>
        Start or end
      </li>
      <li className="flex items-center gap-2">
        <svg width="12" height="20" aria-hidden>
          <rect
            x="1.5"
            y="1.5"
            width="9"
            height="17"
            rx="4.5"
            className="fill-ground stroke-ink"
            strokeWidth="2.5"
          />
        </svg>
        Interchange
      </li>
      <li className="flex items-center gap-2">
        <svg width="16" height="16" aria-hidden>
          <circle
            cx="8"
            cy="8"
            r="6.5"
            className="fill-signal stroke-ink"
            strokeWidth="2"
          />
          <circle cx="8" cy="8" r="2.2" className="fill-ink" />
        </svg>
        You are here
      </li>
    </ul>
  );
}

/**
 * The experience network: heading, the map, and the line key. The key is
 * the real content (every role, newest first) and each entry lights its
 * line on the map and the indicator.
 */
export function NetworkSection({
  network,
  id = "network",
  headingId = "network-heading",
  linkRoles = true,
  className,
}: {
  network: Network;
  id?: string;
  headingId?: string;
  /** Link each line to its role on /work (home), or to its anchor (on /work). */
  linkRoles?: boolean;
  className?: string;
}) {
  const since = Math.floor(network.from / 12);
  return (
    <section id={id} aria-labelledby={headingId} className={className}>
      <SectionHead
        id={headingId}
        platform="2"
        kicker="Experience"
        title={
          <>
            Experience network{" "}
            <span className="font-medium text-ink-soft">{since} to now</span>
          </>
        }
        aside={
          linkRoles ? (
            <Link
              href="/work"
              className="inline-flex min-h-11 items-center gap-2 border-b-2 border-current text-base leading-none font-bold text-ink"
            >
              Every line in full <span aria-hidden>→</span>
            </Link>
          ) : null
        }
      />
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-baseline lg:justify-between">
        <p className="font-mono text-mono-sm text-ink-soft">
          {networkSummary(network)}
        </p>
        <MapKey />
      </div>
      <NetworkMap network={network} className="mt-8" />
      <ol
        aria-label="Roles, newest first"
        className="mt-8 grid border-t border-rule sm:grid-cols-2 lg:grid-cols-3"
      >
        {network.lines.map((line) => {
          const end = line.endDate ?? new Date();
          const body = (
            <>
              <LineBadge
                line={line.colour}
                name={line.company}
                className="row-span-2 mt-0.5"
              />
              <span className="min-w-0 text-[0.9375rem] leading-snug">
                <b className="font-extrabold">{line.company}</b>{" "}
                <span className="text-ink-soft">{line.title}</span>
              </span>
              <span className="font-mono text-mono-xs text-ink-soft">
                {serviceDates(line.startDate, line.endDate)} ·{" "}
                {formatTenure(line.startDate, end)}
              </span>
            </>
          );
          const className =
            "grid min-h-11 grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 gap-y-1 border-b border-rule py-3.5 pr-4 transition-colors data-[scene-active]:bg-surface fine:hover:bg-surface";
          return (
            <li
              key={line.id}
              style={{ "--c": lineVar(line.colour) } as React.CSSProperties}
            >
              <Link
                href={linkRoles ? `/work#${line.id}` : `#${line.id}`}
                data-scene-item={`role:${line.id}`}
                data-scene-line={line.colour}
                data-scene-label={`${line.company}|${boardDates(line.startDate, line.endDate)}`}
                className={className}
              >
                {body}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
