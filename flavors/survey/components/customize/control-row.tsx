import * as React from "react";

/** One labelled row of the panel: a map-lettered label on the left, the control on the right. */
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
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3 border-t border-rule pt-4 first:border-t-0 first:pt-0">
      <div className="flex min-h-10 flex-col justify-center">
        <span id={labelId} className="caps text-contour-ink">
          {label}
        </span>
        {value !== undefined && (
          <span className="text-sm text-ink-faint tabular-nums">{value}</span>
        )}
      </div>
      <div className="flex min-h-10 flex-col justify-center gap-2">
        {children}
      </div>
    </div>
  );
}
