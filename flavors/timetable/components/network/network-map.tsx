import { lineVar } from "@/flavors/timetable/components/ui/line-badge";
import {
  monthDate,
  type Network,
  type NetworkLine,
} from "@/flavors/timetable/lib/network";
import { cn } from "@/flavors/timetable/lib/utils";

import { formatMonthYear } from "@/lib/format";

const MONTHS = "JAN FEB MAR APR MAY JUN JUL AUG SEP OCT NOV DEC".split(" ");
const monthLabel = (m: number) => MONTHS[m % 12] ?? "";
const upper = (m: number) => formatMonthYear(monthDate(m)).toUpperCase();

const VW = 1344;
const PAD_L = 36;
const PAD_R = 96;
const TOP = 64;
const GAP = 44;
/** Characters of 12.5px Overpass per px, roughly, to keep labels off each other. */
const CHAR = 6.9;

type Props = { network: Network; className?: string };

const lineStyle = (line: NetworkLine) =>
  ({ "--c": lineVar(line.colour) }) as React.CSSProperties;

/**
 * The network, drawn on a true month axis: one coloured line per role, a
 * diagonal where a role continued into the next, interchanges where lines
 * meet and "you are here" on today. Decorative; the list beside it carries
 * the same facts for everyone.
 */
export function NetworkMap({ network, className }: Props) {
  return (
    <div className={cn("min-w-0", className)}>
      <HorizontalMap network={network} className="hidden md:block" />
      <VerticalMap network={network} className="md:hidden" />
    </div>
  );
}

