import * as React from "react";
import { CALIBRE, STACKS, type Sheet } from "@/flavors/calibre/lib/movement";
import { cn } from "@/flavors/calibre/lib/utils";

const nf = new Intl.NumberFormat("en-US");

/**
 * The technical sheet: the calibre's figures, each one counted from the
 * data (docs/calibre.md), set like a watchmaker's spec sheet.
 */
export function TechnicalSheet({
  sheet,
  availability,
  location,
  className,
}: {
  sheet: Sheet;
  availability: string | undefined;
  location: string;
  className?: string;
}) {
  const rows: {
    label: string;
    figure?: React.ReactNode;
    value: React.ReactNode;
    note?: string;
  }[] = [
    {
      label: "Frequency",
      figure: sheet.hz,
      value: `Hz · ${nf.format(sheet.vph)} vph`,
      note: `One hertz per stack: ${STACKS.join(", ")}`,
    },
    {
      label: "Jewels",
      figure: sheet.jewels,
      value: sheet.jewels === 1 ? "project" : "projects",
      note: `${sheet.inView} set in view below`,
    },
    {
      label: "Complications",
      figure: sheet.complications,
      value: sheet.groups.join(", "),
      note: "One per skill group",
    },
    {
      label: "Power reserve",
      value: (
        <span className="text-steel">{availability ?? "Booked for now"}</span>
      ),
    },
    { label: "Assembled", value: location, note: "Remote, UTC+05:30" },
  ];
  return (
    <section aria-labelledby="sheet-title" className={cn("min-w-0", className)}>
      <h2
        id="sheet-title"
        className="flex items-baseline justify-between border-b border-line-strong pb-3 spec"
      >
        Technical sheet <span>{CALIBRE}</span>
      </h2>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-line py-3"
          >
            <dt className="pt-1 spec">{row.label}</dt>
            <dd>
              {row.figure !== undefined ? (
                <span className="mr-1.5 numeral text-[1.625rem] leading-none">
                  {row.figure}
                </span>
              ) : null}
              <span className="text-[0.9375rem]">{row.value}</span>
              {row.note ? (
                <small className="mt-0.5 block text-[0.8125rem] text-soft">
                  {row.note}
                </small>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
