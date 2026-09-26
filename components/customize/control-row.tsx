import * as React from "react";

/** One labelled row of the panel: a mono label on the left, the control on the right. */
export function ControlRow({
  label,
  labelId,
  value,
  children,
}: {
  label: string;
  labelId: string;
  /** Optional readout under the label, e.g. "auto". */
  value?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3">
      <div className="flex min-h-8 flex-col justify-center">
        <span
          id={labelId}
          className="font-mono text-mono-xs tracking-[0.14em] text-graphite uppercase"
        >
          {label}
        </span>
        {value !== undefined && (
          <span className="font-mono text-mono-xs text-pencil tabular-nums">
            {value}
          </span>
        )}
      </div>
      <div className="flex min-h-8 flex-col justify-center gap-2">
        {children}
      </div>
    </div>
  );
}
