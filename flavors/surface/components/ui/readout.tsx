import { cn } from "@/flavors/surface/lib/utils";

import { Seg } from "./seg";

export type Field = { label: string; value: string; sr?: string };

/** An LCD of labelled seven-segment fields. */
export function Readout({
  fields,
  size = "md",
  className,
}: {
  fields: readonly Field[];
  size?: "md" | "sm";
  className?: string;
}) {
  return (
    <dl
      className={cn(
        "glass inline-flex flex-wrap gap-x-8 gap-y-3 px-4 pt-2.5 pb-3",
        className
      )}
    >
      {fields.map((field) => (
        <div key={field.label}>
          <dt className="legend mb-1.5 text-[0.59375rem]">{field.label}</dt>
          <dd>
            <Seg
              value={field.value}
              label={field.sr}
              className={size === "md" ? "h-9" : "h-7"}
            />
          </dd>
        </div>
      ))}
    </dl>
  );
}
