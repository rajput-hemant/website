import { type ReactNode } from "react";

/** One labelled row of the panel: small mono label on the left, control on the right. */
export function ControlRow({
  label,
  labelId,
  value,
  children,
}: {
  label: string;
  labelId: string;
  /** Optional readout under the label, e.g. "6px". */
  value?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-3">
      <div className="flex min-h-8 flex-col justify-center">
        <span id={labelId} className="meta text-subtle">
          {label}
        </span>
        {value !== undefined && (
          <span className="font-mono text-2xs text-muted tabular-nums">
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
