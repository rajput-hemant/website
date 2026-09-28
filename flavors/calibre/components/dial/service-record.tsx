import {
  arcPath,
  span,
  type ServiceRecord as Record,
} from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

/**
 * The service record: a subdial that spans whole years back from this
 * month, one arc per role (newest outermost, a current role running to the
 * rim), and the roles listed beside it in the same order. The dial is
 * aria-hidden; the list carries every fact.
 */
export function ServiceRecord({
  record,
  size = "sm",
  hrefFor,
  className,
}: {
  record: Record;
  size?: "sm" | "lg";
  hrefFor?: (id: string) => string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-center gap-x-6 gap-y-4",
        size === "lg"
          ? "sm:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
          : "grid-cols-[6.5rem_minmax(0,1fr)]",
        className
      )}
    >
      <ServiceDial record={record} />
      <div className="min-w-0">
        <p className="spec">
          Service record, {record.months} months, outer to inner
        </p>
        <ol className="mt-2 grid text-sm">
          {record.arcs.map((arc) => (
            <li
              key={arc.role.id}
              className="flex items-baseline justify-between gap-3 border-b border-line py-1"
            >
              {hrefFor ? (
                <a
                  href={hrefFor(arc.role.id)}
                  className="min-w-0 truncate fine:hover:text-steel"
                >
                  {arc.role.company}
                </a>
              ) : (
                <span className="min-w-0 truncate">{arc.role.company}</span>
              )}
              <span className="shrink-0 text-soft tabular-nums">
                {span(arc.role)}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

/** The subdial alone: month ticks, year marks and one arc per role. Decorative. */
export function ServiceDial({
  record,
  className,
}: {
  record: Record;
  className?: string;
}) {
  const rings = record.arcs.length;
  const outer = 40;
  const gap = Math.min(5, 26 / Math.max(1, rings));
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden
      focusable="false"
      className={cn("block w-full", className)}
    >
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        className="stroke-line-strong"
        strokeWidth="0.6"
      />
      {Array.from({ length: record.months }, (_, i) => {
        const a = (i / record.months) * Math.PI * 2 - Math.PI / 2;
        const year = (record.start + i) % 12 === 0;
        const r0 = year ? 41 : 44;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * r0}
            y1={50 + Math.sin(a) * r0}
            x2={50 + Math.cos(a) * 47}
            y2={50 + Math.sin(a) * 47}
            className="stroke-ink"
            strokeWidth={year ? 1.2 : 0.4}
            strokeOpacity={year ? 0.9 : 0.5}
          />
        );
      })}
      {record.years.map(({ year, at }) => {
        const a = at * Math.PI * 2 - Math.PI / 2;
        return (
          <text
            key={year}
            x={50 + Math.cos(a) * 36}
            y={50 + Math.sin(a) * 36}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="5"
            className="fill-faint font-spec"
          >
            {String(year).slice(2)}
          </text>
        );
      })}
      {record.arcs.map((arc) => (
        <path
          key={arc.role.id}
          d={arcPath(50, 50, outer - 10 - arc.ring * gap, arc.from, arc.to)}
          fill="none"
          className={arc.current ? "stroke-steel" : "stroke-ink"}
          strokeWidth={Math.max(1.2, gap * 0.55)}
          strokeLinecap="round"
        />
      ))}
      <circle cx="50" cy="50" r="1.6" className="fill-steel" />
    </svg>
  );
}
