import * as React from "react";
import { cn } from "@/flavors/jacquard/lib/utils";
import {
  kindNames,
  KINDS,
  pad2,
  yarnClass,
  type Draft,
} from "@/flavors/jacquard/lib/weave";

/** Row layout of the draft: numbers, five shafts, a gap, then one row per pick. */
const SHAFTS = KINDS.length;
const PICKS_AT = SHAFTS + 2;
/**
 * A pick row is 1.5 ends tall (24px against the 16px grid), so each card in
 * the chain beside it is a full 24px target (WCAG 2.5.8) and stays level
 * with its row. The squares keep their size, centred in the taller row.
 */
const PICK = 1.5;
const INSET = (PICK - 0.8) / 2;

/**
 * The weaving draft, the signature (docs/flavors/jacquard.md): the ends across the
 * top threaded on their shafts by kind, the drawdown below with one row per
 * pick, and the card chain beside it where the treadling would sit. It is
 * built from the data, so every square is a true fact: a project uses a
 * technology. `WeaveFocus` makes it answer to the pointer.
 */
export function DraftFigure({
  draft,
  total,
  className,
}: {
  draft: Draft;
  /** Every project, woven or not, for the caption. */
  total: number;
  className?: string;
}) {
  const cols = Math.max(1, draft.ends.length);
  const rows = PICKS_AT + draft.picks.length * PICK;
  const rest =
    draft.omitted > 0
      ? `${draft.picks.length} of the ${total} projects, the ones with a recorded stack. Point at a pick or a thread and the cloth re-weaves around it.`
      : `Every project is a pick. Point at a pick or a thread and the cloth re-weaves around it.`;

  let grid = "";
  for (let x = 0; x <= cols; x++)
    grid += `M${x} 1V${1 + SHAFTS}M${x} ${PICKS_AT}V${rows}`;
  for (let y = 1; y <= 1 + SHAFTS; y++) grid += `M0 ${y}H${cols}`;
  for (let p = 0; p <= draft.picks.length; p++)
    grid += `M0 ${PICKS_AT + p * PICK}H${cols}`;
  const ticks = [1, 5, 10, 15, 20, 25, 30, 35].filter((n) => n < cols);
  if (!ticks.includes(cols)) ticks.push(cols);

  return (
    <figure
      aria-labelledby="draft-caption"
      className={cn("draft m-0 [--c:16px]", className)}
    >
      <div
        className="md:grid md:gap-x-5"
        style={{ gridTemplateColumns: `${cols * 16}px minmax(0, 1fr)` }}
      >
        <svg
          data-draft-grid
          data-cols={cols}
          data-rows={rows}
          data-picks-at={PICKS_AT}
          data-pick={PICK}
          viewBox={`0 0 ${cols} ${rows}`}
          role="img"
          aria-label={`Weaving draft: ${cols} technologies as warp ends, ${draft.picks.length} projects as weft picks. A square is filled where a project uses a technology.`}
          className="block w-full touch-pan-y overflow-visible md:row-span-4"
          style={{ aspectRatio: `${cols} / ${rows}` }}
        >
          {draft.ends.map((end) => (
            <rect
              key={`col-${end.index}`}
              className={cn("col", yarnClass[end.kind])}
              data-e={end.index}
              x={end.index}
              y={PICKS_AT}
              width="1"
              height={draft.picks.length * PICK}
            />
          ))}
          {draft.picks.map((pick) => (
            <rect
              key={`row-${pick.index}`}
              className="row"
              data-p={pick.index}
              x="0"
              y={PICKS_AT + pick.index * PICK}
              width={cols}
              height={PICK}
            />
          ))}
          <path
            d={grid}
            className="fill-none stroke-rule [stroke-width:1] [vector-effect:non-scaling-stroke]"
          />
          <g className="fill-ink-faint font-mono text-[0.56px] max-md:hidden">
            {ticks.map((n) => (
              <text key={n} x={n - 0.5} y="0.72" textAnchor="middle">
                {n}
              </text>
            ))}
          </g>
          {draft.ends.map((end) => (
            <rect
              key={`th-${end.index}`}
              className={cn("th", yarnClass[end.kind])}
              data-e={end.index}
              x={end.index + 0.14}
              y={1 + (SHAFTS - 1 - KINDS.indexOf(end.kind)) + 0.14}
              width=".72"
              height=".72"
            />
          ))}
          <g className="cells">
            {draft.picks.flatMap((pick) =>
              pick.ends.map((e) => {
                const end = draft.ends[e];
                return end ? (
                  <rect
                    key={`c-${pick.index}-${e}`}
                    className={cn("cell", yarnClass[end.kind])}
                    data-e={e}
                    data-p={pick.index}
                    x={e + 0.1}
                    y={PICKS_AT + pick.index * PICK + INSET}
                    width=".8"
                    height=".8"
                    style={{ animationDelay: `${e * 14 + pick.index * 24}ms` }}
                  />
                ) : null;
              })
            )}
          </g>
          <rect
            className="shuttle fill-madder opacity-0"
            data-top={PICKS_AT}
            data-pick={PICK}
            x="-1.4"
            y="0"
            width="1.2"
            height=".3"
            rx=".15"
          />
        </svg>

        <p className="mt-5 mb-2 label md:m-0 md:self-center md:leading-(--c)">
          Threading, by kind
        </p>
        <ol className="flex flex-wrap gap-x-4 gap-y-2 md:grid md:auto-rows-(--c) md:gap-0">
          {[...KINDS].reverse().map((kind) => (
            <li
              key={kind}
              className="flex items-center gap-2 font-mono text-[0.6875rem] leading-none text-ink-soft"
            >
              <i
                aria-hidden
                className={cn("size-2 bg-(--y)", yarnClass[kind])}
              />
              {KINDS.indexOf(kind) + 1} · {kindNames[kind]}
            </li>
          ))}
        </ol>
        <p className="mt-5 mb-2 label md:m-0 md:self-center md:leading-(--c)">
          Card chain, one card per pick
        </p>
        <ol
          aria-label="Projects in the draft"
          className="grid grid-cols-2 gap-x-2.5 md:auto-rows-[calc(var(--c)*1.5)] md:grid-cols-1 md:gap-0"
        >
          {draft.picks.map((pick) => (
            <li key={pick.project.id}>
              <button
                type="button"
                data-weave-pick={pick.index}
                aria-pressed="false"
                aria-describedby="draft-readout"
                className="flex size-full min-h-11 items-center justify-between gap-2.5 rounded-[2px] px-1 font-mono text-[0.6875rem] leading-none text-ink-soft transition-colors duration-(--duration-ui) ease-out aria-pressed:bg-rule aria-pressed:text-ink data-on:bg-rule data-on:text-ink md:min-h-0 fine:hover:bg-rule fine:hover:text-ink [&[data-on]_b]:text-madder"
              >
                <span className="min-w-0 truncate">
                  <b className="mr-2 font-medium text-ink-faint">
                    {pad2(pick.index + 1)}
                  </b>
                  {pick.project.name}
                </span>
                <span className="text-ink-faint">
                  {pick.project.year ?? ""}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-4 grid gap-1.5 border-t border-rule pt-2.5 md:grid-cols-[auto_1fr] md:items-baseline md:gap-4">
        <span id="draft-caption" className="label">
          Fig. 2 · Draft
        </span>
        <span
          id="draft-readout"
          data-draft-readout
          data-rest={rest}
          aria-live="polite"
          className="min-h-[2.9em] text-sm leading-snug text-ink-soft"
        >
          {rest}
        </span>
      </figcaption>
    </figure>
  );
}
