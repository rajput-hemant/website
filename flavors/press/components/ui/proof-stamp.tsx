import * as React from "react";
import { cn } from "@/flavors/press/lib/utils";

/**
 * The proof stamp: the press checker's boxes, one ticked. The tick is
 * spoken ("Ticked:"), the boxes are drawn.
 */
export function ProofStamp({
  title,
  date,
  options,
  ticked,
  signed,
  className,
}: {
  title: string;
  date: string;
  options: React.ReactNode[];
  ticked: number;
  signed?: boolean;
  className?: string;
}) {
  const id = React.useId();
  return (
    <div
      role="group"
      aria-labelledby={id}
      className={cn(
        "stamp-ink w-[17rem] max-w-full -rotate-3 border-2 border-blue px-4 pt-3.5 pb-3 font-mono text-[0.6875rem] leading-[1.3] tracking-[0.04em] text-blue uppercase [font-stretch:75%]",
        className
      )}
    >
      <h2
        id={id}
        className="flex justify-between border-b-[1.5px] border-current pb-2.5 font-sans text-[0.9375rem] leading-none font-extrabold tracking-[0.06em]"
      >
        {title}
        <span className="font-mono text-[0.6875rem] font-medium [font-stretch:75%]">
          {date}
        </span>
      </h2>
      <ul className="py-2.5">
        {options.map((option, i) => (
          <li key={i} className="flex items-center gap-2.5 py-[3px]">
            <span
              aria-hidden
              className={cn(
                "relative size-3 flex-none border-[1.5px] border-current",
                i === ticked &&
                  "before:absolute before:inset-x-[-3px] before:top-1 before:h-[1.5px] before:rotate-45 before:bg-current after:absolute after:inset-x-[-3px] after:top-1 after:h-[1.5px] after:-rotate-45 after:bg-current"
              )}
            />
            <span>
              {i === ticked ? <span className="sr-only">Ticked: </span> : null}
              {option}
            </span>
          </li>
        ))}
      </ul>
      {signed ? (
        <p className="flex items-end gap-2.5 border-t-[1.5px] border-current pt-2">
          Signed
          <svg
            viewBox="0 0 120 34"
            aria-hidden
            className="h-[34px] w-[120px] fill-none stroke-current [stroke-width:1.7] [stroke-linecap:round] [stroke-linejoin:round]"
          >
            <path d="M4 28C9 16 13 6 17 7C21 8 15 24 13 31M13 20C19 16 26 15 29 18C31 22 27 29 31 29C37 29 39 16 43 18C47 20 41 30 47 30C55 30 58 10 63 12C67 14 57 31 65 31C72 31 78 22 88 20C98 18 106 24 116 14M40 32C60 27 84 26 110 28" />
          </svg>
        </p>
      ) : null}
    </div>
  );
}
