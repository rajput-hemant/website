import * as React from "react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

export type ScheduleColumn = {
  key: string;
  label: string;
  align?: "left" | "right" | "center";
  className?: string;
};

export type ScheduleRow = Record<string, React.ReactNode>;

export type ScheduleProps<R extends ScheduleRow = ScheduleRow> = {
  /** The table's accessible caption (visually hidden; the sheet heading shows it). */
  caption: string;
  columns: ScheduleColumn[];
  rows: R[];
  rowHref?: (row: R) => Route;
  className?: string;
};

const alignClass = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

/** A drawing schedule / register: a real table with hairline rows and a redline margin tick on hover. */
export function Schedule<R extends ScheduleRow = ScheduleRow>({
  caption,
  columns,
  rows,
  rowHref,
  className,
}: ScheduleProps<R>) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "border-b border-line pr-6 pb-3 align-bottom font-mono text-mono-xs font-medium tracking-[0.12em] text-ink-faint uppercase last:pr-0",
                  alignClass[column.align ?? "left"],
                  column.className
                )}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const href = rowHref?.(row);
            return (
              <tr
                key={i}
                className={cn(
                  "group/row transition-colors duration-200",
                  href && "relative",
                  "fine:hover:bg-linear-to-r fine:hover:from-ink/4 fine:hover:to-transparent"
                )}
              >
                {columns.map((column, c) => {
                  const cell = row[column.key];
                  const cellClass = cn(
                    "border-b border-line py-6 pr-6 align-top font-normal last:pr-0",
                    alignClass[column.align ?? "left"],
                    c === 0 &&
                      "font-mono text-mono-xs leading-8 tracking-[0.06em] text-ink-faint uppercase sm:w-30",
                    c === 0 &&
                      "group-focus-within/row:text-accent group-focus-within/row:before:content-['→_'] fine:group-hover/row:text-accent fine:group-hover/row:before:content-['→_']",
                    column.className
                  );
                  if (c > 0) {
                    return (
                      <td key={column.key} className={cellClass}>
                        {cell}
                      </td>
                    );
                  }
                  return (
                    <th key={column.key} scope="row" className={cellClass}>
                      {href ? (
                        <Link
                          href={href}
                          className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
                        >
                          {cell}
                        </Link>
                      ) : (
                        cell
                      )}
                    </th>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
