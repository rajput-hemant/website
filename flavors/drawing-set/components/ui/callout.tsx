import * as React from "react";
import type { Route } from "next";
import Link from "next/link";
import { cn } from "@/flavors/drawing-set/lib/utils";

export type CalloutProps = {
  letter: string;
  label: string;
  meta?: string;
  href?: Route;
  active?: boolean;
  className?: string;
};

/** A lettered callout bubble with a label; redline on hover, focus or `active`. */
export function Callout({
  letter,
  label,
  meta,
  href,
  active,
  className,
}: CalloutProps) {
  const classes = cn(
    "group/callout grid min-h-11 grid-cols-[1.625rem_1fr] items-center gap-x-3 py-1.5",
    className
  );
  const on = active ? "border-accent text-accent" : "";
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "row-span-2 grid size-6.5 place-items-center rounded-full border border-ink-soft font-mono text-mono-xs font-semibold transition-colors duration-200",
          "group-focus-visible/callout:border-accent group-focus-visible/callout:text-accent fine:group-hover/callout:border-accent fine:group-hover/callout:text-accent",
          on
        )}
      >
        {letter}
      </span>
      <span
        className={cn(
          "font-display text-[0.8125rem] leading-none font-semibold tracking-[0.09em] uppercase [font-stretch:72%] transition-colors duration-200",
          "group-focus-visible/callout:text-accent fine:group-hover/callout:text-accent",
          active && "text-accent"
        )}
      >
        {label}
      </span>
      {meta ? (
        <span className="mt-1 font-mono text-mono-xs leading-snug tracking-[0.08em] text-ink-faint uppercase">
          {meta}
        </span>
      ) : null}
    </>
  );

  if (!href) {
    return (
      <div data-active={active ? "" : undefined} className={classes}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={href}
      data-active={active ? "" : undefined}
      className={cn(classes, "focus-visible:outline-offset-4")}
    >
      {inner}
    </Link>
  );
}