function HorizontalMap({ network, className }: Props) {
  const { from, to, rows, lines, interchanges } = network;
  const span = Math.max(1, to - from);
  const x = (m: number) => PAD_L + ((m - from) / span) * (VW - PAD_L - PAD_R);
  const y = (row: number) => TOP + row * GAP;
  const axisY = TOP + (rows - 1) * GAP + 36;
  const height = axisY + 34;
  const here = lines.filter((line) => line.current);
  const labelled = new Set<number>([from, to]);
  for (const line of lines) {
    labelled.add(line.from);
    if (!line.current) labelled.add(line.to);
  }
  const years: number[] = [];
  for (let m = Math.ceil(from / 12) * 12; m <= to; m += 12) years.push(m);

  const paths = lines.map((line) => {
    const x0 = x(line.from);
    const x1 = Math.max(x(line.to), x0 + 2);
    const yRow = y(line.row);
    if (line.branchFrom === null) {
      return { line, d: `M${x0} ${yRow}H${x1}`, len: x1 - x0, start: x0 };
    }
    const yFrom = y(line.branchFrom);
    const dy = Math.abs(yRow - yFrom);
    const knee = Math.min(x0 + dy, x1);
    return {
      line,
      d: `M${x0} ${yFrom}L${knee} ${yRow}H${x1}`,
      len: Math.hypot(knee - x0, dy) + (x1 - knee),
      start: knee,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${VW} ${height}`}
      aria-hidden
      focusable="false"
      data-network
      data-draw-root
      className={cn("block h-auto w-full overflow-visible", className)}
    >
      <g className="stroke-rule [stroke-dasharray:4_5]" strokeWidth="1.5">
        {years.map((m) => (
          <line key={m} x1={x(m)} x2={x(m)} y1={TOP - 44} y2={axisY - 8} />
        ))}
      </g>
      <g className="fill-ink-faint font-mono text-[11px] font-semibold tracking-[0.06em]">
        <text x={x(from)} y={TOP - 48}>
          {Math.floor(from / 12)}
        </text>
        {years.map((m) => (
          <text key={m} x={x(m) + 8} y={TOP - 48}>
            {m / 12}
          </text>
        ))}
      </g>

      <g className="stroke-ink-faint" strokeWidth="1">
        <path d={`M${x(from)} ${axisY}H${x(to)}`} className="stroke-rule" />
        {Array.from({ length: span + 1 }, (_, i) => {
          const m = from + i;
          const long = m % 12 === 0 || labelled.has(m);
          return <path key={m} d={`M${x(m)} ${axisY}v${long ? 6 : 4}`} />;
        })}
      </g>
      <g className="fill-ink-faint font-mono text-[11px] font-semibold tracking-[0.06em]">
        {[...labelled].map((m) => (
          <text key={m} x={x(m)} y={axisY + 22} textAnchor="middle">
            {monthLabel(m)}
          </text>
        ))}
      </g>

      {paths.map(({ line, d, len, start }, i) => {
        const next = lines
          .filter((other) => other.row === line.row && other.from > line.from)
          .map((other) => x(other.from))
          .sort((a, b) => a - b)[0];
        const room = (next ?? VW) - start - 28;
        const dates = `${upper(line.from)} TO ${line.current ? "NOW" : upper(line.to)}`;
        const full = line.company.length + line.title.length + dates.length + 6;
        const showTitle = full * CHAR < room;
        const showDates =
          (line.company.length + dates.length + 3) * CHAR < room;
        return (
          <g
            key={line.id}
            data-line
            data-scene-item={`role:${line.id}`}
            style={lineStyle(line)}
            className="transition-opacity duration-200"
          >
            <path
              d={d}
              className="fill-none stroke-transparent"
              strokeWidth="26"
            />
            <path
              d={d}
              className="draw-line fill-none stroke-(--c)"
              strokeWidth="7"
              strokeLinejoin="round"
              style={
                {
                  "--len": len.toFixed(1),
                  "--delay": `${i * 90}ms`,
                } as React.CSSProperties
              }
            />
            <text x={start + 14} y={y(line.row) - 14} className="text-[12.5px]">
              <tspan className="fill-ink font-extrabold">{line.company}</tspan>
              {showTitle ? (
                <tspan dx="8" className="fill-ink-soft">
                  {line.title}
                </tspan>
              ) : null}
              {showDates ? (
                <tspan
                  dx="12"
                  className="fill-ink-faint font-mono text-[11px] font-medium"
                >
                  {dates}
                </tspan>
              ) : null}
            </text>
          </g>
        );
      })}

      <g className="fill-ground stroke-ink" strokeWidth="3">
        {lines.map((line) => {
          const joint = interchanges.some(
            (ix) => ix.kind === "joint" && ix.ids.includes(line.id)
          );
          const starts = line.branchFrom === null && !joint;
          const ends =
            !line.current &&
            !interchanges.some(
              (ix) => ix.kind === "change" && ix.ids[0] === line.id
            );
          return (
            <g key={line.id} style={lineStyle(line)} className="stroke-(--c)">
              {starts ? (
                <circle cx={x(line.from)} cy={y(line.row)} r="6" />
              ) : null}
              {ends ? <circle cx={x(line.to)} cy={y(line.row)} r="6" /> : null}
            </g>
          );
        })}
        {interchanges.map((ix) => {
          const cx = x(ix.at);
          const top = y(Math.min(...ix.rows));
          const bottom = y(Math.max(...ix.rows));
          return ix.rows.length > 1 ? (
            <rect
              key={`${ix.kind}-${ix.at}`}
              x={cx - 8}
              y={top - 8}
              width="16"
              height={bottom - top + 16}
              rx="8"
            />
          ) : (
            <circle key={`${ix.kind}-${ix.at}`} cx={cx} cy={top} r="9" />
          );
        })}
      </g>

      {here.map((line) => (
        <g key={line.id}>
          <circle
            cx={x(to)}
            cy={y(line.row)}
            r="12"
            className="here-pulse fill-none stroke-signal"
            strokeWidth="3"
          />
          <circle
            cx={x(to)}
            cy={y(line.row)}
            r="12"
            className="fill-signal stroke-ink"
            strokeWidth="2.5"
          />
          <circle cx={x(to)} cy={y(line.row)} r="4" className="fill-ink" />
          <text
            x={x(to) + 22}
            y={y(line.row) - 2}
            className="fill-ink text-[12.5px] font-extrabold"
          >
            You are here
          </text>
          <text
            x={x(to) + 22}
            y={y(line.row) + 13}
            className="fill-ink-soft font-mono text-[11px] font-medium"
          >
            {upper(to)}
          </text>
        </g>
      ))}
    </svg>
  );
}

const V_COL = 24;
const V_TOP = 34;
const V_STEP = 58;

/** Mobile: a line diagram, one evenly spaced station per event, top to bottom. */
function VerticalMap({ network, className }: Props) {
  const { rows, lines, events } = network;
  const cx = (row: number) => 20 + row * V_COL;
  const cy = (i: number) => V_TOP + i * V_STEP;
  const textX = cx(rows - 1) + 30;
  const height = cy(events.length - 1) + 30;
  const eventOf = (id: string, at: number) =>
    Math.max(
      0,
      events.findIndex((e) => e.at === at && e.ids.includes(id))
    );

  return (
    <svg
      viewBox={`0 0 358 ${height}`}
      aria-hidden
      focusable="false"
      data-network
      className={cn("block h-auto w-full overflow-visible", className)}
    >
      {lines.map((line) => {
        const i0 = eventOf(line.id, line.from);
        const i1 = line.current ? events.length - 1 : eventOf(line.id, line.to);
        const x = cx(line.row);
        const d =
          line.branchFrom === null
            ? `M${x} ${cy(i0)}V${cy(i1)}`
            : `M${cx(line.branchFrom)} ${cy(i0)}L${x} ${cy(i0) + Math.abs(x - cx(line.branchFrom))}V${cy(i1)}`;
        return (
          <g
            key={line.id}
            data-line
            data-scene-item={`role:${line.id}`}
            style={lineStyle(line)}
          >
            <path
              d={d}
              className="fill-none stroke-(--c)"
              strokeWidth="6"
              strokeLinejoin="round"
            />
          </g>
        );
      })}
      <g className="fill-ground" strokeWidth="2.5">
        {events.map((event, i) => {
          const touched = lines.filter((line) => event.ids.includes(line.id));
          const rowsAt = touched.map((line) =>
            event.kind === "change" && line.branchFrom !== null
              ? line.branchFrom
              : line.row
          );
          if (event.kind === "here") return null;
          if (rowsAt.length > 1 && event.kind !== "change") {
            const a = Math.min(...rowsAt);
            const b = Math.max(...rowsAt);
            return (
              <rect
                key={i}
                x={cx(a) - 8}
                y={cy(i) - 8}
                width={cx(b) - cx(a) + 16}
                height="16"
                rx="8"
                className="stroke-ink"
              />
            );
          }
          const row = rowsAt[0] ?? 0;
          return (
            <circle
              key={i}
              cx={cx(row)}
              cy={cy(i)}
              r={event.kind === "change" ? 8 : 5.5}
              className={
                event.kind === "change" ? "stroke-ink" : "stroke-(--c)"
              }
              style={touched[0] ? lineStyle(touched[0]) : undefined}
            />
          );
        })}
      </g>
      {lines
        .filter((line) => line.current)
        .map((line) => (
          <g key={line.id}>
            <circle
              cx={cx(line.row)}
              cy={cy(events.length - 1)}
              r="11"
              className="here-pulse fill-none stroke-signal"
              strokeWidth="3"
            />
            <circle
              cx={cx(line.row)}
              cy={cy(events.length - 1)}
              r="11"
              className="fill-signal stroke-ink"
              strokeWidth="2.5"
            />
            <circle
              cx={cx(line.row)}
              cy={cy(events.length - 1)}
              r="3.6"
              className="fill-ink"
            />
          </g>
        ))}
      {events.map((event, i) => (
        <text key={i} x={textX} y={cy(i) - 3}>
          <tspan className="fill-ink-faint font-mono text-[10.5px] font-semibold tracking-[0.04em]">
            {upper(event.at)}
          </tspan>
          <tspan
            x={textX}
            dy="16"
            className={cn(
              "fill-ink text-[12.5px]",
              event.kind === "here" ? "font-extrabold" : "font-medium"
            )}
          >
            {event.text}
          </tspan>
        </text>
      ))}
    </svg>
  );
}
