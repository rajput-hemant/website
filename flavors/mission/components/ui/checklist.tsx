import * as React from "react";
import { cn } from "@/flavors/mission/lib/utils";

export type ChecklistRow = {
  label: string;
  value: React.ReactNode;
  /** A nominal status: the value in signal red behind a lit lamp. */
  nominal?: boolean;
};

/**
 * Facts set as a pre-flight checklist: mono keys with dotted leaders running
 * to the value, under a heavy ink rule.
 */
export function Checklist({
  rows,
  className,
}: {
  rows: ChecklistRow[];
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "border-t-2 border-ink font-mono text-[0.71875rem] leading-[1.25] tracking-[0.04em] uppercase",
        className
      )}
    >
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-baseline gap-2 border-b border-rule py-2.5"
        >
          <dt className="leader flex-1 text-ink-faint">{row.label}</dt>
          <dd
            className={cn(
              "min-w-0 text-right [overflow-wrap:anywhere]",
              row.nominal && "text-signal"
            )}
          >
            {row.nominal ? (
              <i
                aria-hidden
                className="mr-2 inline-block size-[7px] rounded-full bg-signal align-[1px]"
              />
            ) : null}
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
